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
const DB = require("./DB");
const Driver_1 = require("./Driver");
const RPLTableDefs = require("../data/rpltables.json");
RPLTableDefs.forEach((table) => {
    table.fieldDefs.forEach((field) => {
        let dt = DB.DataType[field.dataTypeStr];
        if (!dt)
            throw new Error("Incorrect datatype: " + field.dataTypeStr);
        field.dataType = dt;
    });
});
//Maximum number of rows per replication block
const BLOCKSIZE = 100;
class SQLDriver extends Driver_1.Driver {
    constructor(dbDef) {
        super();
        this.dbDefinition = dbDef;
    }
    processParams(sql, resultParams, namedParams, unnamedParams) {
        let unnamedParamIndex = 0;
        if (namedParams || unnamedParams) {
            //TODO: replace param names by ? and add corresponding values to params in the right position
            sql = sql.replace(/(:\w+)|\?/g, (substr) => {
                if (substr == "?") {
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
    query(sql, namedParams, unnamedParams, callback) {
        let params = [];
        sql = this.processParams(sql, params, namedParams, unnamedParams);
        if (!this.isConnected())
            this.connect();
        return this.executeSQL(sql, true, callback, params);
    }
    exec(sql, namedParams, unnamedParams) {
        let params = [];
        sql = this.processParams(sql, params, namedParams, unnamedParams);
        if (!this.isConnected())
            this.connect();
        this.executeSQL(sql, false, null, params);
    }
    addNode(nodeName) {
        if (!this.query("select login from RPL$USERS where login = ?", null, [nodeName]))
            this.exec('insert into RPL$USERS (LOGIN, CONFIG_NAME) values (?, ?)', null, [nodeName, this.configName]);
        if (this.inTransaction())
            this.commit();
    }
    initReplicationMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: Handle updating tables (missing fields) based on defs
            for (let tableDef of RPLTableDefs) {
                if (!this.tableExists(tableDef.tableName))
                    this.createTable(tableDef);
            }
            ;
            for (let def of this.dbDefinition.customMetadata) {
                if (!this.customMetadataExists(def.objectName, def.objectType))
                    this.createCustomMetadata(def);
            }
            ;
        });
    }
    clearReplicationMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let tableDef of RPLTableDefs) {
                if (this.tableExists(tableDef.tableName))
                    this.dropTable(tableDef.tableName);
            }
            ;
        });
    }
    createTriggers(tableOptions) {
        this.getTriggerSQL(tableOptions, (triggerName, sql) => {
            if (!this.triggerExists(triggerName))
                this.exec(sql);
            return true;
        });
    }
    //REPLICATION FEATURES
    //LOCAL TO REMOTE
    getTransactionsToReplicate(destNode) {
        return __awaiter(this, void 0, void 0, function* () {
            let transactions = [];
            //First get rid of previous replication cycles
            this.exec('delete from RPL$BLOCKS where node_name = ?', null, [destNode]);
            this.commit();
            this.query("select transaction_number, max(code) from RPL$LOG where login = ? " +
                "group by transaction_number order by 2", null, [destNode], (record) => {
                transactions.push(record.fieldByName('transaction_number').value);
            });
            return transactions;
        });
    }
    getRowsToReplicate(destNode, transaction_number, minCode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!minCode)
                minCode = -1;
            let block = new Driver_1.ReplicationBlock();
            //We assume the whole transaction has been sent, and set transactionFinished 
            //to false only if there are more than BLOCKSIZE records
            block.transactionFinished = true;
            block.maxCode = -1;
            this.query('select * from rpl$log where transaction_number = ? and login = ? and code > ? order by code', null, [transaction_number, destNode, minCode], (record) => {
                let rec = new Driver_1.ReplicationRecord();
                let pkFields = this.parseKeys(record.fieldByName('primary_key_fields').value);
                let pkValues = this.parseKeys(record.fieldByName('primary_key_values').value);
                rec.code = record.fieldByName('code').value;
                rec.tableName = record.fieldByName('table_name').value;
                rec.primaryKeys = this.parseKeyValues(rec.tableName, pkFields, pkValues);
                rec.operationType = record.fieldByName('operation_type').value;
                rec.changedFields = this.getChangedFields(record.fieldByName('change_number').value, record.fieldByName('login').value);
                block.records.push(rec);
                if (block.records.length >= BLOCKSIZE) {
                    block.maxCode = record.fieldByName('code').value;
                    block.transactionFinished = false;
                    return false;
                }
                //The return value indicates whether we want to continue reading the dataset or not
                return true;
            });
            block.transactionID = transaction_number;
            block.transactionFinished = true;
            return block;
        });
    }
    getChangedFields(change_number, nodeName) {
        let fields = [];
        this.query("select * from RPL$LOG_VALUES where CHANGE_NUMBER = ? and node_name = ?", null, [change_number, nodeName], (record) => {
            let f = new DB.Field();
            f.fieldName = record.fieldByName('field_name').value;
            if (record.fieldByName('new_value_blob').isNull)
                f.value = record.fieldByName('new_value').value;
            else
                f.value = record.fieldByName('new_value_blob').value;
            f.dataType = this.getFieldType(record.fieldByName('field_type').value);
            fields.push(f);
        });
        return fields;
    }
    validateBlock(transaction_number, maxCode, destNode) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = 'delete from RPL$LOG where transaction_number = ? and login = ?';
            if (maxCode > -1)
                sql = sql + " and code <= ?";
            this.exec(sql, null, [transaction_number, destNode, maxCode]);
            this.commit();
        });
    }
    getSQLStatement(record) {
        if (record.operationType == "I") {
            return 'insert into ' + record.tableName + " ( " +
                record.changedFields.map(f => f.fieldName).join(', ') +
                ' ) values (' +
                record.changedFields.map(f => ":" + f.fieldName).join(', ') +
                ')';
        }
        else if (record.operationType == "U") {
            return 'update ' + record.tableName + " set " +
                record.changedFields.map(f => f.fieldName + " = :" + f.fieldName).join(', ') +
                this.getWhereClause(record);
        }
        else if (record.operationType == "D") {
            return 'delete from ' + record.tableName + " " + this.getWhereClause(record);
        }
    }
    parseKeys(keys) {
        let result = [];
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
        for (let i = 0; i < keys.length; i++) {
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
    parseKeyValues(tableName, keyNames, keyValues) {
        let result = [];
        let keyTypes = this.getDataTypesOfFields(tableName, keyNames);
        keyNames.forEach((keyName, index) => {
            let f = new DB.Field();
            f.fieldName = keyName;
            f.dataType = keyTypes[index];
            f.value = this.parseFieldValue(f.dataType, keyValues[index]);
            result.push(f);
        });
        return result;
    }
    getWhereClause(record) {
        return ' where ' + record.primaryKeys.map(f => f.fieldName + " = ?").join(' and ');
    }
    getWhereFieldValues(record) {
        return record.primaryKeys.map(f => f.value);
    }
    replicateBlock(origNode, block) {
        return __awaiter(this, void 0, void 0, function* () {
            //Connect and start transaction 
            if (!this.isConnected())
                this.connect();
            this.startTransaction();
            try {
                //Check if transactionID/blockID is in RPL$BLOCKS
                //If so, the block has already been replicated: do nothing
                if (!this.query("select code from RPL$BLOCKS where TR_NUMBER = ? and CODE = ? and NODE_NAME = ?", null, [block.transactionID, block.maxCode, origNode])) {
                    //Insert blockID into RPL$TRANSACTIONS
                    this.exec('insert into RPL$BLOCKS (TR_NUMBER, CODE, NODE_NAME) values (?, ?, ?)', null, [block.transactionID, block.maxCode, origNode]);
                    //Initialize replicating node to avoid bouncing
                    this.setReplicatingNode(origNode);
                    //Replicate records in block
                    for (let record of block.records) {
                        let rowExists = this.checkRowExists(record);
                        let keyValues = record.primaryKeys.map(f => '"' + f.value + '"').join(', ');
                        if (!rowExists && (record.operationType == "U" || record.operationType == "D"))
                            throw new Error(`Can't find record : Table: ${record.tableName} Keys: [${keyValues}]!`);
                        else if (rowExists && (record.operationType == "I"))
                            throw new Error(`Row to be inserted already exists: Table: ${record.tableName} Keys: [${keyValues}]!`);
                        let sql = this.getSQLStatement(record);
                        this.exec(sql, record.changedFields, this.getWhereFieldValues(record));
                    }
                    ;
                }
                //Commit or rollback if error
                this.commit();
            }
            catch (E) {
                this.rollback();
                throw E;
            }
            this.disconnect();
        });
    }
}
exports.SQLDriver = SQLDriver;
//# sourceMappingURL=SQLDriver.js.map