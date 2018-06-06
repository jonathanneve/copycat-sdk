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
var SQLDriver_1 = require("./SQLDriver");
var MySQL = require("mysql");
var MySQLDriver = /** @class */ (function (_super) {
    __extends(MySQLDriver, _super);
    // Connection
    function MySQLDriver(Config) {
        var _this = _super.call(this, {
            "databaseType": "MySQL",
            "customMetadata": [],
            "triggerTemplates": []
        }) || this;
        _this.connected = false;
        _this.transactionActive = false;
        _this.connection = MySQL.createConnection(Config);
        return _this;
    }
    MySQLDriver.prototype.isConnected = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.connected];
            });
        });
    };
    MySQLDriver.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.connect()];
                    case 1:
                        _a.sent();
                        this.connected = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    MySQLDriver.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.end()];
                    case 1:
                        _a.sent();
                        this.connected = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    MySQLDriver.prototype.inTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.transactionActive];
            });
        });
    };
    MySQLDriver.prototype.startTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.query("BEGIN")];
                    case 1:
                        _a.sent();
                        this.transactionActive = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    MySQLDriver.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.query("COMMIT")];
                    case 1:
                        _a.sent();
                        this.transactionActive = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    MySQLDriver.prototype.rollback = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.query("ROLLBACK")];
                    case 1:
                        _a.sent();
                        this.transactionActive = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    MySQLDriver.prototype.executeSQL = function (sql, autocreateTR, fetchResultSet, callback, params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var autoStartTR, _a, query, result, E_1, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = autocreateTR;
                        if (!_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.inTransaction()];
                    case 1:
                        _a = !(_c.sent());
                        _c.label = 2;
                    case 2:
                        autoStartTR = _a;
                        if (!autoStartTR) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.startTransaction()];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 8, , 13]);
                        query = new Promise(function (resolve, reject) {
                            _this.connection.query(sql, params, function (err, results, fields) {
                                if (err)
                                    throw new Error(err.message);
                                if (fetchResultSet) {
                                    if (callback) {
                                        if (results && results.length > 0) {
                                            var resultIndex_1 = 0;
                                            var sendResults_1 = function () {
                                                var record = new DB.Record();
                                                var fieldIndex = 0;
                                                for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                                                    var field = fields_1[_i];
                                                    var fieldname = field.name;
                                                    var f = record.addField(fieldname);
                                                    f.value = results[resultIndex_1][fieldname];
                                                    fieldIndex++;
                                                }
                                                callback(record).then(function (result) {
                                                    if ((typeof result === "boolean") && !result)
                                                        resolve(true);
                                                    else {
                                                        resultIndex_1++;
                                                        if (resultIndex_1 == results.length) {
                                                            resolve(true);
                                                        }
                                                        else {
                                                            sendResults_1();
                                                        }
                                                    }
                                                });
                                            };
                                            sendResults_1();
                                        }
                                        else {
                                            resolve(false);
                                        }
                                    }
                                    else {
                                        resolve((results && results.length > 0));
                                    }
                                }
                                else {
                                    resolve(true);
                                }
                            });
                        });
                        return [4 /*yield*/, query];
                    case 5:
                        result = _c.sent();
                        if (!autoStartTR) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.inTransaction()];
                    case 6:
                        if (_c.sent())
                            this.commit();
                        _c.label = 7;
                    case 7: return [2 /*return*/, result];
                    case 8:
                        E_1 = _c.sent();
                        _b = autoStartTR;
                        if (!_b) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.inTransaction()];
                    case 9:
                        _b = (_c.sent());
                        _c.label = 10;
                    case 10:
                        if (!_b) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.rollback()];
                    case 11:
                        _c.sent();
                        _c.label = 12;
                    case 12: throw E_1;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    MySQLDriver.prototype.dropTable = function (tableName) {
        this.exec('DROP TABLE IF EXISTS ' + tableName.toLowerCase() + ';');
        return;
    };
    MySQLDriver.prototype.tableExists = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query('SELECT table_name FROM information_schema.tables WHERE table_schema IN (\'copycat\') AND table_name= ?', null, [tableName.toLowerCase()])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MySQLDriver.prototype.createTable = function (tableDef) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var fieldDefs, tableDefSQL;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fieldDefs = [];
                        tableDef.fieldDefs.forEach(function (field) {
                            var fieldDef = _this.getFieldDef(field);
                            fieldDefs.push(fieldDef);
                        });
                        tableDefSQL = 'CREATE TABLE ' + tableDef.tableName.toLowerCase() + ' ( '
                            + fieldDefs.join(', ')
                            + ((tableDef.primaryKeys.length > 0) ? ", " + tableDef.primaryKeys.map(function (pk) { return pk.trim().toLowerCase(); }).join(', ') + " int(6)  UNSIGNED AUTO_INCREMENT PRIMARY KEY" : "")
                            + ")";
                        console.log('creating table: ' + tableDefSQL);
                        return [4 /*yield*/, this.exec(tableDefSQL)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.commit()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, tableDefSQL];
                }
            });
        });
    };
    MySQLDriver.prototype.listPrimaryKeyFields = function (tableName) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.customMetadataExists = function (objectName, objectType) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.createCustomMetadata = function (metadata) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.getTriggerNames = function (tableName) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.getTriggerSQL = function (tableOptions, callback) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.triggerExists = function (triggerName) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.dropTriggers = function (tableName) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.getFieldDef = function (field) {
        var fieldType;
        switch (field.dataType) {
            case DB.DataType.String:
                fieldType = 'varchar(50)';
                break;
            case DB.DataType.Integer:
                fieldType = 'int';
                break;
            case DB.DataType.Int64:
                fieldType = 'bigint';
                break;
            case DB.DataType.AutoInc:
                fieldType = 'auto_increment';
                break;
            // case DB.DataType.BCD: fieldType = ''; break;
            case DB.DataType.Float:
                fieldType = "float";
                break;
            case DB.DataType.Boolean:
                fieldType = 'boolean';
                break;
            case DB.DataType.Blob:
                fieldType = 'blob';
                break;
            case DB.DataType.Memo:
                fieldType = 'text';
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
        }
        return field.fieldName.toLowerCase().trim() + ' ' + fieldType + (field.notNull ? " not null" : "");
    };
    MySQLDriver.prototype.setReplicatingNode = function (origNode) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.checkRowExists = function (record) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.getDataTypesOfFields = function (tableName, keyName) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.parseFieldValue = function (dataType, fieldValue) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.listTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var tables;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tables = [];
                        return [4 /*yield*/, this.query('SELECT table_name FROM information_schema.tables' +
                                " WHERE table_schema IN ('copycat', 'information_schema')" +
                                " and table_type in ('BASE TABLE','LOCAL TEMPORARY') ORDER BY table_name", null, null, function (tableRec) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    //let tableDef = await this.getTableDef(<string>tableRec.fieldByName('table_name').value, fullFieldDefs);
                                    tables.push(tableRec.fieldByName('table_name').value);
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, tables];
                }
            });
        });
    };
    MySQLDriver.prototype.getTableDef = function (tableName, fullFieldDefs) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var tableDef;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tableDef = new DB.TableDefinition();
                        tableDef.tableName = tableName.toLowerCase();
                        tableDef.fieldDefs = [];
                        return [4 /*yield*/, this.query("SELECT column_name, is_nullable FROM information_schema.columns c WHERE table_name = ?" +
                                " AND EXISTS (SELECT * FROM information_schema.tables t WHERE table_type = 'BASE TABLE' AND c.table_name = t.table_name)", null, [tableDef.tableName], function (fieldRec) { return __awaiter(_this, void 0, void 0, function () {
                                var fieldDef;
                                return __generator(this, function (_a) {
                                    fieldDef = new DB.FieldDefinition();
                                    fieldDef.fieldName = fieldRec.fieldByName('column_name').value.toLowerCase();
                                    if (fullFieldDefs) {
                                        fieldDef.dataType = DB.DataType.String;
                                        fieldDef.notNull = (fieldRec.fieldByName('is_nullable').value == 'NO');
                                        fieldDef.precision = 0;
                                        fieldDef.scale = 0;
                                        fieldDef.length = 0;
                                        fieldDef.autoInc = false;
                                    }
                                    tableDef.fieldDefs.push(fieldDef);
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        if (fullFieldDefs)
                            tableDef.primaryKeys = [];
                        return [2 /*return*/, tableDef];
                }
            });
        });
    };
    MySQLDriver.prototype.updateTable = function (tableDef) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var existingTable, fieldDefs, tableDefSQL;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTableDef(tableDef.tableName, false)];
                    case 1:
                        existingTable = _a.sent();
                        fieldDefs = [];
                        tableDef.fieldDefs.forEach(function (field) {
                            if (!existingTable.fieldDefs.find(function (f) { return (f.fieldName.toLowerCase() == field.fieldName.toLowerCase()); })) {
                                var fieldDef = _this.getFieldDef(field);
                                fieldDefs.push(' ADD ' + fieldDef);
                            }
                            if (existingTable.fieldDefs.find(function (f) { return (f.fieldName.toLowerCase() == field.fieldName.toLowerCase()); })) {
                                var fieldDef = _this.getFieldDef(field);
                                fieldDefs.push(' MODIFY COLUMN ' + fieldDef);
                            }
                        });
                        tableDefSQL = 'ALTER TABLE ' + tableDef.tableName.toLowerCase()
                            + fieldDefs.join(', ');
                        console.log('altering table: ' + tableDefSQL);
                        this.exec(tableDefSQL);
                        this.commit();
                        return [2 /*return*/, tableDefSQL];
                }
            });
        });
    };
    MySQLDriver.prototype.getFieldType = function (sqlType) {
        throw new Error("Method not implemented.");
    };
    MySQLDriver.prototype.createOrUpdateTable = function (tableDef) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tableExists(tableDef.tableName)];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.updateTable(tableDef)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [4 /*yield*/, this.createTable(tableDef)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return MySQLDriver;
}(SQLDriver_1.SQLDriver));
exports.MySQLDriver = MySQLDriver;
//# sourceMappingURL=MySQLDriver.js.map