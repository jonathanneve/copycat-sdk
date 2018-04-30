import * as DB from './DB';
import { SQLDriver } from "./SQLDriver";
import { TableDefinition, CustomMetadataDefinition, DataType } from "./DB";
import { TableOptions } from "../interfaces/Nodes";
import { DataRow } from "./Driver";
import {mysql} from 'mysql';

export class MySQLDriver extends SQLDriver {

    
    connected : boolean = false;
    transactionActive: boolean = false;
    connection : mysql
 // Connection
 constructor(connectionStr: string) {
    super({
            "databaseType": "MySQL",
            "customMetadata": [],
            "triggerTemplates": []
        });
        this.connection = mysql.createConnection({
            host: "localhost",
            user: "yourusername",
            password: "yourpassword"
          });
          
        this.connection.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
        });
    }

        
    protected async isConnected(): Promise<boolean> {
        return this.connected;
        throw new Error("Method not implemented.");
    }
    protected async connect(): Promise<void> {
        await this.connection.connect();
        this.connected = true;
        throw new Error("Method not implemented.");
    }
    protected async disconnect(): Promise<void> {
        await this.connection.end();
        this.connected = false;
        throw new Error("Method not implemented.");
    }
    protected async inTransaction(): Promise<boolean> {
        return this.transactionActive;
        throw new Error("Method not implemented.");
    }
    protected async startTransaction(): Promise<void> {
        await this.connection.query("BEGIN");
        this.transactionActive = true;
        throw new Error("Method not implemented.");
    }
    protected async commit(): Promise<void> {
        await this.connection.query("COMMIT");
        this.transactionActive = false;
        throw new Error("Method not implemented.");
    }
    protected async rollback(): Promise<void> {
        await this.connection.query("ROLLBACK");
        this.transactionActive = false;
        throw new Error("Method not implemented.");
    }
    public async executeSQL(sql: string, autocreateTR: boolean, fetchResultSet?: boolean, 
        callback?: (record: DB.Record) => Promise<boolean | void>, params?: Object[]): Promise<boolean> {                
        let autoStartTR: boolean = autocreateTR && !await this.inTransaction();
        if (autoStartTR)
            await this.startTransaction();
            
        try {
            if (params && params.length > 0) {
                //Preprocess SQL text to change param markers from ? to $1, $2, etc
                let paramIndex = 1;
                sql = sql.replace(/\?/g, (substr) => {
                    return "$" + paramIndex++;
                })
            }
            let res: any = await this.connection.query(sql,(err, result, field)=>{
                
            });                        
            if (fetchResultSet) {
                if (callback) {
                   if(res.result && res.result.length > 0) {
                    let rowIndex = 0;
                    for (let row of res.result){
                        let record = new DB.Record();
                        let fieldIndex = 0;
                        for (let field of res.field) {
                            let f: DB.Field = record.addField(field.name);
                                f.value = row[f.fieldName];         
                            fieldIndex++;
                        }
                        let result = await callback(record);
                        //If the callback returns false, we should abort the loop
                        if ((typeof result === "boolean") && !result)
                            break;
                        
                        rowIndex++;
                    }

                   }
                   else{
                       return false
                   }
                }
                else 
                    return (res.result.length > 0);            
            }
            else 
                return true; 

            if (autoStartTR && await this.inTransaction())
                await this.commit();
        }
        catch(E) {
            if (autoStartTR && await this.inTransaction())
                await this.rollback();
            throw E;
        }        
    }
    protected dropTable(tableName: string): Promise<void> {
        this.exec('DROP TABLE IF EXISTS' + tableName.toLowerCase() + ';');
        throw new Error("Method not implemented.");
    }
    protected tableExists(tableName: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    public async createTable(table: TableDefinition): Promise<string> {  
        let tableDefSQL = 'CREATE TABLE IF EXISTS "' + table.tableName.toLowerCase() + '" ( ' 
        + table.fieldDefs.join(', ') 
        + ((table.primaryKeys.length > 0)? ", primary key (" + table.primaryKeys.map(pk => '"' + pk.trim().toLowerCase() + '"').join(', ') + ")": "")
        + ")";
        this.exec(tableDefSQL)
        throw new Error("Method not implemented.");
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
            case DB.DataType.String: fieldType = 'varchar(' + field.length.toString() + ")"; break;
            case DB.DataType.FixedChar: fieldType = 'char(' + field.length.toString() + ")"; break;
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
            default: throw new Error('Data type ' + DB.DataType[field.dataType] + " (" + field.dataTypeStr +") not handle by Firebird!");
        }
        return '"' + field.fieldName.toLowerCase().trim() + '" ' + fieldType + (field.notNull? " not null": "");
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
    listTables(): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    public async getTableDef(tableName: string, fullFieldDefs: boolean): Promise<TableDefinition> {
      
        throw new Error("Method not implemented.");
    }

    protected getFieldType(sqlType: number): DB.DataType {
        throw new Error("Method not implemented.");
    }
    createOrUpdateTable(table: TableDefinition): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
