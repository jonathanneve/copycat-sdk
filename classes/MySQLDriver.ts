import * as DB from './DB';
import { SQLDriver } from "./SQLDriver";
import { TableDefinition, CustomMetadataDefinition, DataType } from "./DB";
import { TableOptions } from "../interfaces/Nodes";
import { DataRow } from "./Driver";
import * as MySQL from 'mysql'

export class MySQLDriver extends SQLDriver {    
    connected : boolean = false;
    transactionActive: boolean = false;
    connection : MySQL.Connection
    
 // Connection
 constructor(Config : MySQL.ConnectionConfig) {
    super({
            "databaseType": "MySQL",
            "customMetadata": [],
            "triggerTemplates": []
        });

        this.connection = MySQL.createConnection(Config);        
    
    }
    
        
    public async isConnected(): Promise<boolean> {
        return this.connected;
    }
    public async connect(): Promise<void> {
        await this.connection.connect();
        this.connected = true;
    }
    public async disconnect(): Promise<void> {
        await this.connection.end();
        this.connected = false;
    }
    public async inTransaction(): Promise<boolean> {
        return this.transactionActive;
    }
    public async startTransaction(): Promise<void> {
        await this.connection.query("BEGIN");
        this.transactionActive = true;
    }
    public async commit(): Promise<void> {
        await this.connection.query("COMMIT");
        this.transactionActive = false;
    }
    public async rollback(): Promise<void> {
        await this.connection.query("ROLLBACK");
        this.transactionActive = false;
    }
    public async executeSQL(sql: string, autocreateTR: boolean, fetchResultSet?: boolean, 
        callback?: (record: DB.Record) => Promise<boolean | void>, params?: Object[]): Promise<boolean> {                
        let autoStartTR: boolean = autocreateTR && !await this.inTransaction();
        if (autoStartTR)
            await this.startTransaction();
            
        try {
            let query = new Promise<boolean>((resolve, reject) =>{
                this.connection.query(sql, params, (err, results, fields)=>{  
                    if (err) 
                        throw new Error(err.message);

                    if (fetchResultSet) {
                        if (callback) {
                           if(results && results.length > 0) {            
                                let resultIndex = 0;                                    
                                let sendResults = () => {                                       
                                    let record = new DB.Record();
                                    let fieldIndex = 0;
                                    for (let field of fields) {
                                        let fieldname = field.name
                                        let f: DB.Field = record.addField(fieldname)
                                        f.value = results[resultIndex][fieldname];
                                        fieldIndex++
                                    }
                                    callback(record).then((result) => {
                                        if ((typeof result === "boolean") && !result)
                                            resolve(true);
                                        else{
                                            resultIndex++
                                            if (resultIndex == results.length) {
                                                resolve(true);
                                            }
                                            else{
                                                sendResults();
                                            }
                                        }
                                    })
                                };
                                sendResults();                                                                                                                         
                            }
                            else{
                               resolve(false);
                            }
                        }
                        else{ 
                            resolve((results && results.length > 0));
                        }           
                    }
                    else{
                        resolve(true);     
                    } 
                        
                });                            
            });
            let result = await query;
            if (autoStartTR){
                if (await this.inTransaction())
                    this.commit();
            }
            return result;
        }
        catch(E) {
            if (autoStartTR && await this.inTransaction())
                await this.rollback();
            throw E;
        }        
    }
    public dropTable(tableName: string): Promise<void> {
        this.exec('DROP TABLE IF EXISTS ' + tableName.toLowerCase() + ';');
        return
    }
    public async tableExists(tableName: string): Promise<boolean> {
        return await this.query('SELECT table_name FROM information_schema.tables WHERE table_schema IN (\'copycat\') AND table_name= ?', null, [tableName.toLowerCase()]);
    }


    async createTable(tableDef: DB.TableDefinition): Promise<string>{
        let fieldDefs: string[] = [];
        tableDef.fieldDefs.forEach((field) => {
            let fieldDef = this.getFieldDef(field);
            fieldDefs.push(fieldDef);
        });
        let tableDefSQL = 'CREATE TABLE ' + tableDef.tableName.toLowerCase() + ' ( ' 
            + fieldDefs.join(', ') 
            + ((tableDef.primaryKeys.length > 0)? ", " + tableDef.primaryKeys.map(pk => pk.trim().toLowerCase() ).join(', ') + " int(6)  UNSIGNED AUTO_INCREMENT PRIMARY KEY": "")
            + ")";
        console.log('creating table: ' + tableDefSQL);
        await this.exec(tableDefSQL);
        await this.commit();
        return tableDefSQL;
    }

