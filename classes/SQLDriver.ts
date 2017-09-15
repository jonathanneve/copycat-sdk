import * as DB from './DB'
import {Driver, ReplicationBlock, ReplicationRecord} from './Driver'
import {TableOptions} from '../interfaces/Nodes'

const RPLTableDefs: DB.TableDefinition[] = require("../data/rpltables.json")

RPLTableDefs.forEach((table) => {
    table.fieldDefs.forEach((field) => {
        let dt = DB.DataType[field.dataTypeStr];
        if (!dt)
            throw new Error("Incorrect datatype: " + field.dataTypeStr);
        field.dataType = dt;
    })
});

//Maximum number of rows per replication block
const BLOCKSIZE = 100;

export abstract class SQLDriver extends Driver {
    //DB-Driver-specific definitions
    protected dbDefinition: DB.DatabaseDefinition;

    protected constructor(dbDef: DB.DatabaseDefinition) {
        super();
        this.dbDefinition = dbDef;
    }

    //Basic SQL functions
    protected abstract isConnected(): Promise<boolean>;
    protected abstract connect(): Promise<void>;
    protected abstract disconnect(): Promise<void>;
    protected abstract inTransaction(): Promise<boolean>;
    protected abstract startTransaction(): Promise<void>;
    protected abstract commit(): Promise<void>;
    protected abstract rollback(): Promise<void>;
    protected abstract executeSQL(sql: string, fetchResultSet?: boolean, 
        callback?: (record: DB.Record) => Promise<boolean | void>,
        params?: Object[]): Promise<boolean>;
    
    private processParams(sql: string, resultParams: Object[], namedParams?: DB.Field[], unnamedParams?: Object[]): string{
        let unnamedParamIndex = 0;
        if (namedParams || unnamedParams) {
            //TODO: replace param names by ? and add corresponding values to params in the right position
            sql = sql.replace(/(:\w+)|\?/g, (substr: string): string => {
                if (substr == "?"){
                    if (unnamedParams) {
                        resultParams.push(unnamedParams[unnamedParamIndex]);
                        unnamedParamIndex++;
                    }
                }
                else if (namedParams) {
                    let paramName = substr.substring(1);
                    let param = namedParams.find(p => p.fieldName == paramName);
                    resultParams.push(param.value);
                }
                return "?";
            });
        }
        return sql; 
    }
    protected async query(sql: string, namedParams?: DB.Field[], unnamedParams?: Object[], callback?: (record: DB.Record) => Promise<boolean | void>): Promise<boolean>{
        let params = [];
        sql = this.processParams(sql, params, namedParams, unnamedParams);

        if (! await this.isConnected())
            await this.connect();
        return await this.executeSQL(sql, true, callback, params);
    }

    protected async exec(sql: string, namedParams?: DB.Field[], unnamedParams?: Object[]): Promise<void> {
        let params = [];
        sql = this.processParams(sql, params, namedParams, unnamedParams);
        
        if (! await this.isConnected())
          await this.connect();
        await this.executeSQL(sql, false, null, params);
    }

    //Meta-data queries
    protected abstract dropTable(tableName: string): Promise<void>;
    protected abstract tableExists(tableName: string): Promise<boolean>;    
//    abstract createTable(table: DB.TableDefinition): Promise<void>;
//    abstract updateTable(table: DB.TableDefinition): Promise<void>;
    
    //Replication meta-data
    protected abstract customMetadataExists(objectName: string, objectType: string): Promise<boolean>;
    protected abstract createCustomMetadata(metadata: DB.CustomMetadataDefinition): Promise<void>;
        
    async addNode(nodeName: string): Promise<void> {
        if (!await this.query("select login from RPL$USERS where login = ?", null, [nodeName])) 
            await this.exec('insert into RPL$USERS (LOGIN, CONFIG_NAME) values (?, ?)', null, [nodeName, this.configName]);
        if (await this.inTransaction())
            await this.commit();
    }
    
    async initReplicationMetadata(): Promise<void> {
        //TODO: Handle updating tables (missing fields) based on defs
        for (let tableDef of RPLTableDefs) {
            if (!await this.tableExists(tableDef.tableName))
                await this.createTable(tableDef);
        };
        for (let def of this.dbDefinition.customMetadata) {
            if (!await this.customMetadataExists(def.objectName, def.objectType))
                await this.createCustomMetadata(def);
        };
    }

