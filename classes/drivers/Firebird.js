"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    getTriggerName(tableName, counter, trigger_number) {
        let counterStr = (10000 + counter).toString().substring(1);
        return 'CC$' + tableName.substring(0, 22) + counterStr + "_" + trigger_number;
    }
    getDBVersion() {
        return parseInt(this.databaseVersion.substring(2));
    }
    getTriggerSQL(tableOptions, callback) {
        let trigger_number = 1;
        let counter = this.getMaxTableCounter() + 1;
        this.dbDefinition.triggerTemplates.forEach(trig => {
            let trigName = this.getTriggerName(tableOptions.tableName, counter, trigger_number);
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
            if (!callback(trigName, trig)) {
                this.dropTriggers(tableOptions.tableName);
                break;
            }
        });
        this.exec('insert into CC$TABLES (table_name, counter, included_fields, excluded_fields) values (?, ?, ?, ?)', null, [tableOptions.tableName, counter, tableOptions.includedFields.join(', '), tableOptions.excludedFields.join(', ')]);
    }
    getTriggerNames(tableName) {
        let triggers = [];
        this.query('select counter from cc$tables where table_name = ?', null, [tableName], (row) => {
            triggers.push(this.getTriggerName(tableName, row.fieldByName('counter').value, 1));
            triggers.push(this.getTriggerName(tableName, row.fieldByName('counter').value, 2));
        });
    }
    dropTriggers(tableName) {
        let triggers = this.getTriggerNames(tableName);
        for (let trigger of triggers) {
            this.exec('drop trigger ' + trigger);
        }
        this.exec('delete from cc$tables where table_name = ?', null, [tableName]);
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
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    updateTable(tableDef) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: handle primary key changes by dropping old PK and creating a new one
            let existingTable = this.getTableDef(tableDef.tableName, false);
            let fieldDefs = [];
            tableDef.fieldDefs.forEach((field) => {
                if (!existingTable.fieldDefs.find((f) => (f.fieldName == field.fieldName))) {
                    let fieldDef = this.getFieldDef(field);
                    fieldDefs.push('ADD ' + fieldDef);
                }
            });
            let tableDefSQL = 'ALTER TABLE ' + tableDef.tableName + ' ( '
                + fieldDefs.join(', ')
                + ")";
            console.log('altering table: ' + tableDefSQL);
            this.exec(tableDefSQL);
            this.commit();
        });
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
    listPrimaryKeyFields(tableName) {
        let keys = [];
        this.query('select i.rdb$field_name as pk_name ' +
            'from rdb$relation_constraints rel ' +
            'join rdb$index_segments i on rel.rdb$index_name = i.rdb$index_name ' +
            'where rel.rdb$constraint_type = "PRIMARY KEY" ' +
            'and rel.rdb$relation_name = ? ' +
            'order by i.rdb$field_position', null, [tableName], (record) => {
            keys.push(record.fieldByName('pk_name').value);
        });
        return keys;
    }
    getTableDef(tableName, fullFieldDefs) {
        let tableDef = new DB.TableDefinition();
        tableDef.tableName = tableName;
        this.query('select rf.rdb$field_name, rfs.rdb$field_type, coalesce(rfs.rdb$character_length, rfs.rdb$field_length) as field_length, ' +
            'rf.rdb$null_flag, rfs.rdb$field_sub_type, rfs.rdb$field_scale, rfs.precision ' +
            'from rdb$relation_fields rf ' +
            'join rdb$fields f on f.rdb$field_name = rf.rdb$field_source ' +
            'where rf.rdb$relation_name = ?', null, [tableDef.tableName], (fieldRec) => {
            let fieldDef = new DB.FieldDefinition();
            fieldDef.fieldName = fieldRec.fieldByName('rdb$field_name').value;
            if (fullFieldDefs) {
                fieldDef.dataType = this.convertDataType(fieldRec.fieldByName('rdb$field_type').value, fieldRec.fieldByName('rdb$field_sub_type').value);
                fieldDef.notNull = (fieldRec.fieldByName('rdb$null_flag').value == 1);
                fieldDef.precision = fieldRec.fieldByName('rdb$precision').value;
                fieldDef.scale = fieldRec.fieldByName('rdb$scale').value;
                fieldDef.length = fieldRec.fieldByName('field_length').value;
                fieldDef.autoInc = false;
            }
            tableDef.fieldDefs.push(fieldDef);
        });
        if (fullFieldDefs)
            tableDef.primaryKeys = this.listPrimaryKeyFields(tableDef.tableName);
        return tableDef;
    }
    listTables(fullFieldDefs) {
        return __awaiter(this, void 0, void 0, function* () {
            let tableDefs = [];
            this.query('select rdb$relation_name from rdb$relations', [], [], (tableRec) => {
                let tableDef = this.getTableDef(tableRec.fieldByName('rdb$relation_name').value, fullFieldDefs);
                tableDefs.push(tableDef);
            });
            return tableDefs;
        });
    }
}
exports.FirebirdDriver = FirebirdDriver;
Driver_1.addDriver('FirebirdDriver', FirebirdDriver);
//# sourceMappingURL=Firebird.js.map