    listPrimaryKeyFields(tableName: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    protected customMetadataExists(objectName: string, objectType: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    protected createCustomMetadata(metadata: CustomMetadataDefinition): Promise<void> {
        throw new Error("Method not implemented.");
    }
    protected getTriggerNames(tableName: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    protected getTriggerSQL(tableOptions: TableOptions, callback: (triggerName: string, sql: string) => Promise<boolean>): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public triggerExists(triggerName: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    public dropTriggers(tableName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    protected getFieldDef(field: DB.FieldDefinition): string {
        let fieldType: string;
        switch (field.dataType) {
            case DB.DataType.String: fieldType = 'varchar(50)'; break;
            case DB.DataType.Integer: fieldType = 'int'; break;
            case DB.DataType.Int64: fieldType = 'bigint'; break;
            case DB.DataType.AutoInc: fieldType = 'auto_increment'; break;
            // case DB.DataType.BCD: fieldType = ''; break;
            case DB.DataType.Float: fieldType = "float"; break;
            case DB.DataType.Boolean: fieldType = 'boolean'; break;
            case DB.DataType.Blob: fieldType = 'blob'; break;
            case DB.DataType.Memo: fieldType = 'text'; break;
            case DB.DataType.Date: fieldType = 'date'; break;
            case DB.DataType.DateTime: fieldType = 'timestamp'; break;
            case DB.DataType.Time: fieldType = 'time'; break;
            case DB.DataType.SmallInt: fieldType = 'smallint'; break;
        }
        return  field.fieldName.toLowerCase().trim() + ' ' + fieldType + (field.notNull? " not null": "");
    }
    protected setReplicatingNode(origNode: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    protected checkRowExists(record: DataRow): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    protected getDataTypesOfFields(tableName: string, keyName: string[]): Promise<DataType[]> {
        throw new Error("Method not implemented.");
    }
    protected parseFieldValue(dataType: DataType, fieldValue: string): Promise<Object> {
        throw new Error("Method not implemented.");
    }
    async listTables(): Promise<string[]> {
        let tables: string[] = [];
        await this.query('SELECT table_name FROM information_schema.tables' +  
        " WHERE table_schema IN ('copycat', 'information_schema')" + 
        " and table_type in ('BASE TABLE','LOCAL TEMPORARY') ORDER BY table_name", null, null, async (tableRec: DB.Record) => {
                //let tableDef = await this.getTableDef(<string>tableRec.fieldByName('table_name').value, fullFieldDefs);
                tables.push(<string>tableRec.fieldByName('table_name').value);
            });
        return tables;
    }
    public async getTableDef(tableName: string, fullFieldDefs: boolean) : Promise<DB.TableDefinition> {
        let tableDef = new DB.TableDefinition();
        tableDef.tableName = tableName.toLowerCase();
        tableDef.fieldDefs = [];
        await this.query("SELECT column_name, is_nullable FROM information_schema.columns c WHERE table_name = ?" +
            " AND EXISTS (SELECT * FROM information_schema.tables t WHERE table_type = 'BASE TABLE' AND c.table_name = t.table_name)", 
            null, [tableDef.tableName], async (fieldRec: DB.Record) => {
                let fieldDef = new DB.FieldDefinition();
                fieldDef.fieldName = (<string>fieldRec.fieldByName('column_name').value).toLowerCase();
                if (fullFieldDefs) {
                    fieldDef.dataType = DB.DataType.String;
                    fieldDef.notNull = (fieldRec.fieldByName('is_nullable').value == 'NO');
                    fieldDef.precision = 0;
                    fieldDef.scale = 0;
                    fieldDef.length = 0;
                    fieldDef.autoInc = false;
                }
                tableDef.fieldDefs.push(fieldDef);                
            });
        if (fullFieldDefs)
            tableDef.primaryKeys = []
        return tableDef;
    }

    async updateTable(tableDef: DB.TableDefinition): Promise<string> {        
        
        let existingTable = await this.getTableDef(tableDef.tableName, false);
        let fieldDefs: string[] = []; 
        tableDef.fieldDefs.forEach((field) => {
            if (!existingTable.fieldDefs.find((f) => (f.fieldName.toLowerCase() == field.fieldName.toLowerCase()))) {
                let fieldDef = this.getFieldDef(field);
                fieldDefs.push(' ADD ' + fieldDef);
            }
            if (existingTable.fieldDefs.find((f) => (f.fieldName.toLowerCase() == field.fieldName.toLowerCase()))) {
                let fieldDef = this.getFieldDef(field);
                fieldDefs.push(' MODIFY COLUMN ' + fieldDef);
            } 
        });
        let tableDefSQL = 'ALTER TABLE ' + tableDef.tableName.toLowerCase() 
            + fieldDefs.join(', ')    
        console.log('altering table: ' + tableDefSQL);
        this.exec(tableDefSQL);
        this.commit();
        return tableDefSQL;
    }


    protected getFieldType(sqlType: number): DB.DataType {
        throw new Error("Method not implemented.");
    }

    async createOrUpdateTable(tableDef: DB.TableDefinition): Promise<string> {
        if (await this.tableExists(tableDef.tableName))
            return await this.updateTable(tableDef)
        else
            return await this.createTable(tableDef);    
    }
}
