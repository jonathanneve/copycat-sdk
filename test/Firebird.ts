import {drivers, Driver, ReplicationBlock, ReplicationRecord, addDriver} from "../classes/Driver"
import * as DB from  "../classes/DB"
import {SQLDriver} from  "../classes/SQLDriver"
import {Stream} from "stream"
import {TableOptions} from  "../interfaces/Nodes"

import fb  = require("@spirale-tech/firebird-cc");
import fs = require('fs'); 
//require("@spirale-tech/copycat-sdk/classes/Driver")

console.log('firebird');

//TODO: handle quoted identifiers

const fbDefs: DB.DatabaseDefinition = {
    "databaseType": "Firebird",
    "customMetadata": require("../data/Drivers/firebird.custom.json"),
    "triggerTemplates": []
}

fbDefs.triggerTemplates.push(fs.readFileSync(__dirname + '/../data/Drivers/firebird.trigger1.sql','utf8'));
fbDefs.triggerTemplates.push(fs.readFileSync(__dirname + '/../data/Drivers/firebird.trigger2.sql','utf8'));

const enum FirebirdAPIDataTypes {
    SQL_TEXT                          = 452,
    SQL_VARYING                       = 448,
    SQL_SHORT                         = 500,
    SQL_LONG                          = 496,
    SQL_FLOAT                         = 482,
    SQL_DOUBLE                        = 480,
    SQL_D_FLOAT                       = 530,
    SQL_TIMESTAMP                     = 510,
    SQL_BLOB                          = 520,
    SQL_ARRAY                         = 540,
    SQL_QUAD                          = 550,
    SQL_TYPE_TIME                     = 560,
    SQL_TYPE_DATE                     = 570,
    SQL_INT64                         = 580,
    SQL_NULL                          = 32766
}

export class FirebirdDriver extends SQLDriver {
     
    protected fbConnection: any;
    private tableDefs : { [tableName: string]: DB.DataType[] } = {};
    
    connectionParams: {
        database: string;
        databaseVersion: string;
        username: string;
        password: string;
        role: string;
    } = {database: '', databaseVersion: '', username: '', password: '', role: ''};

    constructor() {
        super(fbDefs);
        this.fbConnection = fb.createConnection();
    }

    //Connection
    async isConnected(): Promise<boolean> {
        return this.fbConnection.connected;
    }

    async connect(): Promise<void> {
        this.fbConnection.connectSync(this.connectionParams.database, this.connectionParams.username, this.connectionParams.password, this.connectionParams.role);
    }

    async disconnect(): Promise<void> {
        //TODO: Add disconnect implementation in FB C++ code
    }

    //Transaction
    async inTransaction(): Promise<boolean> {
        return this.fbConnection.inTransaction;
    }

    async startTransaction(): Promise<void> {
       if (!this.inTransaction()) 
         this.fbConnection.startTransactionSync();
    }
    async commit(): Promise<void> {
        if (this.inTransaction()) 
            this.fbConnection.commitSync();
    }
    async rollback(): Promise<void> {
        if (this.inTransaction()) 
            this.fbConnection.rollbackSync();
    }

    async getDataTypesOfFields(tableName: string, keyName: string[]): Promise<DB.DataType[]>{
        if (this.tableDefs[tableName])
            return this.tableDefs[tableName];
        else {       
            let result: DB.DataType[] = [];
            await this.query("select f.rdb$field_type, f.rdb$field_sub_type from rdb$fields f join rdb$relation_fields rf on rf.rdb$field_name = f.rdb$field_name where rf.rdb$relation_name = ?", null, [tableName],            
            async (record: DB.Record) => {
                result.push(this.convertDataType(<number>record.fieldByName('rdb$field_type').value, <number>record.fieldByName('rdb$field_sub_type').value));
            });
            this.tableDefs[tableName] = result;
            return result;
        }
    }

    private parseDateTime(value: string): Date{
        throw new Error('Method not implemented!')
    }

    async parseFieldValue(dataType: DB.DataType, fieldValue: string): Promise<Object>{
        if ((dataType == DB.DataType.Integer) || (dataType == DB.DataType.SmallInt) || (dataType == DB.DataType.Int64))
            return parseInt(fieldValue);
        else if ((dataType == DB.DataType.Float) || (dataType == DB.DataType.BCD))
            return parseFloat(fieldValue);
        else if ((dataType == DB.DataType.Date) || (dataType == DB.DataType.Time) || (dataType == DB.DataType.DateTime))
            return this.parseDateTime(fieldValue);
        else
            return fieldValue;
    }

