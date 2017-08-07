"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Driver_1 = require("../Driver");
const DB = require("../DB");
const SQLDriver_1 = require("../SQLDriver");
const fb = require("@spirale-tech/firebird-cc");
const fs = require("fs");
//TODO: handle quoted identifiers
const fbDefs = {
    "databaseType": "Firebird",
    "customMetadata": require("../../data/Drivers/firebird.custom.json"),
    "triggerTemplates": []
};
fbDefs.triggerTemplates.push(fs.readFileSync(__dirname + '/../../data/Drivers/firebird.trigger1.sql', 'utf8'));
fbDefs.triggerTemplates.push(fs.readFileSync(__dirname + '/../../data/Drivers/firebird.trigger2.sql', 'utf8'));
class FirebirdDriver extends SQLDriver_1.SQLDriver {
    constructor() {
        super(fbDefs);
        this.tableDefs = {};
        this.connectionParams = { database: '', username: '', password: '', role: '' };
        this.fbConnection = fb.createConnection();
    }
    //Connection
    isConnected() {
        return this.fbConnection.connected;
    }
    connect() {
        this.fbConnection.connectSync(this.connectionParams.database, this.connectionParams.username, this.connectionParams.password, this.connectionParams.role);
    }
    disconnect() {
        //TODO: Add disconnect implementation in FB C++ code
    }
    //Transaction
    inTransaction() {
        return this.fbConnection.inTransaction;
    }
    startTransaction() {
        if (!this.inTransaction())
            this.fbConnection.startTransactionSync();
    }
    commit() {
        if (this.inTransaction())
            this.fbConnection.commitSync();
    }
    rollback() {
        if (this.inTransaction())
            this.fbConnection.rollbackSync();
    }
    getDataTypesOfFields(tableName, keyName) {
        if (this.tableDefs[tableName])
            return this.tableDefs[tableName];
        else {
            let result = [];
            this.query("select f.rdb$field_type, f.rdb$field_sub_type from rdb$fields f join rdb$relation_fields rf on rf.rdb$field_name = f.rdb$field_name where rf.rdb$relation_name = ?", null, [tableName], (record) => {
                result.push(this.convertDataType(record.fieldByName('rdb$field_type').value, record.fieldByName('rdb$field_sub_type').value));
            });
            this.tableDefs[tableName] = result;
            return result;
        }
    }
    parseDateTime(value) {
        throw new Error('Method not implemented!');
    }
    parseFieldValue(dataType, fieldValue) {
        if ((dataType == DB.DataType.Integer) || (dataType == DB.DataType.SmallInt) || (dataType == DB.DataType.Int64))
            return parseInt(fieldValue);
        else if ((dataType == DB.DataType.Float) || (dataType == DB.DataType.BCD))
            return parseFloat(fieldValue);
        else if ((dataType == DB.DataType.Date) || (dataType == DB.DataType.Time) || (dataType == DB.DataType.DateTime))
            return this.parseDateTime(fieldValue);
        else
            return fieldValue;
    }
    convertAPIFieldType(sqlType) {
        switch (sqlType) {
            case 520 /* SQL_BLOB */:
                return DB.DataType.Blob;
            case 580 /* SQL_INT64 */, 550 /* SQL_QUAD */:
                return DB.DataType.Int64;
            case 500 /* SQL_SHORT */:
                return DB.DataType.SmallInt;
            case 496 /* SQL_LONG */:
                return DB.DataType.Integer;
            case 530 /* SQL_D_FLOAT */, 480 /* SQL_DOUBLE */, 482 /* SQL_FLOAT */:
                return DB.DataType.Float;
            case 452 /* SQL_TEXT */:
                return DB.DataType.FixedChar;
            case 448 /* SQL_VARYING */:
                return DB.DataType.String;
            case 32766 /* SQL_NULL */:
                return DB.DataType.Unknown;
            case 510 /* SQL_TIMESTAMP */:
                return DB.DataType.DateTime;
            case 570 /* SQL_TYPE_DATE */:
                return DB.DataType.Date;
            case 560 /* SQL_TYPE_TIME */:
                return DB.DataType.Time;
        }
        return DB.DataType.Unknown;
    }
    //This function is defined in SQLDriver and serves to interpret the field type information
    //set in RPL$LOG_VALUES by the triggers
    //For some incomprehensible reason, the numbers used by Firebird in the system tables are 
    //not the same as the ones used above in convertAPIFieldType, which are returned by the Firebird API
    getFieldType(sqlType) {
        //We do the hard work in the trigger code
        //So the field_type value in RPL$LOG_VALUES already represents the DB.DataType enumeration
        return sqlType;
    }
    //This function converts the low-level Firebird datatypes (from rdb$fields) to DB.DataType
    convertDataType(sqlType, subType) {
        if (sqlType == 7)
            return DB.DataType.SmallInt;
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
            return DB.DataType.FixedChar;
        else if ((sqlType == 37) || (sqlType == 40))
            return DB.DataType.String;
        else if (sqlType == 261)
            return (subType == 0 ? DB.DataType.Blob : DB.DataType.Memo);
        else if (sqlType == 16)
            return (subType == 0 ? DB.DataType.Int64 : DB.DataType.BCD);
        else if (sqlType == 23)
            return DB.DataType.Boolean;
    }
    checkRowExists(record) {
        return this.query('select * from ' + record.tableName + this.getWhereClause(record), null, this.getWhereFieldValues(record));
    }
    //Query
    executeSQL(sql, fetchResultSet, callback, params) {
        let autoStartTR = !this.inTransaction();
        if (autoStartTR)
            this.startTransaction();
        try {
            let res;
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
                        rows.every(row => {
                            let record = new DB.Record();
                            row.every(field => {
                                let f = record.addField(field.fieldName);
                                f.dataType = this.convertAPIFieldType(field.sqlType);
                                if ((f.dataType == DB.DataType.Blob) && (field.value != null)) {
                                    const chunkSize = 256;
                                    let len = field.sqlLen;
                                    let buf = Buffer.alloc(chunkSize);
                                    field.value._openSync();
                                    let bytesRead = field.value._readSync(buf);
                                    f.size = bytesRead;
                                    let numberOfChunks = 1;
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
                                    let finalBuf = Buffer.alloc(f.size);
                                    buf.copy(finalBuf);
                                    field.value._closeSync();
                                    f.value = finalBuf.toString('base64');
                                }
                                else
                                    f.value = field.value;
                                return true;
                            });
                            let result = callback(record);
                            //If the callback returns false, we should abort the loop
                            if (typeof result === "boolean")
                                return result;
                            else
                                return true;
                        });
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
            if (autoStartTR && this.inTransaction())
                this.commit();
        }
        catch (E) {
            if (autoStartTR && this.inTransaction())
                this.rollback();
            throw E;
        }
    }
    //Metadata queries    
    dropTable(tableName) {
        if (this.tableExists(tableName))
            this.exec('DROP TABLE ' + tableName);
    }
    tableExists(tableName) {
        return this.query("select rdb$relation_name from rdb$relations where rdb$relation_name = ?", null, [tableName]);
    }
    triggerExists(triggerName) {
        return this.query("select rdb$trigger_name from rdb$triggers where rdb$trigger_name = ?", null, [triggerName]);
    }
    getTriggerName(tableName) {
        //Implement truncating tablename correctly (with the RPL$ and config_name prefixes)
        return tableName.substring(0, 25);
    }
    getDBVersion() {
        return parseInt(this.databaseVersion.substring(2));
    }
    getTriggerSQL(tableOptions, callback) {
        this.dbDefinition.triggerTemplates.forEach(trig => {
            let trigName = this.getTriggerName(tableOptions.tableName);
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
            callback(trigName, trig);
        });
    }
    dropTriggers(tableName) {
        let trigName = this.getTriggerName(tableName);
        if (this.triggerExists(trigName))
            this.exec('DROP TRIGGER ' + trigName);
        if (this.triggerExists(trigName + '2'))
            this.exec('DROP TRIGGER ' + trigName + '2');
    }
    getFieldDef(field) {
        let fieldType;
        switch (field.dataType) {
            case DB.DataType.String:
                fieldType = 'varchar(' + field.length.toString() + ")";
                break;
            case DB.DataType.FixedChar:
                fieldType = 'char(' + field.length.toString() + ")";
                break;
            case DB.DataType.Integer:
                fieldType = 'integer';
                break;
            case DB.DataType.Int64:
                fieldType = 'bigint';
                break;
            case DB.DataType.AutoInc:
                fieldType = 'integer';
                break;
            case DB.DataType.BCD:
                fieldType = 'numeric(' + field.length.toString() + ", " + field.precision + ")";
                break;
            case DB.DataType.Float:
                fieldType = "double precision";
                break;
            case DB.DataType.Boolean:
                fieldType = 'boolean';
                break;
            case DB.DataType.Blob:
                fieldType = 'blob';
                break;
            case DB.DataType.Memo:
                fieldType = 'blob sub_type 1';
                break;
            case DB.DataType.Date:
                fieldType = 'date';
                break;
            case DB.DataType.DateTime:
                fieldType = 'timestamp';
                break;
            case DB.DataType.Time:
                fieldType = 'time';
                break;
            case DB.DataType.SmallInt:
                fieldType = 'smallint';
                break;
            default: throw new Error('Data type ' + DB.DataType[field.dataType] + " (" + field.dataTypeStr + ") not handle by Firebird!");
        }
        return field.fieldName + " " + fieldType + (field.notNull ? " not null" : "");
    }
    createTable(tableDef) {
        let fieldDefs = [];
        tableDef.fieldDefs.forEach((field) => {
            let fieldDef = this.getFieldDef(field);
            fieldDefs.push(fieldDef);
        });
        let tableDefSQL = 'CREATE TABLE ' + tableDef.tableName + ' ( '
            + fieldDefs.join(', ')
            + ((tableDef.primaryKeys.length > 0) ? ", primary key (" + tableDef.primaryKeys.join(', ') + ")" : "")
            + ")";
        console.log('creating table: ' + tableDefSQL);
        this.exec(tableDefSQL);
        this.commit();
    }
    customMetadataExists(objectName, objectType) {
        if (objectType == "TABLE") {
            return this.tableExists(objectName);
        }
        else if (objectType == "GENERATOR") {
            return this.query("select rdb$generator_name from rdb$generators where rdb$generator_name = ?", null, [objectName]);
        }
        else if (objectType == "PROCEDURE") {
            return this.query("select rdb$procedure_name from rdb$procedures where rdb$procedure_name = ?", null, [objectName]);
        }
        else if (objectType == "TRIGGER") {
            return this.triggerExists(objectName);
        }
        else
            throw new Error('Custom metadata object type ' + objectType + ' not defined!');
    }
    createCustomMetadata(metadata) {
        this.exec(metadata.SQL.join('\n'));
    }
    setReplicatingNode(origNode) {
        this.exec("select rdb$set_context('USER_SESSION', 'REPLICATING_NODE', 'TRUE') from rdb$database");
    }
}
exports.FirebirdDriver = FirebirdDriver;
Driver_1.addDriver('FirebirdDriver', FirebirdDriver);
//# sourceMappingURL=Firebird.js.map