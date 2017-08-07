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
    protected abstract isConnected(): boolean;
    protected abstract connect(): void;
    protected abstract disconnect(): void;
    protected abstract inTransaction(): boolean;
    protected abstract startTransaction(): void;
    protected abstract commit(): void;
    protected abstract rollback(): void;
    protected abstract executeSQL(sql: string, fetchResultSet?: boolean, 
        callback?: (record: DB.Record) => boolean | void,
        params?: Object[]): boolean;
    
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
    protected query(sql: string, namedParams?: DB.Field[], unnamedParams?: Object[], callback?: (record: DB.Record) => boolean | void): boolean{
        let params = [];
        sql = this.processParams(sql, params, namedParams, unnamedParams);

        if (!this.isConnected())
          this.connect();
        return this.executeSQL(sql, true, callback, params);
    }

    protected exec(sql: string, namedParams?: DB.Field[], unnamedParams?: Object[]): void {
        let params = [];
        sql = this.processParams(sql, params, namedParams, unnamedParams);
        
        if (!this.isConnected())
          this.connect();
        this.executeSQL(sql, false, null, params);
    }

    //Meta-data queries
    protected abstract createTable(tableDef: DB.TableDefinition): void;
    protected abstract dropTable(tableName: string): void;
    protected abstract tableExists(tableName: string): boolean;
    
    //Replication meta-data
    protected abstract customMetadataExists(objectName: string, objectType: string): boolean;
    protected abstract createCustomMetadata(metadata: DB.CustomMetadataDefinition): void;
        
    addNode(nodeName: string): void {
        if (!this.query("select login from RPL$USERS where login = ?", null, [nodeName])) 
            this.exec('insert into RPL$USERS (LOGIN, CONFIG_NAME) values (?, ?)', null, [nodeName, this.configName]);
        if (this.inTransaction())
            this.commit();
    }
    
    async initReplicationMetadata(): Promise<void> {
        //TODO: Handle updating tables (missing fields) based on defs
        for (let tableDef of RPLTableDefs) {
            if (!this.tableExists(tableDef.tableName))
                this.createTable(tableDef);
        };
        for (let def of this.dbDefinition.customMetadata) {
            if (!this.customMetadataExists(def.objectName, def.objectType))
                this.createCustomMetadata(def);
        };
    }

    async clearReplicationMetadata(): Promise<void> {
        for (let tableDef of RPLTableDefs) {
            if (this.tableExists(tableDef.tableName))
                this.dropTable(tableDef.tableName);
        };
    }

    //Trigger management
    protected abstract getTriggerName(tableName: string): string;
    protected abstract getTriggerSQL(tableOptions: TableOptions, callback: (triggerName: string, sql: string) => void): void;
    protected abstract triggerExists(triggerName: string): boolean;

    createTriggers(tableOptions: TableOptions): void {
        this.getTriggerSQL(tableOptions, (triggerName, sql) => {
            if (!this.triggerExists(triggerName))
                this.exec(sql);
        });
    }
    dropTriggers(tableName: string): void {
        throw new Error('Method not implemented.')
    }

    //REPLICATION FEATURES
    
    //LOCAL TO REMOTE

    async getTransactionsToReplicate(destNode: string): Promise<number[]> {
        let transactions: number[] = [];
        //First get rid of previous replication cycles
        this.exec('delete from RPL$BLOCKS where node_name = ?', null, [destNode]);
        this.commit();

        this.query("select transaction_number, max(code) from RPL$LOG where login = ? " +
        "group by transaction_number order by 2", null, [destNode],
        (record) => {
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
        this.query('select * from rpl$log where transaction_number = ? and login = ? and code > ? order by code', 
        null, [transaction_number, destNode, minCode],
        (record: DB.Record): boolean => {
            let rec = new ReplicationRecord();
            let pkFields = this.parseKeys(<string>record.fieldByName('primary_key_fields').value);
            let pkValues = this.parseKeys(<string>record.fieldByName('primary_key_values').value);

            rec.code = <number>record.fieldByName('code').value;
            rec.tableName = <string>record.fieldByName('table_name').value;
            rec.primaryKeys = this.parseKeyValues(rec.tableName, pkFields, pkValues);
            rec.operationType = <string>record.fieldByName('operation_type').value;
            rec.changedFields = this.getChangedFields(<string>record.fieldByName('change_number').value, <string>record.fieldByName('login').value);
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

    protected getChangedFields(change_number: string, nodeName: string): DB.Field[] {
        let fields: DB.Field[] = [];
        this.query("select * from RPL$LOG_VALUES where CHANGE_NUMBER = ? and node_name = ?", null, [change_number, nodeName],
        (record) => {
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
        this.exec(sql, null, [transaction_number, destNode, maxCode]);
        this.commit();
    }

    //REMOTE TO LOCAL
    protected abstract setReplicatingNode(origNode: string): void;
    protected abstract checkRowExists(record: ReplicationRecord): boolean;

    protected abstract getDataTypesOfFields(tableName: string, keyName: string[]): DB.DataType[];

    protected abstract parseFieldValue(dataType: DB.DataType, fieldValue: string): Object;    

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

    private parseKeyValues(tableName: string, keyNames: string[], keyValues: string[]): DB.Field[] {        
        let result: DB.Field[] = [];
        let keyTypes: DB.DataType[] = this.getDataTypesOfFields(tableName, keyNames);
        keyNames.forEach((keyName, index) => {
            let f = new DB.Field();
            f.fieldName = keyName;
            f.dataType = keyTypes[index];
            f.value = this.parseFieldValue(f.dataType, keyValues[index]);           
            result.push(f);
        })
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
        if (!this.isConnected())
            this.connect();
        this.startTransaction();

        try {
            //Check if transactionID/blockID is in RPL$BLOCKS
            //If so, the block has already been replicated: do nothing
            if (!this.query("select code from RPL$BLOCKS where TR_NUMBER = ? and CODE = ? and NODE_NAME = ?", 
                null, [block.transactionID, block.maxCode, origNode])) 
            {          
                //Insert blockID into RPL$TRANSACTIONS
                this.exec('insert into RPL$BLOCKS (TR_NUMBER, CODE, NODE_NAME) values (?, ?, ?)', null, 
                    [block.transactionID, block.maxCode, origNode]);                

                //Initialize replicating node to avoid bouncing
                this.setReplicatingNode(origNode);
                
                //Replicate records in block
                for (let record of block.records) {
                    let rowExists = this.checkRowExists(record);
                    let keyValues = record.primaryKeys.map<string>(f => '"' + <string>f.value + '"').join(', ');                    
                    if (!rowExists && (record.operationType == "U" || record.operationType == "D")) 
                        throw new Error(`Can't find record : Table: ${record.tableName} Keys: [${keyValues}]!`);
                    else if (rowExists && (record.operationType == "I")) 
                        throw new Error(`Row to be inserted already exists: Table: ${record.tableName} Keys: [${keyValues}]!`);
                    
                    let sql = this.getSQLStatement(record);
                    this.exec(sql, record.changedFields, this.getWhereFieldValues(record));
                };
            }            
            //Commit or rollback if error
            this.commit();
        }
        catch (E) {
            this.rollback();
            throw E;
        }
        this.disconnect();
    }

}

