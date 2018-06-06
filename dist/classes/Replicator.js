"use strict";
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
var Rest_1 = require("./drivers/Rest");
var shortid = require("shortid");
var Replicator = /** @class */ (function () {
    function Replicator(localConf) {
        this.localConfig = localConf;
        this.cloudConnection = new Rest_1.RestClient(this.localConfig.accessToken, this.localConfig.cloudURL);
    }
    Replicator.prototype.refreshConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        //Fetch node configuration from cloud and store it in config object
                        _a = this;
                        return [4 /*yield*/, this.cloudConnection.getNodeInfo()];
                    case 1:
                        //Fetch node configuration from cloud and store it in config object
                        _a.node = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Replicator.prototype.createLocalTriggers = function (localDB, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var tableOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tableOptions = this.node.syncToCloud.tables.find(function (table) { return (table.tableName == tableName); });
                        //If tableOptions can't be found, it means we should be replicating all tables
                        //so we just create a TableOptions object with default options
                        if (!tableOptions)
                            tableOptions = { tableName: tableName, excludedFields: [], includedFields: [] };
                        return [4 /*yield*/, localDB.createTriggers(tableOptions)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Replicator.prototype.uploadBlobs = function (row) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, _i, _a, f, blobID;
            return __generator(this, function (_b) {
                fields = [];
                for (_i = 0, _a = row.fields; _i < _a.length; _i++) {
                    f = _a[_i];
                    if (!f.isNull() && ((f.dataType === DB.DataType.Blob) || (f.dataType === DB.DataType.Memo))) {
                        blobID = shortid.generate();
                        //await this.cloudConnection.uploadBlob(<Buffer>f.value, blobID);
                        f.value = blobID;
                    }
                    fields.push(f);
                }
                row.fields = fields;
                return [2 /*return*/, row];
            });
        });
    };
    Replicator.prototype.pumpTableToCloud = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var records, sendRecords;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        records = [];
                        sendRecords = function (finished) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.cloudConnection.importTableData(table.tableName, records, finished)];
                                    case 1:
                                        _a.sent();
                                        records = [];
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, this.localConfig.localDatabase.getDataRows(table.tableName, function (row) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _b = (_a = records).push;
                                            return [4 /*yield*/, this.uploadBlobs(row)];
                                        case 1:
                                            _b.apply(_a, [_c.sent()]);
                                            if (!(JSON.stringify(records).length >= Rest_1.MAX_REQUEST_SIZE)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, sendRecords(false)];
                                        case 2:
                                            _c.sent();
                                            _c.label = 3;
                                        case 3: return [2 /*return*/, true];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, sendRecords(true)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Replicator.prototype.initializeLocalNode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var localDB, localTables, cloudTables, _loop_1, this_1, _i, localTables_1, tableName, _a, localTables_2, localTable;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('getting node info');
                        return [4 /*yield*/, this.refreshConfig()];
                    case 1:
                        _b.sent();
                        console.log('initializing replication tables');
                        localDB = this.localConfig.localDatabase;
                        return [4 /*yield*/, localDB.initReplicationMetadata()];
                    case 2:
                        _b.sent();
                        console.log('getting list of tables');
                        return [4 /*yield*/, localDB.listTables()];
                    case 3:
                        localTables = _b.sent();
                        if (!(this.node.syncToCloud && this.node.syncToCloud.replicate)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.cloudConnection.listTables()];
                    case 4:
                        cloudTables = _b.sent();
                        _loop_1 = function (tableName) {
                            var shouldRepl, cloudTable, localTableDef, cloudTableDef, _loop_2, _i, _a, localField, state_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        shouldRepl = void 0;
                                        if (this_1.node.syncToCloud.tables && this_1.node.syncToCloud.tables.length > 0)
                                            shouldRepl = (this_1.node.syncToCloud.tables.find(function (t) { return (t.tableName == tableName); }) != null);
                                        else if (this_1.node.syncToCloud.excludedTables && this_1.node.syncToCloud.excludedTables.length > 0)
                                            shouldRepl = (this_1.node.syncToCloud.excludedTables.find(function (val) { return (val == tableName); }) == null);
                                        else
                                            shouldRepl = true;
                                        if (!shouldRepl) return [3 /*break*/, 12];
                                        cloudTable = cloudTables.find(function (t) { return (t.toUpperCase() == tableName.toUpperCase()); });
                                        return [4 /*yield*/, localDB.getTableDef(tableName, true)];
                                    case 1:
                                        localTableDef = _b.sent();
                                        if (!cloudTable) return [3 /*break*/, 8];
                                        return [4 /*yield*/, this_1.cloudConnection.getTableDef(tableName, true)];
                                    case 2:
                                        cloudTableDef = _b.sent();
                                        _loop_2 = function (localField) {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!!cloudTableDef.fieldDefs.find(function (f) { return (f.fieldName.toUpperCase() == localField.fieldName.toUpperCase()); })) return [3 /*break*/, 2];
                                                        return [4 /*yield*/, this_1.cloudConnection.updateTable(localTableDef)];
                                                    case 1:
                                                        _a.sent();
                                                        return [2 /*return*/, "break"];
                                                    case 2: return [2 /*return*/];
                                                }
                                            });
                                        };
                                        _i = 0, _a = localTableDef.fieldDefs;
                                        _b.label = 3;
                                    case 3:
                                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                                        localField = _a[_i];
                                        return [5 /*yield**/, _loop_2(localField)];
                                    case 4:
                                        state_1 = _b.sent();
                                        if (state_1 === "break")
                                            return [3 /*break*/, 6];
                                        _b.label = 5;
                                    case 5:
                                        _i++;
                                        return [3 /*break*/, 3];
                                    case 6: 
                                    //Create triggers in case they don't already exist
                                    return [4 /*yield*/, this_1.createLocalTriggers(localDB, tableName)];
                                    case 7:
                                        //Create triggers in case they don't already exist
                                        _b.sent();
                                        return [3 /*break*/, 11];
                                    case 8: 
                                    //The table doesn't exist in the cloud, and should be replicated
                                    //      1. Create it in the cloud
                                    //      2. Create triggers locally
                                    //      3. Upload existing data from local DB
                                    return [4 /*yield*/, this_1.cloudConnection.createTable(localTableDef)];
                                    case 9:
                                        //The table doesn't exist in the cloud, and should be replicated
                                        //      1. Create it in the cloud
                                        //      2. Create triggers locally
                                        //      3. Upload existing data from local DB
                                        _b.sent();
                                        return [4 /*yield*/, this_1.createLocalTriggers(localDB, tableName)];
                                    case 10:
                                        _b.sent();
                                        _b.label = 11;
                                    case 11: return [3 /*break*/, 14];
                                    case 12: 
                                    //Remove local triggers if table shouldn't be replicated
                                    return [4 /*yield*/, localDB.dropTriggers(tableName)];
                                    case 13:
                                        //Remove local triggers if table shouldn't be replicated
                                        _b.sent();
                                        _b.label = 14;
                                    case 14: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, localTables_1 = localTables;
                        _b.label = 5;
                    case 5:
                        if (!(_i < localTables_1.length)) return [3 /*break*/, 8];
                        tableName = localTables_1[_i];
                        return [5 /*yield**/, _loop_1(tableName)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: 
                    //Add CLOUD to RPL$NODES (nodes to be replicated to)
                    return [4 /*yield*/, localDB.addNode('CLOUD')];
                    case 9:
                        //Add CLOUD to RPL$NODES (nodes to be replicated to)
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 10:
                        _a = 0, localTables_2 = localTables;
                        _b.label = 11;
                    case 11:
                        if (!(_a < localTables_2.length)) return [3 /*break*/, 14];
                        localTable = localTables_2[_a];
                        return [4 /*yield*/, localDB.dropTriggers(localTable)];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13:
                        _a++;
                        return [3 /*break*/, 11];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    Replicator.prototype.initializeCloudDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cloudConnection.initReplicationMetadata()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Replicator.prototype.replicate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var doRepl, cycle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        doRepl = function (srcDB, srcNode, destDB, destNode) { return __awaiter(_this, void 0, void 0, function () {
                            var transactions, _i, transactions_1, trNumber, block;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, srcDB.getTransactionsToReplicate(destNode)];
                                    case 1:
                                        transactions = _a.sent();
                                        if (!transactions) return [3 /*break*/, 10];
                                        _i = 0, transactions_1 = transactions;
                                        _a.label = 2;
                                    case 2:
                                        if (!(_i < transactions_1.length)) return [3 /*break*/, 9];
                                        trNumber = transactions_1[_i];
                                        block = void 0;
                                        _a.label = 3;
                                    case 3: return [4 /*yield*/, srcDB.getRowsToReplicate(destNode, trNumber, (block ? block.maxCode : -1))];
                                    case 4:
                                        block = _a.sent();
                                        block.cycleID = cycle.cycleID;
                                        if (!(block.records.length > 0)) return [3 /*break*/, 7];
                                        return [4 /*yield*/, destDB.replicateBlock(srcNode, block)];
                                    case 5:
                                        _a.sent();
                                        return [4 /*yield*/, srcDB.validateBlock(block.transactionID, block.maxCode, destNode)];
                                    case 6:
                                        _a.sent();
                                        _a.label = 7;
                                    case 7:
                                        if (!block.transactionFinished) return [3 /*break*/, 3];
                                        _a.label = 8;
                                    case 8:
                                        _i++;
                                        return [3 /*break*/, 2];
                                    case 9:
                                        ;
                                        _a.label = 10;
                                    case 10: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, this.refreshConfig()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.cloudConnection.newReplicationCycle()];
                    case 2:
                        cycle = _a.sent();
                        if (!(this.node.syncToCloud && this.node.syncToCloud.replicate)) return [3 /*break*/, 4];
                        return [4 /*yield*/, doRepl(this.localConfig.localDatabase, this.localConfig.localNode.nodeName, this.cloudConnection, 'CLOUD')];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(this.node.syncFromCloud && this.node.syncFromCloud.replicate)) return [3 /*break*/, 6];
                        return [4 /*yield*/, doRepl(this.cloudConnection, 'CLOUD', this.localConfig.localDatabase, this.localConfig.localNode.nodeName)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return Replicator;
}());
exports.Replicator = Replicator;
//# sourceMappingURL=Replicator.js.map