    convertAPIFieldType(sqlType: number): DB.DataType{
        switch (sqlType) {
            case FirebirdAPIDataTypes.SQL_BLOB: 
                return DB.DataType.Blob;              
            case FirebirdAPIDataTypes.SQL_INT64, FirebirdAPIDataTypes.SQL_QUAD:
                return DB.DataType.Int64;            
            case FirebirdAPIDataTypes.SQL_SHORT:
                return DB.DataType.SmallInt;
            case FirebirdAPIDataTypes.SQL_LONG:
                return DB.DataType.Integer;            
            case FirebirdAPIDataTypes.SQL_D_FLOAT, FirebirdAPIDataTypes.SQL_DOUBLE, FirebirdAPIDataTypes.SQL_FLOAT:
                return DB.DataType.Float;            
            case FirebirdAPIDataTypes.SQL_TEXT:
                return DB.DataType.FixedChar;
            case FirebirdAPIDataTypes.SQL_VARYING:
                return DB.DataType.String;           
            case FirebirdAPIDataTypes.SQL_NULL:
                return DB.DataType.Unknown;
            case FirebirdAPIDataTypes.SQL_TIMESTAMP:
                return DB.DataType.DateTime;
            case FirebirdAPIDataTypes.SQL_TYPE_DATE:
                return DB.DataType.Date;
            case FirebirdAPIDataTypes.SQL_TYPE_TIME:
                return DB.DataType.Time;
        }    
        return DB.DataType.Unknown;
    }

    //This function is defined in SQLDriver and serves to interpret the field type information
    //set in CC$LOG_VALUES by the triggers
    //For some incomprehensible reason, the numbers used by Firebird in the system tables are 
    //not the same as the ones used above in convertAPIFieldType, which are returned by the Firebird API
    getFieldType(sqlType: number): DB.DataType{
        //We do the hard work in the trigger code
        //So the field_type value in CC$LOG_VALUES already represents the DB.DataType enumeration
        return <DB.DataType>sqlType;
    }

    //This function converts the low-level Firebird datatypes (from rdb$fields) to DB.DataType
    private convertDataType(sqlType: number, subType: number): DB.DataType{
        if (sqlType == 7) {
            if (subType == 1)
                return DB.DataType.BCD;    
            else
                return DB.DataType.SmallInt;
        }
        else if (sqlType == 8)
            return DB.DataType.Integer;
        else if (sqlType == 9)
            return DB.DataType.Unknown;
        else if ((sqlType == 10) || (sqlType == 27))
            return DB.DataType.Float;
        else if (sqlType == 12)
            return DB.DataType.Date;
        else if (sqlType == 13)
            return DB.DataType.Time;
        else if (sqlType == 35)
            return DB.DataType.DateTime;
        else if (sqlType == 14)
            return DB.DataType.FixedChar
        else if ((sqlType == 37) || (sqlType == 40))
            return DB.DataType.String;
        else if (sqlType == 261)
            return (subType == 0? DB.DataType.Blob: DB.DataType.Memo);
        else if (sqlType == 16)
            return (subType == 0? DB.DataType.Int64: DB.DataType.BCD);
        else if (sqlType == 23)
            return DB.DataType.Boolean;
    }

    async checkRowExists(record: ReplicationRecord): Promise<boolean> {
        return await this.query('select * from ' + record.tableName + this.getWhereClause(record), null, this.getWhereFieldValues(record));
    }

