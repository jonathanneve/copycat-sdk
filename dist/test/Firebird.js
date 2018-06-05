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
var Driver_1 = require("../classes/Driver");
var DB = require("../classes/DB");
var SQLDriver_1 = require("../classes/SQLDriver");
var fb = require("@spirale-tech/firebird-cc");
var fs = require("fs");
//require("@spirale-tech/copycat-sdk/classes/Driver")
console.log('firebird');
//TODO: handle quoted identifiers
var fbDefs = {
    "databaseType": "Firebird",
    "customMetadata": require("../data/Drivers/firebird.custom.json"),
    "triggerTemplates": []
};
fbDefs.triggerTemplates.push(fs.readFileSync(__dirname + '/../data/Drivers/firebird.trigger1.sql', 'utf8'));
fbDefs.triggerTemplates.push(fs.readFileSync(__dirname + '/../data/Drivers/firebird.trigger2.sql', 'utf8'));
var FirebirdDriver = /** @class */ (function (_super) {
    __extends(FirebirdDriver, _super);
    function FirebirdDriver() {
        var _this = _super.call(this, fbDefs) || this;
        _this.tableDefs = {};
        _this.connectionParams = { database: '', databaseVersion: '', username: '', password: '', role: '' };
        _this.fbConnection = fb.createConnection();
        return _this;
    }
    //Connection
    FirebirdDriver.prototype.isConnected = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.fbConnection.connected];
            });
        });
    };
    FirebirdDriver.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.fbConnection.connectSync(this.connectionParams.database, this.connectionParams.username, this.connectionParams.password, this.connectionParams.role);
                return [2 /*return*/];
            });
        });
    };
    FirebirdDriver.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    //Transaction
    FirebirdDriver.prototype.inTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.fbConnection.inTransaction];
            });
        });
    };
    FirebirdDriver.prototype.startTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.inTransaction())
                    this.fbConnection.startTransactionSync();
                return [2 /*return*/];
            });
        });
    };
    FirebirdDriver.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.inTransaction())
                    this.fbConnection.commitSync();
                return [2 /*return*/];
            });
        });
    };
    FirebirdDriver.prototype.rollback = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.inTransaction())
                    this.fbConnection.rollbackSync();
                return [2 /*return*/];
            });
        });
    };
    FirebirdDriver.prototype.getDataTypesOfFields = function (tableName, keyName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var result_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.tableDefs[tableName]) return [3 /*break*/, 1];
                        return [2 /*return*/, this.tableDefs[tableName]];
                    case 1:
                        result_1 = [];
                        return [4 /*yield*/, this.query("select f.rdb$field_type, f.rdb$field_sub_type from rdb$fields f join rdb$relation_fields rf on rf.rdb$field_name = f.rdb$field_name where rf.rdb$relation_name = ?", null, [tableName], function (record) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    result_1.push(this.convertDataType(record.fieldByName('rdb$field_type').value, record.fieldByName('rdb$field_sub_type').value));
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        this.tableDefs[tableName] = result_1;
                        return [2 /*return*/, result_1];
                }
            });
        });
    };
    FirebirdDriver.prototype.parseDateTime = function (value) {
        throw new Error('Method not implemented!');
    };
    FirebirdDriver.prototype.parseFieldValue = function (dataType, fieldValue) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if ((dataType == DB.DataType.Integer) || (dataType == DB.DataType.SmallInt) || (dataType == DB.DataType.Int64))
                    return [2 /*return*/, parseInt(fieldValue)];
                else if ((dataType == DB.DataType.Float) || (dataType == DB.DataType.BCD))
                    return [2 /*return*/, parseFloat(fieldValue)];
                else if ((dataType == DB.DataType.Date) || (dataType == DB.DataType.Time) || (dataType == DB.DataType.DateTime))
                    return [2 /*return*/, this.parseDateTime(fieldValue)];
                else
                    return [2 /*return*/, fieldValue];
                return [2 /*return*/];
            });
        });
    };
    FirebirdDriver.prototype.convertAPIFieldType = function (sqlType) {
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
    };
    //This function is defined in SQLDriver and serves to interpret the field type information
    //set in CC$LOG_VALUES by the triggers
    //For some incomprehensible reason, the numbers used by Firebird in the system tables are 
    //not the same as the ones used above in convertAPIFieldType, which are returned by the Firebird API
    FirebirdDriver.prototype.getFieldType = function (sqlType) {
        //We do the hard work in the trigger code
        //So the field_type value in CC$LOG_VALUES already represents the DB.DataType enumeration
        return sqlType;
    };
    //This function converts the low-level Firebird datatypes (from rdb$fields) to DB.DataType
    FirebirdDriver.prototype.convertDataType = function (sqlType, subType) {
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
            return DB.DataType.FixedChar;
        else if ((sqlType == 37) || (sqlType == 40))
            return DB.DataType.String;
        else if (sqlType == 261)
            return (subType == 0 ? DB.DataType.Blob : DB.DataType.Memo);
        else if (sqlType == 16)
            return (subType == 0 ? DB.DataType.Int64 : DB.DataType.BCD);
        else if (sqlType == 23)
            return DB.DataType.Boolean;
    };
    FirebirdDriver.prototype.checkRowExists = function (record) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query('select * from ' + record.tableName + this.getWhereClause(record), null, this.getWhereFieldValues(record))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //Query
    FirebirdDriver.prototype.executeSQL = function (sql, autocreateTR, fetchResultSet, callback, params) {
        return __awaiter(this, void 0, void 0, function () {
            var autoStartTR, _a, res, stmt, rows, _i, rows_1, row, record, _b, row_1, field, f, chunkSize, len, buf, bytesRead, numberOfChunks, newBuf, fullBuf, finalBuf, result, rows, _c, E_1, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = autocreateTR;
                        if (!_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.inTransaction()];
                    case 1:
                        _a = !(_e.sent());
                        _e.label = 2;
                    case 2:
                        autoStartTR = _a;
                        if (!autoStartTR) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.startTransaction()];
                    case 3:
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 19, , 24]);
                        res = void 0;
                        if (params && params.length > 0) {
                            stmt = this.fbConnection.prepareSync(sql);
                            stmt.execSync.apply(stmt, params);
                            res = stmt;
                        }
                        else
                            res = this.fbConnection.querySync(sql);
                        if (!fetchResultSet) return [3 /*break*/, 13];
                        if (!callback) return [3 /*break*/, 11];
                        rows = res.fetchSync("all", false, true);
                        if (!rows) return [3 /*break*/, 9];
                        _i = 0, rows_1 = rows;
                        _e.label = 5;
                    case 5:
                        if (!(_i < rows_1.length)) return [3 /*break*/, 8];
                        row = rows_1[_i];
                        record = new DB.Record();
                        for (_b = 0, row_1 = row; _b < row_1.length; _b++) {
                            field = row_1[_b];
                            f = record.addField(field.fieldName);
                            f.dataType = this.convertAPIFieldType(field.sqlType);
                            if ((f.dataType == DB.DataType.Blob) && (field.value != null)) {
                                chunkSize = 256;
                                len = field.sqlLen;
                                buf = Buffer.alloc(chunkSize);
                                field.value._openSync();
                                bytesRead = field.value._readSync(buf);
                                f.size = bytesRead;
                                numberOfChunks = 1;
                                while (bytesRead == chunkSize) {
                                    numberOfChunks++;
                                    newBuf = Buffer.alloc(chunkSize);
                                    bytesRead = field.value._readSync(newBuf);
                                    f.size = f.size + bytesRead;
                                    fullBuf = Buffer.alloc(chunkSize * numberOfChunks);
                                    buf.copy(fullBuf);
                                    newBuf.copy(fullBuf, chunkSize * (numberOfChunks - 1));
                                    buf = fullBuf;
                                }
                                finalBuf = Buffer.alloc(f.size);
                                buf.copy(finalBuf);
                                field.value._closeSync();
                                f.value = finalBuf.toString('base64');
                            }
                            else
                                f.value = field.value;
                        }
                        ;
                        return [4 /*yield*/, callback(record)];
                    case 6:
                        result = _e.sent();
                        //If the callback returns false, we should abort the loop
                        if ((typeof result === "boolean") && !result)
                            return [3 /*break*/, 8];
                        _e.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8:
                        ;
                        return [3 /*break*/, 10];
                    case 9: return [2 /*return*/, false];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        rows = res.fetchSync(1, false, false);
                        return [2 /*return*/, (rows.length > 0)];
                    case 12: return [3 /*break*/, 14];
                    case 13: return [2 /*return*/, true];
                    case 14:
                        _c = autoStartTR;
                        if (!_c) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.inTransaction()];
                    case 15:
                        _c = (_e.sent());
                        _e.label = 16;
                    case 16:
                        if (!_c) return [3 /*break*/, 18];
                        return [4 /*yield*/, this.commit()];
                    case 17:
                        _e.sent();
                        _e.label = 18;
                    case 18: return [3 /*break*/, 24];
                    case 19:
                        E_1 = _e.sent();
                        _d = autoStartTR;
                        if (!_d) return [3 /*break*/, 21];
                        return [4 /*yield*/, this.inTransaction()];
                    case 20:
                        _d = (_e.sent());
                        _e.label = 21;
                    case 21:
                        if (!_d) return [3 /*break*/, 23];
                        return [4 /*yield*/, this.rollback()];
                    case 22:
                        _e.sent();
                        _e.label = 23;
                    case 23: throw new Error('Error executing query: ' + sql + '\n' + E_1);
                    case 24: return [2 /*return*/];
                }
            });
        });
    };
    //Metadata queries    
    FirebirdDriver.prototype.dropTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tableExists(tableName)];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.exec('DROP TABLE ' + tableName)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FirebirdDriver.prototype.tableExists = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("select rdb$relation_name from rdb$relations where rdb$relation_name = ?", null, [tableName])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FirebirdDriver.prototype.triggerExists = function (triggerName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("select rdb$trigger_name from rdb$triggers where rdb$trigger_name = ?", null, [triggerName])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FirebirdDriver.prototype.getMaxTableCounter = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var maxCounter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        maxCounter = 0;
                        return [4 /*yield*/, this.query("select max(counter) as max_counter from cc$tables", null, null, function (rec) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    maxCounter = rec.fieldByName('max_counter').value;
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, maxCounter];
                }
            });
        });
    };
    FirebirdDriver.prototype.getTableCounter = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var counter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        counter = -1;
                        return [4 /*yield*/, this.query("select counter from cc$tables where table_name = ?", null, [tableName], function (rec) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    counter = rec.fieldByName('counter').value;
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, counter];
                }
            });
        });
    };
    FirebirdDriver.prototype.getTriggerName = function (tableName, counter, trigger_number) {
        var counterStr = (10000 + counter).toString().substring(1);
        return 'CC$' + tableName.substring(0, 22) + counterStr + "_" + trigger_number.toString();
    };
    FirebirdDriver.prototype.getDBVersion = function () {
        return parseInt(this.connectionParams.databaseVersion.substring(2));
    };
    FirebirdDriver.prototype.getTriggerSQL = function (tableOptions, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var trigger_number, triggersAlreadyCreated, counter, _i, _a, trig, trigName;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        trigger_number = 1;
                        triggersAlreadyCreated = true;
                        return [4 /*yield*/, this.getTableCounter(tableOptions.tableName)];
                    case 1:
                        counter = _b.sent();
                        if (!(counter == -1)) return [3 /*break*/, 3];
                        triggersAlreadyCreated = false;
                        return [4 /*yield*/, this.getMaxTableCounter()];
                    case 2:
                        counter = (_b.sent()) + 1;
                        _b.label = 3;
                    case 3:
                        _i = 0, _a = this.dbDefinition.triggerTemplates;
                        _b.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        trig = _a[_i];
                        trigName = this.getTriggerName(tableOptions.tableName, counter, trigger_number);
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
                        return [4 /*yield*/, callback(trigName, trig)];
                    case 5:
                        if (!!(_b.sent())) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.dropTriggers(tableOptions.tableName)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        trigger_number++;
                        _b.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 4];
                    case 9:
                        ;
                        if (!!triggersAlreadyCreated) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.exec('insert into CC$TABLES (table_name, counter) values (?, ?)', null, [tableOptions.tableName, counter, tableOptions.includedFields.join(', '), tableOptions.excludedFields.join(', ')])];
                    case 10:
                        _b.sent();
                        _b.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    FirebirdDriver.prototype.getTriggerNames = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var triggers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        triggers = [];
                        return [4 /*yield*/, this.query('select counter from cc$tables where table_name = ?', null, [tableName], function (row) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    triggers.push(this.getTriggerName(tableName, row.fieldByName('counter').value, 1));
                                    triggers.push(this.getTriggerName(tableName, row.fieldByName('counter').value, 2));
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, triggers];
                }
            });
        });
    };
    FirebirdDriver.prototype.dropTriggers = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var triggers, _i, triggers_1, trigger;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTriggerNames(tableName)];
                    case 1:
                        triggers = _a.sent();
                        _i = 0, triggers_1 = triggers;
                        _a.label = 2;
                    case 2:
                        if (!(_i < triggers_1.length)) return [3 /*break*/, 5];
                        trigger = triggers_1[_i];
                        return [4 /*yield*/, this.exec('drop trigger ' + trigger)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.exec('delete from cc$tables where table_name = ?', null, [tableName])];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FirebirdDriver.prototype.getFieldDef = function (field) {
        var fieldType;
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
                fieldType = 'numeric(' + field.precision.toString() + ", " + field.scale + ")";
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
    };
    FirebirdDriver.prototype.createOrUpdateTable = function (tableDef) {
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
    FirebirdDriver.prototype.createTable = function (tableDef) {
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
                        tableDefSQL = 'CREATE TABLE ' + tableDef.tableName + ' ( '
                            + fieldDefs.join(', ')
                            + ((tableDef.primaryKeys.length > 0) ? ", primary key (" + tableDef.primaryKeys.join(', ') + ")" : "")
                            + ")";
                        console.log('creating table: ' + tableDefSQL);
                        return [4 /*yield*/, this.exec(tableDefSQL)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, tableDefSQL];
                }
            });
        });
    };
    FirebirdDriver.prototype.updateTable = function (tableDef) {
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
                            if (!existingTable.fieldDefs.find(function (f) { return (f.fieldName == field.fieldName); })) {
                                var fieldDef = _this.getFieldDef(field);
                                fieldDefs.push('ADD ' + fieldDef);
                            }
                        });
                        tableDefSQL = 'ALTER TABLE ' + tableDef.tableName + ' ( '
                            + fieldDefs.join(', ')
                            // + ((tableDef.primaryKeys.length > 0)? ", primary key (" + tableDef.primaryKeys.join(', ') + ")": "")
                            + ")";
                        console.log('altering table: ' + tableDefSQL);
                        return [4 /*yield*/, this.exec(tableDefSQL)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, tableDefSQL];
                }
            });
        });
    };
    FirebirdDriver.prototype.customMetadataExists = function (objectName, objectType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(objectType == "TABLE")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.tableExists(objectName)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!(objectType == "GENERATOR")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.query("select rdb$generator_name from rdb$generators where rdb$generator_name = ?", null, [objectName])];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        if (!(objectType == "PROCEDURE")) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.query("select rdb$procedure_name from rdb$procedures where rdb$procedure_name = ?", null, [objectName])];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6:
                        if (!(objectType == "TRIGGER")) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.triggerExists(objectName)];
                    case 7: return [2 /*return*/, _a.sent()];
                    case 8: throw new Error('Custom metadata object type ' + objectType + ' not defined!');
                }
            });
        });
    };
    FirebirdDriver.prototype.createCustomMetadata = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec(metadata.SQL.join('\n'))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FirebirdDriver.prototype.setReplicatingNode = function (origNode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec("select rdb$set_context('USER_SESSION', 'REPLICATING_NODE', 'TRUE') from rdb$database")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FirebirdDriver.prototype.listPrimaryKeyFields = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var keys;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = [];
                        return [4 /*yield*/, this.query('select i.rdb$field_name as pk_name ' +
                                'from rdb$relation_constraints rel ' +
                                'join rdb$index_segments i on rel.rdb$index_name = i.rdb$index_name ' +
                                "where rel.rdb$constraint_type = 'PRIMARY KEY' " +
                                'and rel.rdb$relation_name = ? ' +
                                'order by i.rdb$field_position', null, [tableName], function (record) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    keys.push(record.fieldByName('pk_name').value.trim());
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, keys];
                }
            });
        });
    };
    FirebirdDriver.prototype.getTableDef = function (tableName, fullFieldDefs) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var tableDef, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tableDef = new DB.TableDefinition();
                        tableDef.tableName = tableName;
                        tableDef.fieldDefs = [];
                        return [4 /*yield*/, this.query('select rf.rdb$field_name, rfs.rdb$field_type, coalesce(rfs.rdb$character_length, rfs.rdb$field_length) as field_length, ' +
                                'rf.rdb$null_flag, rfs.rdb$field_sub_type, rfs.rdb$field_scale, rfs.rdb$field_precision ' +
                                'from rdb$relation_fields rf ' +
                                'join rdb$fields rfs on rfs.rdb$field_name = rf.rdb$field_source ' +
                                'where rf.rdb$relation_name = ?', null, [tableDef.tableName], function (fieldRec) { return __awaiter(_this, void 0, void 0, function () {
                                var fieldDef;
                                return __generator(this, function (_a) {
                                    fieldDef = new DB.FieldDefinition();
                                    fieldDef.fieldName = fieldRec.fieldByName('rdb$field_name').value.trim();
                                    if (fullFieldDefs) {
                                        fieldDef.dataType = this.convertDataType(fieldRec.fieldByName('rdb$field_type').value, fieldRec.fieldByName('rdb$field_sub_type').value);
                                        fieldDef.notNull = (fieldRec.fieldByName('rdb$null_flag').value == 1);
                                        if (fieldDef.dataType == DB.DataType.BCD) {
                                            if (fieldRec.fieldByName('rdb$field_precision').isNull())
                                                fieldDef.precision = 18;
                                            else
                                                fieldDef.precision = fieldRec.fieldByName('rdb$field_precision').value;
                                            fieldDef.scale = -1 * fieldRec.fieldByName('rdb$field_scale').value;
                                            fieldDef.length = 0;
                                        }
                                        else {
                                            fieldDef.precision = fieldRec.fieldByName('rdb$field_precision').value;
                                            fieldDef.scale = fieldRec.fieldByName('rdb$field_scale').value;
                                            fieldDef.length = fieldRec.fieldByName('field_length').value;
                                        }
                                        fieldDef.autoInc = false;
                                    }
                                    tableDef.fieldDefs.push(fieldDef);
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _b.sent();
                        if (!fullFieldDefs) return [3 /*break*/, 3];
                        _a = tableDef;
                        return [4 /*yield*/, this.listPrimaryKeyFields(tableDef.tableName)];
                    case 2:
                        _a.primaryKeys = _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/, tableDef];
                }
            });
        });
    };
    FirebirdDriver.prototype.listTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var tables;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tables = [];
                        return [4 /*yield*/, this.query("select rdb$relation_name from rdb$relations "
                                + "where rdb$system_flag = 0 and coalesce(rdb$relation_type, 0) = 0 and rdb$view_blr is null "
                                + "and not rdb$relation_name starting with 'CC$'", [], [], function (tableRec) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    tables.push(tableRec.fieldByName('rdb$relation_name').value.trim());
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
    return FirebirdDriver;
}(SQLDriver_1.SQLDriver));
exports.FirebirdDriver = FirebirdDriver;
Driver_1.drivers['FirebirdDriver'] = FirebirdDriver;
console.log('Firebird module initialized');
//# sourceMappingURL=Firebird.js.map