    async clearReplicationMetadata(): Promise<void> {
        for (let tableDef of RPLTableDefs) {
            if (await this.tableExists(tableDef.tableName))
                await this.dropTable(tableDef.tableName);
        };
    }

    //Trigger management
    protected abstract getTriggerNames(tableName: string): Promise<string[]>;
    protected abstract getTriggerSQL(tableOptions: TableOptions, callback: (triggerName: string, sql: string) => Promise<boolean>): Promise<void>;
    public abstract triggerExists(triggerName: string): Promise<boolean>;
    public abstract dropTriggers(tableName: string): Promise<void>;

    async createTriggers(tableOptions: TableOptions): Promise<void> {
        await this.getTriggerSQL(tableOptions, async (triggerName, sql): Promise<boolean> => {
            if (! await this.triggerExists(triggerName))
                await this.exec(sql);
            return true;
        });        
    }
    

    //REPLICATION FEATURES
    
    //LOCAL TO REMOTE

    async getTransactionsToReplicate(destNode: string): Promise<number[]> {
        let transactions: number[] = [];
        //First get rid of previous replication cycles
        await this.exec('delete from RPL$BLOCKS where node_name = ?', null, [destNode]);
        await this.commit();

        await this.query("select transaction_number, max(code) from RPL$LOG where login = ? " +
        "group by transaction_number order by 2", null, [destNode],
        async (record) => {
            transactions.push(<number>record.fieldByName('transaction_number').value);
        });
        return transactions;
    }

    async getRowsToReplicate(destNode: string, transaction_number: number, minCode?: number): Promise<ReplicationBlock>{
        if (!minCode)
          minCode = -1;
        let block = new ReplicationBlock();                     

        //We assume the whole transaction has been sent, and set transactionFinished 
        //to false only if there are more than BLOCKSIZE records
        block.transactionFinished = true; 
        block.maxCode = -1;
        await this.query('select * from rpl$log where transaction_number = ? and login = ? and code > ? order by code', 
        null, [transaction_number, destNode, minCode],
        async (record: DB.Record): Promise<boolean> => {
            let rec = new ReplicationRecord();
            let pkFields = this.parseKeys(<string>record.fieldByName('primary_key_fields').value);
            let pkValues = this.parseKeys(<string>record.fieldByName('primary_key_values').value);

            rec.code = <number>record.fieldByName('code').value;
            rec.tableName = <string>record.fieldByName('table_name').value;
            rec.primaryKeys = await this.parseKeyValues(rec.tableName, pkFields, pkValues);
            rec.operationType = <string>record.fieldByName('operation_type').value;
            rec.changedFields = await this.getChangedFields(<string>record.fieldByName('change_number').value, <string>record.fieldByName('login').value);
            block.records.push(rec);
            if (block.records.length >= BLOCKSIZE) {
                block.maxCode = <number>record.fieldByName('code').value;         
                block.transactionFinished = false;
                return false;
            }
            //The return value indicates whether we want to continue reading the dataset or not
            return true;
        });
        block.transactionID = transaction_number;
        block.transactionFinished = true;
        return block;
    }
    
    protected abstract getFieldType(sqlType: number): DB.DataType;

    protected async getChangedFields(change_number: string, nodeName: string): Promise<DB.Field[]> {
        let fields: DB.Field[] = [];
        await this.query("select * from RPL$LOG_VALUES where CHANGE_NUMBER = ? and node_name = ?", null, [change_number, nodeName],
        async (record) => {
            let f: DB.Field = new DB.Field();
            f.fieldName = <string>record.fieldByName('field_name').value;
            if (record.fieldByName('new_value_blob').isNull)
                f.value = record.fieldByName('new_value').value;
            else
                f.value = record.fieldByName('new_value_blob').value;
            f.dataType = this.getFieldType(<number>record.fieldByName('field_type').value);
            
            fields.push(f);
        });
        return fields;
    }

    async validateBlock(transaction_number: number, maxCode: number, destNode: string): Promise<void>{
        let sql = 'delete from RPL$LOG where transaction_number = ? and login = ?';
        if (maxCode > -1)
            sql = sql + " and code <= ?";
        await this.exec(sql, null, [transaction_number, destNode, maxCode]);
        await this.commit();
    }

    //REMOTE TO LOCAL
    protected abstract setReplicatingNode(origNode: string): Promise<void>;
    protected abstract checkRowExists(record: ReplicationRecord): Promise<boolean>;
    protected abstract getDataTypesOfFields(tableName: string, keyName: string[]): Promise<DB.DataType[]>;
    protected abstract parseFieldValue(dataType: DB.DataType, fieldValue: string): Promise<Object>;    