    //Query
    async executeSQL(sql: string, autocreateTR: boolean, fetchResultSet: boolean, callback?: (record: DB.Record) => Promise<boolean | void>, params?: Object[]): Promise<boolean> {
        let autoStartTR: boolean = autocreateTR && ! await this.inTransaction();
        if (autoStartTR)
            await this.startTransaction();

        try {
            let res: any;
            if (params && params.length > 0) {
                let stmt = this.fbConnection.prepareSync(sql);    
                stmt.execSync(...params);
                res = stmt;
            }
            else
                res = this.fbConnection.querySync(sql);
            if (fetchResultSet) {
                if (callback) {
                    //TODO: support limiting fetching to a maximum number of rows
                    let rows = res.fetchSync("all", false, true);        
                    if (rows) {
                        for (let row of rows) {
                            let record = new DB.Record();
                            for (let field of row) {
                                let f: DB.Field = record.addField(field.fieldName);
                                f.dataType = this.convertAPIFieldType(field.sqlType);
                                if ((f.dataType == DB.DataType.Blob) && (field.value != null)) {
                                    const chunkSize: number = 256;
                                    let len: number = field.sqlLen;
                                    let buf: Buffer = Buffer.alloc(chunkSize);
                                    field.value._openSync();                               
                                    let bytesRead: number = field.value._readSync(buf);
                                    f.size = bytesRead;
                                    let numberOfChunks: number = 1;
                                    while (bytesRead == chunkSize) {
                                        numberOfChunks++;
                                        let newBuf = Buffer.alloc(chunkSize);                                    
                                        bytesRead = field.value._readSync(newBuf);
                                        f.size = f.size + bytesRead;
                                        let fullBuf = Buffer.alloc(chunkSize * numberOfChunks);
                                        buf.copy(fullBuf);
                                        newBuf.copy(fullBuf, chunkSize * (numberOfChunks - 1));
                                        buf = fullBuf;
                                    }
                                    let finalBuf: Buffer = Buffer.alloc(f.size);
                                    buf.copy(finalBuf);
                                    field.value._closeSync();
                                    f.value = finalBuf.toString('base64');
                                }
                                else
                                    f.value = field.value;                                                                
                            };
                            let result = await callback(record);
                            //If the callback returns false, we should abort the loop
                            if ((typeof result === "boolean") && !result)
                                break;
                        };
                    }
                    else 
                        return false;
                }
                else {
                    let rows = res.fetchSync(1, false, false);   
                    return (rows.length > 0);
                }
            }
            else 
                return true; 

            if (autoStartTR && await this.inTransaction())
                await this.commit();
        }
        catch(E) {
            if (autoStartTR && await this.inTransaction())
                await this.rollback();
            throw new Error('Error executing query: ' + sql + '\n' + E);
        }
    }

    //Metadata queries    
    async dropTable(tableName: string): Promise<void> {
        if (await this.tableExists(tableName))
          await this.exec('DROP TABLE ' + tableName);
    }
    async tableExists(tableName: string): Promise<boolean> {
        return await this.query("select rdb$relation_name from rdb$relations where rdb$relation_name = ?", null, [tableName])
    }

    async triggerExists(triggerName: string): Promise<boolean> {
        return await this.query("select rdb$trigger_name from rdb$triggers where rdb$trigger_name = ?", null, [triggerName])
    }

    private async getMaxTableCounter(): Promise<number> {
        let maxCounter = 0;
        await this.query("select max(counter) as max_counter from cc$tables", null, null, async (rec) => {
            maxCounter = <number>rec.fieldByName('max_counter').value;
        });
        return maxCounter;
    }

    private async getTableCounter(tableName: string): Promise<number> {
        let counter = -1;
        await this.query("select counter from cc$tables where table_name = ?", null, [tableName], async (rec) => {
            counter = <number>rec.fieldByName('counter').value;
        });
        return counter;
    }

    private getTriggerName(tableName: string, counter: number, trigger_number: number): string {        
        let counterStr = (10000 + counter).toString().substring(1);
        return 'CC$' + tableName.substring(0, 22) + counterStr + "_" + trigger_number.toString();
    }

    getDBVersion():number{
        return parseInt(this.connectionParams.databaseVersion.substring(2));
    }

    async getTriggerSQL(tableOptions: TableOptions, callback: (triggerName: string, sql: string) => Promise<boolean>): Promise<void> {
        let trigger_number = 1;       
        let triggersAlreadyCreated = true;
        let counter = await this.getTableCounter(tableOptions.tableName);
        if (counter == -1) {
            triggersAlreadyCreated = false;
            counter = await this.getMaxTableCounter() + 1;
        }
        for(let trig of this.dbDefinition.triggerTemplates) {
            let trigName : string = this.getTriggerName(tableOptions.tableName, counter, trigger_number);
            trig = trig.replace(/%TABLE_NAME%/g, tableOptions.tableName);
            trig = trig.replace(/%TRIGGER_NAME%/g, trigName);
            trig = trig.replace(/%CONFIG_NAME%/g, this.configName);
            if (tableOptions.includedFields.length > 0)
              trig = trig.replace(/%INCLUDED_FIELDS%/, "(rf.rdb$field_name in (" + tableOptions.includedFields.join(', ') + "))");
            else
              trig = trig.replace(/%INCLUDED_FIELDS%/, "0=0");
            if (tableOptions.excludedFields.length > 0)
              trig = trig.replace(/%EXCLUDED_FIELDS%/, "(rf.rdb$field_name in (" + tableOptions.excludedFields.join(', ') + "))");
            else 
              trig = trig.replace(/%EXCLUDED_FIELDS%/, "0=0");

            if (this.getDBVersion() >= 30) {
                trig = trig.replace(/%EXEC_STMT_PARAM%/g, "(dbkey := :dbkey)");
                trig = trig.replace(/%DBKEY%/g, "rdb$db_key=:dbkey");
            }
            else {
                trig = trig.replace(/%EXEC_STMT_PARAM%/g, "");
                trig = trig.replace(/%DBKEY%/g, "rdb$db_key=''' || :dbkey || '''");
            }
            if (!await callback(trigName, trig)) {
                await this.dropTriggers(tableOptions.tableName);
                break;
            }
            trigger_number++;
        }; 
        if (!triggersAlreadyCreated) {
            await this.exec('insert into CC$TABLES (table_name, counter) values (?, ?)', null,
                [tableOptions.tableName, counter, tableOptions.includedFields.join(', '), tableOptions.excludedFields.join(', ')]);
        }
    }

