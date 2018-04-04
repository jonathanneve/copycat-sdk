import * as DB from './DB';
import { SQLDriver } from "./SQLDriver";
import { TableDefinition, CustomMetadataDefinition, DataType } from "./DB";
import { TableOptions } from "../interfaces/Nodes";
import { DataRow } from "./Driver";
import {mysql} from 'mysql';

export class MySQLDriver extends SQLDriver {

    connected : boolean = false;
    transactionActive: boolean = false;
    con : mysql
 // Connection
 constructor(connectionStr: string) {
    super({
            "databaseType": "MySQL",
            "customMetadata": [],
            "triggerTemplates": []
        });
        this.con = mysql.createConnection({
            host: "localhost",
            user: "yourusername",
            password: "yourpassword"
          });
          
        this.con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
        });
    }

        
    protected async isConnected(): Promise<boolean> {
        return this.connected;
        throw new Error("Method not implemented.");
    }
    protected async connect(): Promise<void> {
        await this.con.connect();
        this.connected = true;
        throw new Error("Method not implemented.");
    }
    protected async disconnect(): Promise<void> {
        await this.con.end();
        this.connected = false;
        throw new Error("Method not implemented.");
    }
    protected async inTransaction(): Promise<boolean> {
        return this.transactionActive;
        throw new Error("Method not implemented.");
    }
    protected async startTransaction(): Promise<void> {
        await this.con.query("BEGIN");
        this.transactionActive = true;
        throw new Error("Method not implemented.");
    }
    protected async commit(): Promise<void> {
        await this.con.query("COMMIT");
        this.transactionActive = false;
        throw new Error("Method not implemented.");
    }
    protected async rollback(): Promise<void> {
        await this.con.query("ROLLBACK");
        this.transactionActive = false;
        throw new Error("Method not implemented.");
    }
    protected async executeSQL(sql: string, autocreateTR: boolean, fetchResultSet?: boolean, callback?: (record: DB.Record) => Promise<boolean | void>, params?: Object[]): Promise<boolean> {
        let autoStartTR: boolean = autocreateTR && !await this.inTransaction();
        if (autoStartTR)
            await this.startTransaction();

        try {
            let res: any = await this.con.query(sql, params);                        
            if (fetchResultSet) {
                if (callback) {
                    if (res.rows && res.rowCount > 0) {
                        let rowIndex = 0;
                        for (let row of res.rows){
                            let record = new DB.Record();
                            let fieldIndex = 0;
                            for (let field of res.fields) {
                                let f: DB.Field = record.addField(field.name);
                                
                                //TODO: Convert data types
                                //f.dataType = this.convertAPIFieldType(field.dataTypeID, field.dataTypeSize, field.dataTypeModifier);
                                if ((f.dataType == DB.DataType.Blob) && (row[f.fieldName] != null)) {
                                    //TODO: handle blobs
                                }
                                else
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
                    else 
                        return false;
                }
                else 
                    return (res.rowCount > 0);            
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
        throw new Error("Method not implemented.");
    }
    protected dropTable(tableName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    protected tableExists(tableName: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    createTable(table: TableDefinition): Promise<string> {
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
    protected getFieldType(sqlType: number): DataType {
        throw new Error("Method not implemented.");
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
    getTableDef(tableName: string, fullFieldDefs: boolean): Promise<TableDefinition> {
        throw new Error("Method not implemented.");
    }
    createOrUpdateTable(table: TableDefinition): Promise<string> {
        throw new Error("Method not implemented.");
    }

   
    

}