    protected getSQLStatement(record: ReplicationRecord): string {
        if (record.operationType == "I") {
            return 'insert into ' + record.tableName + " ( " +
                record.changedFields.map<string>(f => f.fieldName).join(', ') +
                ' ) values (' +
                record.changedFields.map<string>(f => ":" + f.fieldName).join(', ') +
                ')';                
        }
        else if (record.operationType == "U") {
            return 'update ' + record.tableName + " set " +
                record.changedFields.map<string>(f => f.fieldName + " = :" + f.fieldName).join(', ') +
                this.getWhereClause(record);               
        }
        else if (record.operationType == "D") {
            return 'delete from ' + record.tableName + " " + this.getWhereClause(record);
        }
    }

    private parseKeys(keys: string): string[] {        
        let result: string[] = [];
        let escaped = false;
        let inQuote = false;
        let isNull = false;
        let expr = "";        

        let endExpression = () => {            
            if (isNull)
                result.push(null);
            else
                result.push(expr);
            escaped = false;
            inQuote = false;
            isNull = false;
            expr = "";     
        };

        for (let i=0; i<keys.length; i++) {
            let c = keys.charAt(i);
            isNull = false;
            if ((c == "'") && !escaped) {
                if (!inQuote)
                    inQuote = true;
                else
                    escaped = true;
            }
            else if (escaped && (c != "'")) {
                endExpression();
            }
            else if (!inQuote && (c == '"')) {
                isNull = true;
                i++;
                endExpression();
            }
            else {
                expr = expr + c;
                escaped = false;
            }
        }
        if (escaped)
            endExpression();

        return result;
    }

    private async parseKeyValues(tableName: string, keyNames: string[], keyValues: string[]): Promise<DB.Field[]> {        
        let result: DB.Field[] = [];
        let keyTypes: DB.DataType[] = await this.getDataTypesOfFields(tableName, keyNames);
        for (let keyName of keyNames){
            let f = new DB.Field();
            let index = keyNames.indexOf(keyName);
            f.fieldName = keyName;
            f.dataType = keyTypes[index];
            f.value = await this.parseFieldValue(f.dataType, keyValues[index]);           
            result.push(f);
        }
        return result;
    }

    protected getWhereClause(record: ReplicationRecord): string {
        return ' where ' + record.primaryKeys.map<string>(f => f.fieldName + " = ?").join(' and ');
    }
    protected getWhereFieldValues(record: ReplicationRecord): Object[]{
        return record.primaryKeys.map(f => f.value);    
    }

    async replicateBlock(origNode: string, block: ReplicationBlock):Promise<void>  {
        //Connect and start transaction 
        if (!await this.isConnected())
            await this.connect();
        await this.startTransaction();

        try {
            //Check if transactionID/blockID is in RPL$BLOCKS
            //If so, the block has already been replicated: do nothing
            if (!await this.query("select code from RPL$BLOCKS where TR_NUMBER = ? and CODE = ? and NODE_NAME = ?", 
                null, [block.transactionID, block.maxCode, origNode])) 
            {          
                //Insert blockID into RPL$TRANSACTIONS
                await this.exec('insert into RPL$BLOCKS (TR_NUMBER, CODE, NODE_NAME) values (?, ?, ?)', null, 
                    [block.transactionID, block.maxCode, origNode]);                

                //Initialize replicating node to avoid bouncing
                await this.setReplicatingNode(origNode);
                
                //Replicate records in block
                for (let record of block.records) {
                    let rowExists = await this.checkRowExists(record);
                    let keyValues = record.primaryKeys.map<string>(f => '"' + <string>f.value + '"').join(', ');                    
                    if (!rowExists && (record.operationType == "U" || record.operationType == "D")) 
                        throw new Error(`Can't find record : Table: ${record.tableName} Keys: [${keyValues}]!`);
                    else if (rowExists && (record.operationType == "I")) 
                        throw new Error(`Row to be inserted already exists: Table: ${record.tableName} Keys: [${keyValues}]!`);
                    
                    let sql = this.getSQLStatement(record);
                    await this.exec(sql, record.changedFields, this.getWhereFieldValues(record));
                };
            }            
            //Commit or rollback if error
            await this.commit();
        }
        catch (E) {
            await this.rollback();
            throw E;
        }
        await this.disconnect();
    }

}