    protected async getTriggerNames(tableName: string): Promise<string[]> {
        let triggers: string[] = [];
        await this.query('select counter from cc$tables where table_name = ?', null, [tableName], async (row: DB.Record) => {
            triggers.push(this.getTriggerName(tableName, <number>row.fieldByName('counter').value, 1));
            triggers.push(this.getTriggerName(tableName, <number>row.fieldByName('counter').value, 2));
        });
        return triggers;
    }
        
    async dropTriggers(tableName: string): Promise<void> {
        let triggers = await this.getTriggerNames(tableName);
        for (let trigger of triggers) {
            await this.exec('drop trigger ' + trigger);
        }
        await this.exec('delete from cc$tables where table_name = ?', null, [tableName]);        
    }

    private getFieldDef(field: DB.FieldDefinition) : string{
        let fieldType: string;
        switch (field.dataType) {
            case DB.DataType.String: fieldType = 'varchar(' + field.length.toString() + ")"; break;
            case DB.DataType.FixedChar: fieldType = 'char(' + field.length.toString() + ")"; break;
            case DB.DataType.Integer: fieldType = 'integer'; break;
            case DB.DataType.Int64: fieldType = 'bigint'; break;
            case DB.DataType.AutoInc: fieldType = 'integer'; break;
            case DB.DataType.BCD: fieldType = 'numeric('+ field.precision.toString() + ", " + field.scale + ")"; break;
            case DB.DataType.Float: fieldType = "double precision"; break;
            case DB.DataType.Boolean: fieldType = 'boolean'; break;
            case DB.DataType.Blob: fieldType = 'blob'; break;
            case DB.DataType.Memo: fieldType = 'blob sub_type 1'; break;
            case DB.DataType.Date: fieldType = 'date'; break;
            case DB.DataType.DateTime: fieldType = 'timestamp'; break;
            case DB.DataType.Time: fieldType = 'time'; break;
            case DB.DataType.SmallInt: fieldType = 'smallint'; break;
            default: throw new Error('Data type ' + DB.DataType[field.dataType] + " (" + field.dataTypeStr +") not handle by Firebird!");
        }
        return field.fieldName + " " + fieldType + (field.notNull? " not null": "");
    }

    async createOrUpdateTable(tableDef: DB.TableDefinition): Promise<void> {
        if (await this.tableExists(tableDef.tableName))
            await this.updateTable(tableDef)
        else
            await this.createTable(tableDef);    
    }

    async createTable(tableDef: DB.TableDefinition): Promise<void>{
        let fieldDefs: string[] = [];
        tableDef.fieldDefs.forEach((field) => {
            let fieldDef = this.getFieldDef(field);
            fieldDefs.push(fieldDef);
        });
        let tableDefSQL = 'CREATE TABLE ' + tableDef.tableName + ' ( ' 
            + fieldDefs.join(', ') 
            + ((tableDef.primaryKeys.length > 0)? ", primary key (" + tableDef.primaryKeys.join(', ') + ")": "")
            + ")";
        console.log('creating table: ' + tableDefSQL);
        await this.exec(tableDefSQL);
        //await this.commit();
    }

    async updateTable(tableDef: DB.TableDefinition): Promise<void> {        
        //TODO: handle primary key changes by dropping old PK and creating a new one
        let existingTable = await this.getTableDef(tableDef.tableName, false);
        let fieldDefs: string[] = []; 
        tableDef.fieldDefs.forEach((field) => {
            if (!existingTable.fieldDefs.find((f) => (f.fieldName == field.fieldName))) {
                let fieldDef = this.getFieldDef(field);
                fieldDefs.push('ADD ' + fieldDef);
            }    
        });
        let tableDefSQL = 'ALTER TABLE ' + tableDef.tableName + ' ( ' 
            + fieldDefs.join(', ') 
           // + ((tableDef.primaryKeys.length > 0)? ", primary key (" + tableDef.primaryKeys.join(', ') + ")": "")
            + ")";
        console.log('altering table: ' + tableDefSQL);
        await this.exec(tableDefSQL);
        //await this.commit();
    }

