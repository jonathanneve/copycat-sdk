"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var DB = require("./DB");
var Driver_1 = require("./Driver");
var RPLTableDefs = require("../data/rpltables.json");
RPLTableDefs.forEach(function (table) {
    table.fieldDefs.forEach(function (field) {
        var dt = DB.DataType[field.dataTypeStr];
        if (!dt)
            throw new Error("Incorrect datatype: " + field.dataTypeStr);
        field.dataType = dt;
    });
});
//Maximum number of rows per replication block
var BLOCKSIZE = 100;
var SQLDriver = /** @class */ (function (_super) {
    __extends(SQLDriver, _super);
    function SQLDriver(dbDef) {
        var _this = _super.call(this) || this;
        _this.dbDefinition = dbDef;
        return _this;
    }
    SQLDriver.prototype.processParams = function (sql, resultParams, namedParams, unnamedParams) {
        var unnamedParamIndex = 0;
        if (namedParams || unnamedParams) {
            //Replace param names by ? and add corresponding values to params in the right position
            sql = sql.replace(/(:(("[^"]+?")|(\w+)))|\?/g, function (substr) {
                if (substr == "?") {
                    if (unnamedParams) {
                        resultParams.push(unnamedParams[unnamedParamIndex]);
                        unnamedParamIndex++;
                    }
                }
                else if (namedParams) {
                    var paramName_1 = substr.substring(1);
                    if (paramName_1.substring(0, 1) == '"')
                        paramName_1 = paramName_1.substring(1, paramName_1.length - 1);
                    var param = namedParams.find(function (p) { return p.fieldName.toLowerCase() == paramName_1.toLowerCase(); });
                    resultParams.push(param.value);
                }
                return "?";
            });
        }
        return sql;
    };
    SQLDriver.prototype.query = function (sql, namedParams, unnamedParams, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = [];
                        sql = this.processParams(sql, params, namedParams, unnamedParams);
                        return [4 /*yield*/, this.isConnected()];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.connect()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.executeSQL(sql, true, true, callback, params)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SQLDriver.prototype.exec = function (sql, namedParams, unnamedParams) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = [];
                        sql = this.processParams(sql, params, namedParams, unnamedParams);
                        return [4 /*yield*/, this.isConnected()];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.connect()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.executeSQL(sql, true, false, null, params)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SQLDriver.prototype.addNode = function (nodeName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("select login from CC$USERS where login = ?", null, [nodeName])];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.exec('insert into CC$USERS (LOGIN, CONFIG_NAME) values (?, ?)', null, [nodeName, this.configName])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.inTransaction()];
                    case 4:
                        if (!_a.sent()) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.commit()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SQLDriver.prototype.initReplicationMetadata = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, RPLTableDefs_1, tableDef, _a, _b, def;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, RPLTableDefs_1 = RPLTableDefs;
                        _c.label = 1;
                    case 1:
                        if (!(_i < RPLTableDefs_1.length)) return [3 /*break*/, 5];
                        tableDef = RPLTableDefs_1[_i];
                        return [4 /*yield*/, this.tableExists(tableDef.tableName)];
                    case 2:
                        if (!!(_c.sent())) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.createTable(tableDef)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        ;
                        _a = 0, _b = this.dbDefinition.customMetadata;
                        _c.label = 6;
                    case 6:
                        if (!(_a < _b.length)) return [3 /*break*/, 10];
                        def = _b[_a];
                        return [4 /*yield*/, this.customMetadataExists(def.objectName, def.objectType)];
                    case 7:
                        if (!!(_c.sent())) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.createCustomMetadata(def)];
                    case 8:
                        _c.sent();
                        _c.label = 9;
                    case 9:
                        _a++;
                        return [3 /*break*/, 6];
                    case 10:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    SQLDriver.prototype.clearReplicationMetadata = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, RPLTableDefs_2, tableDef;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, RPLTableDefs_2 = RPLTableDefs;
                        _a.label = 1;
                    case 1:
                        if (!(_i < RPLTableDefs_2.length)) return [3 /*break*/, 5];
                        tableDef = RPLTableDefs_2[_i];
                        return [4 /*yield*/, this.tableExists(tableDef.tableName)];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.dropTable(tableDef.tableName)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    SQLDriver.prototype.createTriggers = function (tableOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTriggerSQL(tableOptions, function (triggerName, sql) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.triggerExists(triggerName)];
                                    case 1:
                                        if (!!(_a.sent())) return [3 /*break*/, 3];
                                        return [4 /*yield*/, this.exec(sql)];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [2 /*return*/, true];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //REPLICATION FEATURES
    //LOCAL TO REMOTE
    SQLDriver.prototype.getTransactionsToReplicate = function (destNode) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var transactions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transactions = [];
                        //First get rid of previous replication cycles
                        return [4 /*yield*/, this.exec('delete from CC$BLOCKS where node_name = ?', null, [destNode])];
                    case 1:
                        //First get rid of previous replication cycles
                        _a.sent();
                        return [4 /*yield*/, this.commit()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.query("select transaction_number, max(code) from CC$LOG where login = ? " +
                                "group by transaction_number order by 2", null, [destNode], function (record) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    transactions.push(record.fieldByName('transaction_number').value);
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, transactions];
                }
            });
        });
    };
    SQLDriver.prototype.getDataRows = function (tableName, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var pkFields;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.listPrimaryKeyFields(tableName)];
                    case 1:
                        pkFields = _a.sent();
                        //let records: DataRow[] = [];
                        return [4 /*yield*/, this.query('select * from ' + tableName, null, null, function (record) { return __awaiter(_this, void 0, void 0, function () {
                                var rec, pkValues;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            rec = new Driver_1.DataRow();
                                            pkValues = pkFields.map(function (f) { return record.fieldByName(f).value; });
                                            rec.tableName = tableName;
                                            //rec.primaryKeys = await this.prepareKeyValues(rec.tableName, pkFields, [], pkValues);
                                            rec.fields = record.fields.slice();
                                            return [4 /*yield*/, callback(rec)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })];
                    case 2:
                        //let records: DataRow[] = [];
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SQLDriver.prototype.getRowsToReplicate = function (destNode, transaction_number, minCode) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!minCode)
                            minCode = -1;
                        block = new Driver_1.ReplicationBlock();
                        //We assume the whole transaction has been sent, and set transactionFinished 
                        //to false only if there are more than BLOCKSIZE records
                        block.transactionFinished = true;
                        block.maxCode = -1;
                        return [4 /*yield*/, this.query('select * from CC$log where transaction_number = ? and login = ? and code > ? order by code', null, [transaction_number, destNode, minCode], function (record) { return __awaiter(_this, void 0, void 0, function () {
                                var rec, pkFields, pkValues, _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            rec = new Driver_1.DataRow();
                                            pkFields = this.parseKeys(record.fieldByName('primary_key_fields').value);
                                            pkValues = this.parseKeys(record.fieldByName('primary_key_values').value);
                                            rec.code = record.fieldByName('code').value;
                                            rec.tableName = record.fieldByName('table_name').value;
                                            _a = rec;
                                            return [4 /*yield*/, this.prepareKeyValues(rec.tableName, pkFields, pkValues)];
                                        case 1:
                                            _a.primaryKeys = _c.sent();
                                            rec.operationType = record.fieldByName('operation_type').value;
                                            _b = rec;
                                            return [4 /*yield*/, this.getChangedFields(record.fieldByName('change_number').value, record.fieldByName('login').value)];
                                        case 2:
                                            _b.fields = _c.sent();
                                            block.records.push(rec);
                                            if (block.records.length >= BLOCKSIZE) {
                                                block.maxCode = record.fieldByName('code').value;
                                                block.transactionFinished = false;
                                                return [2 /*return*/, false];
                                            }
                                            //The return value indicates whether we want to continue reading the dataset or not
                                            return [2 /*return*/, true];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        block.transactionID = transaction_number;
                        block.transactionFinished = true;
                        return [2 /*return*/, block];
                }
            });
        });
    };
    SQLDriver.prototype.getChangedFields = function (change_number, nodeName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var fields;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = [];
                        return [4 /*yield*/, this.query("select * from CC$LOG_VALUES where CHANGE_NUMBER = ? and node_name = ?", null, [change_number, nodeName], function (record) { return __awaiter(_this, void 0, void 0, function () {
                                var f;
                                return __generator(this, function (_a) {
                                    f = new DB.Field();
                                    f.fieldName = record.fieldByName('field_name').value;
                                    if (record.fieldByName('new_value_blob').isNull)
                                        f.value = record.fieldByName('new_value').value;
                                    else
                                        f.value = record.fieldByName('new_value_blob').value;
                                    f.dataType = this.getFieldType(record.fieldByName('field_type').value);
                                    fields.push(f);
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, fields];
                }
            });
        });
    };
    SQLDriver.prototype.validateBlock = function (transaction_number, maxCode, destNode) {
        return __awaiter(this, void 0, void 0, function () {
            var sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = 'delete from CC$LOG where transaction_number = ? and login = ?';
                        if (maxCode > -1)
                            sql = sql + " and code <= ?";
                        return [4 /*yield*/, this.exec(sql, null, [transaction_number, destNode, maxCode])];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.commit()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SQLDriver.prototype.getSQLStatement = function (record) {
        if (record.operationType == "I") {
            return 'insert into "' + record.tableName.toLowerCase() + '" ( ' +
                record.fields.map(function (f) { return '"' + f.fieldName.toLowerCase() + '"'; }).join(', ') +
                ' ) values (' +
                record.fields.map(function (f) { return ':"' + f.fieldName.toLowerCase() + '"'; }).join(', ') +
                ')';
        }
        else if (record.operationType == "U") {
            return 'update "' + record.tableName.toLowerCase() + '" set ' +
                record.fields.map(function (f) { return '"' + f.fieldName.toLowerCase() + '" = :"' + f.fieldName.toLowerCase() + '"'; }).join(', ') +
                this.getWhereClause(record);
        }
        else if (record.operationType == "D") {
            return 'delete from "' + record.tableName.toLowerCase() + '" ' + this.getWhereClause(record);
        }
    };
    SQLDriver.prototype.parseKeys = function (keys) {
        var result = [];
        var escaped = false;
        var inQuote = false;
        var isNull = false;
        var expr = "";
        var endExpression = function () {
            if (isNull)
                result.push(null);
            else
                result.push(expr);
            escaped = false;
            inQuote = false;
            isNull = false;
            expr = "";
        };
        for (var i = 0; i < keys.length; i++) {
            var c = keys.charAt(i);
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
    };
    SQLDriver.prototype.prepareKeyValues = function (tableName, keyNames, keyValues, keyValueObjects) {
        return __awaiter(this, void 0, void 0, function () {
            var result, keyTypes, _i, keyNames_1, keyName, f, index, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        result = [];
                        return [4 /*yield*/, this.getDataTypesOfFields(tableName, keyNames)];
                    case 1:
                        keyTypes = _b.sent();
                        _i = 0, keyNames_1 = keyNames;
                        _b.label = 2;
                    case 2:
                        if (!(_i < keyNames_1.length)) return [3 /*break*/, 7];
                        keyName = keyNames_1[_i];
                        f = new DB.Field();
                        index = keyNames.indexOf(keyName);
                        f.fieldName = keyName;
                        f.dataType = keyTypes[index];
                        if (!keyValueObjects) return [3 /*break*/, 3];
                        f.value = keyValueObjects[index];
                        return [3 /*break*/, 5];
                    case 3:
                        _a = f;
                        return [4 /*yield*/, this.parseFieldValue(f.dataType, keyValues[index])];
                    case 4:
                        _a.value = _b.sent();
                        _b.label = 5;
                    case 5:
                        result.push(f);
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, result];
                }
            });
        });
    };
    SQLDriver.prototype.getWhereClause = function (record) {
        return ' where ' + record.primaryKeys.map(function (f) { return '"' + f.fieldName.toLowerCase() + '" = ?'; }).join(' and ');
    };
    SQLDriver.prototype.getWhereFieldValues = function (record) {
        return record.primaryKeys.map(function (f) { return f.value; });
    };
    SQLDriver.prototype.importTableData = function (tableName, records, finished) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, records_1, record, rowExists, sql, E_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isConnected()];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.connect()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.startTransaction()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 12, , 14]);
                        _i = 0, records_1 = records;
                        _a.label = 6;
                    case 6:
                        if (!(_i < records_1.length)) return [3 /*break*/, 10];
                        record = records_1[_i];
                        return [4 /*yield*/, this.checkRowExists(record)];
                    case 7:
                        rowExists = _a.sent();
                        if (rowExists)
                            record.operationType = "U";
                        else
                            record.operationType = "I";
                        sql = this.getSQLStatement(record);
                        return [4 /*yield*/, this.exec(sql, record.fields, this.getWhereFieldValues(record))];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 6];
                    case 10:
                        ;
                        return [4 /*yield*/, this.commit()];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 12:
                        E_1 = _a.sent();
                        return [4 /*yield*/, this.rollback()];
                    case 13:
                        _a.sent();
                        throw E_1;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    SQLDriver.prototype.replicateBlock = function (origNode, block) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, record, rowExists, keyValues, sql, E_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.isConnected()];
                    case 1:
                        if (!!(_b.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.connect()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, this.startTransaction()];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 16, , 18]);
                        return [4 /*yield*/, this.query("select code from CC$BLOCKS where TR_NUMBER = ? and CODE = ? and NODE_NAME = ?", null, [block.transactionID, block.maxCode, origNode])];
                    case 6:
                        if (!!(_b.sent())) return [3 /*break*/, 14];
                        //Insert blockID into CC$TRANSACTIONS
                        return [4 /*yield*/, this.exec('insert into CC$BLOCKS (TR_NUMBER, CODE, NODE_NAME) values (?, ?, ?)', null, [block.transactionID, block.maxCode, origNode])];
                    case 7:
                        //Insert blockID into CC$TRANSACTIONS
                        _b.sent();
                        //Initialize replicating node to avoid bouncing
                        return [4 /*yield*/, this.setReplicatingNode(origNode)];
                    case 8:
                        //Initialize replicating node to avoid bouncing
                        _b.sent();
                        _i = 0, _a = block.records;
                        _b.label = 9;
                    case 9:
                        if (!(_i < _a.length)) return [3 /*break*/, 13];
                        record = _a[_i];
                        return [4 /*yield*/, this.checkRowExists(record)];
                    case 10:
                        rowExists = _b.sent();
                        keyValues = record.primaryKeys.map(function (f) { return '"' + f.value + '"'; }).join(', ');
                        if (!rowExists && (record.operationType == "U" || record.operationType == "D"))
                            throw new Error("Can't find record : Table: " + record.tableName + " Keys: [" + keyValues + "]!");
                        else if (rowExists && (record.operationType == "I"))
                            throw new Error("Row to be inserted already exists: Table: " + record.tableName + " Keys: [" + keyValues + "]!");
                        sql = this.getSQLStatement(record);
                        return [4 /*yield*/, this.exec(sql, record.fields, this.getWhereFieldValues(record))];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12:
                        _i++;
                        return [3 /*break*/, 9];
                    case 13:
                        ;
                        _b.label = 14;
                    case 14: 
                    //Commit or rollback if error
                    return [4 /*yield*/, this.commit()];
                    case 15:
                        //Commit or rollback if error
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 16:
                        E_2 = _b.sent();
                        return [4 /*yield*/, this.rollback()];
                    case 17:
                        _b.sent();
                        throw E_2;
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    return SQLDriver;
}(Driver_1.Driver));
exports.SQLDriver = SQLDriver;
//# sourceMappingURL=SQLDriver.js.map