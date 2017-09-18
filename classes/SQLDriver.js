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
            //Replace param names by ? and add corresponding values to params in the right position
            sql = sql.replace(/(:(("[^"]+?")|(\w+)))|\?/g, (substr) => {
                if (substr == "?") {
                    if (unnamedParams) {
                        resultParams.push(unnamedParams[unnamedParamIndex]);
                        unnamedParamIndex++;
                    }
                }
                else if (namedParams) {
                    let paramName = substr.substring(1);
                    if (paramName.substring(0, 1) == '"')
                        paramName = paramName.substring(1, paramName.length - 1);
                    let param = namedParams.find(p => p.fieldName.toLowerCase() == paramName.toLowerCase());
                    resultParams.push(param.value);
                }
                return "?";
            });
        }
        return sql;
    }
    query(sql, namedParams, unnamedParams, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = [];
            sql = this.processParams(sql, params, namedParams, unnamedParams);
            if (!(yield this.isConnected()))
                yield this.connect();
            return yield this.executeSQL(sql, true, true, callback, params);
        });
    }
    exec(sql, namedParams, unnamedParams) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = [];
            sql = this.processParams(sql, params, namedParams, unnamedParams);
            if (!(yield this.isConnected()))
                yield this.connect();
            yield this.executeSQL(sql, true, false, null, params);
        });
    }
    addNode(nodeName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.query("select login from CC$USERS where login = ?", null, [nodeName])))
                yield this.exec('insert into CC$USERS (LOGIN, CONFIG_NAME) values (?, ?)', null, [nodeName, this.configName]);
            if (yield this.inTransaction())
                yield this.commit();
        });
    }
    initReplicationMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: Handle updating tables (missing fields) based on defs
            for (let tableDef of RPLTableDefs) {
                if (!(yield this.tableExists(tableDef.tableName)))
                    yield this.createTable(tableDef);
            }
            ;
            for (let def of this.dbDefinition.customMetadata) {
                if (!(yield this.customMetadataExists(def.objectName, def.objectType)))
                    yield this.createCustomMetadata(def);
            }
            ;
        });
    }
    clearReplicationMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let tableDef of RPLTableDefs) {
                if (yield this.tableExists(tableDef.tableName))
                    yield this.dropTable(tableDef.tableName);
            }
            ;
        });
    }
    createTriggers(tableOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getTriggerSQL(tableOptions, (triggerName, sql) => __awaiter(this, void 0, void 0, function* () {
                if (!(yield this.triggerExists(triggerName)))
                    yield this.exec(sql);
                return true;
            }));
        });
    }
    //REPLICATION FEATURES
    //LOCAL TO REMOTE
    getTransactionsToReplicate(destNode) {
        return __awaiter(this, void 0, void 0, function* () {
            let transactions = [];
            //First get rid of previous replication cycles
            yield this.exec('delete from CC$BLOCKS where node_name = ?', null, [destNode]);
            yield this.commit();
            yield this.query("select transaction_number, max(code) from CC$LOG where login = ? " +
                "group by transaction_number order by 2", null, [destNode], (record) => __awaiter(this, void 0, void 0, function* () {
                transactions.push(record.fieldByName('transaction_number').value);
            }));
            return transactions;
        });
    }
    getDataRows(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            let pkFields = yield this.listPrimaryKeyFields(tableName);
            let records = [];
            yield this.query('select * from ' + tableName, null, null, (record) => __awaiter(this, void 0, void 0, function* () {
                let rec = new Driver_1.DataRow();
                let pkValues = pkFields.map(f => record.fieldByName(f).value);
                rec.tableName = tableName;
                rec.primaryKeys = yield this.prepareKeyValues(rec.tableName, pkFields, [], pkValues);
                rec.fields = record.fields.slice();
                records.push(rec);
            }));
            return records;
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
            yield this.query('select * from CC$log where transaction_number = ? and login = ? and code > ? order by code', null, [transaction_number, destNode, minCode], (record) => __awaiter(this, void 0, void 0, function* () {
                let rec = new Driver_1.DataRow();
                let pkFields = this.parseKeys(record.fieldByName('primary_key_fields').value);
                let pkValues = this.parseKeys(record.fieldByName('primary_key_values').value);
                rec.code = record.fieldByName('code').value;
                rec.tableName = record.fieldByName('table_name').value;
                rec.primaryKeys = yield this.prepareKeyValues(rec.tableName, pkFields, pkValues);
                rec.operationType = record.fieldByName('operation_type').value;
                rec.fields = yield this.getChangedFields(record.fieldByName('change_number').value, record.fieldByName('login').value);
                block.records.push(rec);
                if (block.records.length >= BLOCKSIZE) {
                    block.maxCode = record.fieldByName('code').value;
                    block.transactionFinished = false;
                    return false;
                }
                //The return value indicates whether we want to continue reading the dataset or not
                return true;
            }));
            block.transactionID = transaction_number;
            block.transactionFinished = true;
            return block;
        });
    }
    getChangedFields(change_number, nodeName) {
        return __awaiter(this, void 0, void 0, function* () {
            let fields = [];
            yield this.query("select * from CC$LOG_VALUES where CHANGE_NUMBER = ? and node_name = ?", null, [change_number, nodeName], (record) => __awaiter(this, void 0, void 0, function* () {
                let f = new DB.Field();
                f.fieldName = record.fieldByName('field_name').value;
                if (record.fieldByName('new_value_blob').isNull)
                    f.value = record.fieldByName('new_value').value;
                else
                    f.value = record.fieldByName('new_value_blob').value;
                f.dataType = this.getFieldType(record.fieldByName('field_type').value);
                fields.push(f);
            }));
            return fields;
        });
    }
    validateBlock(transaction_number, maxCode, destNode) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = 'delete from CC$LOG where transaction_number = ? and login = ?';
            if (maxCode > -1)
                sql = sql + " and code <= ?";
            yield this.exec(sql, null, [transaction_number, destNode, maxCode]);
            yield this.commit();
        });
    }
    getSQLStatement(record) {
        if (record.operationType == "I") {
            return 'insert into "' + record.tableName.toLowerCase() + '" ( ' +
                record.fields.map(f => '"' + f.fieldName.toLowerCase() + '"').join(', ') +
                ' ) values (' +
                record.fields.map(f => ':"' + f.fieldName.toLowerCase() + '"').join(', ') +
                ')';
        }
        else if (record.operationType == "U") {
            return 'update "' + record.tableName.toLowerCase() + '" set ' +
                record.fields.map(f => '"' + f.fieldName.toLowerCase() + '" = :"' + f.fieldName.toLowerCase() + '"').join(', ') +
                this.getWhereClause(record);
        }
        else if (record.operationType == "D") {
            return 'delete from "' + record.tableName.toLowerCase() + '" ' + this.getWhereClause(record);
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
    prepareKeyValues(tableName, keyNames, keyValues, keyValueObjects) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            let keyTypes = yield this.getDataTypesOfFields(tableName, keyNames);
            for (let keyName of keyNames) {
                let f = new DB.Field();
                let index = keyNames.indexOf(keyName);
                f.fieldName = keyName;
                f.dataType = keyTypes[index];
                if (keyValueObjects)
                    f.value = keyValueObjects[index];
                else
                    f.value = yield this.parseFieldValue(f.dataType, keyValues[index]);
                result.push(f);
            }
            return result;
        });
    }
    getWhereClause(record) {
        return ' where ' + record.primaryKeys.map(f => '"' + f.fieldName.toLowerCase() + '" = ?').join(' and ');
    }
    getWhereFieldValues(record) {
        return record.primaryKeys.map(f => f.value);
    }
    importTableData(tableName, records) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isConnected()))
                yield this.connect();
            yield this.startTransaction();
            try {
                for (let record of records) {
                    let rowExists = yield this.checkRowExists(record);
                    if (rowExists)
                        record.operationType = "U";
                    else
                        record.operationType = "I";
                    let sql = this.getSQLStatement(record);
                    yield this.exec(sql, record.fields, this.getWhereFieldValues(record));
                }
                ;
                yield this.commit();
            }
            catch (E) {
                yield this.rollback();
                throw E;
            }
        });
    }
    replicateBlock(origNode, block) {
        return __awaiter(this, void 0, void 0, function* () {
            //Connect and start transaction 
            if (!(yield this.isConnected()))
                yield this.connect();
            yield this.startTransaction();
            try {
                //Check if transactionID/blockID is in CC$BLOCKS
                //If so, the block has already been replicated: do nothing
                if (!(yield this.query("select code from CC$BLOCKS where TR_NUMBER = ? and CODE = ? and NODE_NAME = ?", null, [block.transactionID, block.maxCode, origNode]))) {
                    //Insert blockID into CC$TRANSACTIONS
                    yield this.exec('insert into CC$BLOCKS (TR_NUMBER, CODE, NODE_NAME) values (?, ?, ?)', null, [block.transactionID, block.maxCode, origNode]);
                    //Initialize replicating node to avoid bouncing
                    yield this.setReplicatingNode(origNode);
                    //Replicate records in block
                    for (let record of block.records) {
                        let rowExists = yield this.checkRowExists(record);
                        let keyValues = record.primaryKeys.map(f => '"' + f.value + '"').join(', ');
                        if (!rowExists && (record.operationType == "U" || record.operationType == "D"))
                            throw new Error(`Can't find record : Table: ${record.tableName} Keys: [${keyValues}]!`);
                        else if (rowExists && (record.operationType == "I"))
                            throw new Error(`Row to be inserted already exists: Table: ${record.tableName} Keys: [${keyValues}]!`);
                        let sql = this.getSQLStatement(record);
                        yield this.exec(sql, record.fields, this.getWhereFieldValues(record));
                    }
                    ;
                }
                //Commit or rollback if error
                yield this.commit();
            }
            catch (E) {
                yield this.rollback();
                throw E;
            }
            //await this.disconnect();
        });
    }
}
exports.SQLDriver = SQLDriver;
//# sourceMappingURL=SQLDriver.js.map