    async customMetadataExists(objectName: string, objectType: string): Promise<boolean> {
        if (objectType == "TABLE") {
            return await this.tableExists(objectName);
        }
        else if (objectType == "GENERATOR") {
            return await this.query("select rdb$generator_name from rdb$generators where rdb$generator_name = ?", null, [objectName])
        }
        else if (objectType == "PROCEDURE") {
            return await this.query("select rdb$procedure_name from rdb$procedures where rdb$procedure_name = ?", null, [objectName])
        }
        else if (objectType == "TRIGGER") {
            return await this.triggerExists(objectName);
        }
        else
            throw new Error('Custom metadata object type ' + objectType + ' not defined!');
    }
    async createCustomMetadata(metadata: DB.CustomMetadataDefinition): Promise<void> {
        await this.exec(metadata.SQL.join('\n'));        
    }

    async setReplicatingNode(origNode: string): Promise<void> {
        await this.exec("select rdb$set_context('USER_SESSION', 'REPLICATING_NODE', 'TRUE') from rdb$database");
    }

    private async listPrimaryKeyFields(tableName: string): Promise<string[]>{
        let keys: string[] = [];
        await this.query(
            'select i.rdb$field_name as pk_name ' +
            'from rdb$relation_constraints rel '+
            'join rdb$index_segments i on rel.rdb$index_name = i.rdb$index_name '+
            "where rel.rdb$constraint_type = 'PRIMARY KEY' " +
            'and rel.rdb$relation_name = ? '+
            'order by i.rdb$field_position', null, [tableName], async (record: DB.Record) => {
                keys.push(<string>record.fieldByName('pk_name').value);
            })
        return keys;
    }

    private async getTableDef(tableName: string, fullFieldDefs: boolean) : Promise<DB.TableDefinition> {
        let tableDef = new DB.TableDefinition();
        tableDef.tableName = tableName;
        tableDef.fieldDefs = [];
        await this.query('select rf.rdb$field_name, rfs.rdb$field_type, coalesce(rfs.rdb$character_length, rfs.rdb$field_length) as field_length, ' +
            'rf.rdb$null_flag, rfs.rdb$field_sub_type, rfs.rdb$field_scale, rfs.rdb$field_precision '+    
            'from rdb$relation_fields rf ' +
            'join rdb$fields rfs on rfs.rdb$field_name = rf.rdb$field_source '+
            'where rf.rdb$relation_name = ?', 
            null, [tableDef.tableName], async(fieldRec: DB.Record) => {
                let fieldDef = new DB.FieldDefinition();
                fieldDef.fieldName = (<string>fieldRec.fieldByName('rdb$field_name').value).trim();
                if (fullFieldDefs) {
                    fieldDef.dataType = this.convertDataType(<number>fieldRec.fieldByName('rdb$field_type').value, <number>fieldRec.fieldByName('rdb$field_sub_type').value);
                    fieldDef.notNull = (fieldRec.fieldByName('rdb$null_flag').value == 1);
                    fieldDef.precision =  <number>fieldRec.fieldByName('rdb$field_precision').value;
                    if (fieldDef.dataType == DB.DataType.BCD) {
                        fieldDef.scale = -1 * <number>fieldRec.fieldByName('rdb$field_scale').value;
                        fieldDef.length = 0;
                    }
                    else {
                        fieldDef.scale = <number>fieldRec.fieldByName('rdb$field_scale').value;
                        fieldDef.length = <number>fieldRec.fieldByName('field_length').value;                     
                    }
                    fieldDef.autoInc = false;
                }
                tableDef.fieldDefs.push(fieldDef);                
            });
        if (fullFieldDefs)
            tableDef.primaryKeys = await this.listPrimaryKeyFields(tableDef.tableName);
        return tableDef;
    }
    
    async listTables(fullFieldDefs: boolean): Promise<DB.TableDefinition[]>{
        let tableDefs: DB.TableDefinition[] = [];
        await this.query("select rdb$relation_name from rdb$relations where rdb$system_flag = 0 and rdb$view_blr is null and not rdb$relation_name starting with 'CC$'", [], [], async(tableRec: DB.Record) => {
            let tableDef = await this.getTableDef((<string>tableRec.fieldByName('rdb$relation_name').value).trim(), fullFieldDefs);
            tableDefs.push(tableDef);
        });
        return tableDefs;
    } 
}

drivers['FirebirdDriver'] = FirebirdDriver;
console.log('Firebird module initialized')