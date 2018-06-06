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
var Driver_1 = require("../Driver");
var axios_1 = require("axios");
//import { FirebirdDriver } from "./Firebird";
exports.MAX_REQUEST_SIZE = 100000;
var RestClient = /** @class */ (function (_super) {
    __extends(RestClient, _super);
    function RestClient(accessToken, baseURL) {
        var _this = _super.call(this) || this;
        _this.accessToken = accessToken;
        _this.baseURL = baseURL;
        _this.requestOptions = {
            headers: {
                "Authorization": 'JWT ' + _this.accessToken,
                "Content-Type": 'application/json'
            }
        };
        return _this;
    }
    RestClient.prototype.newReplicationCycle = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doPost(this.baseURL + '/api/v1/node/repl/cycles/', null)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RestClient.prototype.callSSE = function (url, options, callback) {
        return null;
        /* return new Promise<void>((resolve, reject) => {
             let es = new SSE.EventSource(url, options);
             es.onmessage = (e) => {
                 if (e.id == "CLOSE") {
                     es.close();
                     resolve();
                 }
                 else
                     callback(e.data);
             };
             es.onerror = function() {
                 reject();
             };
         })  */
    };
    /*
    async uploadBlob(value: Buffer, blobID: string): Promise<void> {
        let start = 0;
        let end = MAX_REQUEST_SIZE;
        
        while (start < value.length) {
            let finished = false;
            if (end >= value.length) {
                end = value.length;
                finished = true;
            }
            let chunk = new Buffer(end-start);
            value.copy(chunk, 0, start, end);
            let chunkStr = chunk.toString('base64');

            await this.doPut<string>(
                this.baseURL + '/api/v1/node/blob/'
                + blobID + '?batch_id='
                + blobID + "&batch_end=" + (finished ? "1 " : "0"), chunkStr);

            start = end;
            end = start + MAX_REQUEST_SIZE;
        }
    }*/
    RestClient.prototype.getDataRows = function (tableName, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.callSSE(this.baseURL + '/api/v1/node/table/' + tableName + "/data", { headers: this.requestOptions.headers }, callback)];
            });
        });
    };
    RestClient.prototype.importTableData = function (tableName, records, finished) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doPut(this.baseURL + '/api/v1/node/table/' + tableName + "/data" +
                            "?batch_id=dataimport&batch_end=" + (finished ? "1" : "0"), records)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RestClient.prototype.createOrUpdateTable = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doPut(this.baseURL + '/api/v1/node/table/' + table.tableName, table)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, 'OK'];
                }
            });
        });
    };
    RestClient.prototype.createTable = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createOrUpdateTable(table)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RestClient.prototype.updateTable = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createOrUpdateTable(table)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RestClient.prototype.getNodeInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doGet(this.baseURL + '/api/v1/node/')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RestClient.prototype.getTransactionsToReplicate = function (destNode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doGet(this.baseURL + '/api/v1/node/transactions/')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RestClient.prototype.getRowsToReplicate = function (destNode, transaction_number, minCode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doGet(this.baseURL + '/api/v1/node/transaction/'
                            + transaction_number.toString() + '/blocks/' + minCode.toString())];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RestClient.prototype.validateBlock = function (transactionNumber, maxCode, destNode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doDelete(this.baseURL + '/api/v1/node/transaction/'
                            + transactionNumber.toString() + '/blocks/' + maxCode.toString())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RestClient.prototype.replicateBlock = function (origNode, block) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doPut(this.baseURL + '/api/v1/node/transaction/'
                            + block.transactionID.toString() + '/blocks/' + block.maxCode.toString(), block)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RestClient.prototype.listTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doGet(this.baseURL + '/api/v1/node/tables')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RestClient.prototype.getTableDef = function (tableName, fullFieldDefs) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doGet(this.baseURL + '/api/v1/node/table/' + tableName)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RestClient.prototype.doGet = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get(url, this.requestOptions)];
                    case 1:
                        res = _a.sent();
                        if (res.data)
                            return [2 /*return*/, res.data];
                        else
                            throw new Error('Resource not found! HTTP result:' + res.status);
                        return [2 /*return*/];
                }
            });
        });
    };
    RestClient.prototype.doPut = function (url, obj) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.post(url, obj, this.requestOptions)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    RestClient.prototype.doPost = function (url, obj) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.post(url, obj, this.requestOptions)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    RestClient.prototype.doPostEmpty = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.post(url, '', this.requestOptions)];
                    case 1:
                        res = _a.sent();
                        if (res.status > 299)
                            throw new Error(url + ': post failed with HTTP code ' + res.status.toString());
                        return [2 /*return*/];
                }
            });
        });
    };
    RestClient.prototype.doDelete = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.delete(url, this.requestOptions)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RestClient.prototype.initReplicationMetadata = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.post(this.baseURL + '/api/v1/node/init_repl', '', this.requestOptions)];
                    case 1:
                        res = _a.sent();
                        if (res.status > 299)
                            throw new Error('initReplicationMetadata failed with HTTP code ' + res.status.toString());
                        return [2 /*return*/];
                }
            });
        });
    };
    RestClient.prototype.clearReplicationMetadata = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not implemented.');
            });
        });
    };
    return RestClient;
}(Driver_1.Driver));
exports.RestClient = RestClient;
//addDriver('RestClient', RestClient);
//# sourceMappingURL=Rest.js.map