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
const http = require("typed-rest-client/HttpClient");
const rest = require("typed-rest-client/RestClient");
const SSE = require("eventsource");
//import { FirebirdDriver } from "./Firebird";
console.log('rest');
exports.MAX_REQUEST_SIZE = 100000;
class RestClient extends Driver_1.Driver {
    constructor(accessToken, baseURL) {
        super();
        this.accessToken = accessToken;
        this.baseURL = baseURL;
        this.httpClient = new http.HttpClient('');
        this.restClient = new rest.RestClient('');
        this.requestOptions = {
            additionalHeaders: {
                "Authorization": 'JWT ' + this.accessToken,
                "Content-Type": 'application/json'
            }
        };
    }
    newReplicationCycle() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doPost(this.baseURL + '/api/v1/node/repl/cycles/', null);
        });
    }
    callSSE(url, options, callback) {
        return new Promise((resolve, reject) => {
            let es = new SSE.EventSource(url, options);
            es.onmessage = (e) => {
                if (e.id == "CLOSE") {
                    es.close();
                    resolve();
                }
                else
                    callback(e.data);
            };
            es.onerror = function () {
                reject();
            };
        });
    }
    uploadBlob(value, blobID) {
        return __awaiter(this, void 0, void 0, function* () {
            let start = 0;
            let end = exports.MAX_REQUEST_SIZE;
            while (start < value.length) {
                let finished = false;
                if (end >= value.length) {
                    end = value.length;
                    finished = true;
                }
                let chunk = new Buffer(end - start);
                value.copy(chunk, 0, start, end);
                let chunkStr = chunk.toString('base64');
                yield this.doPut(this.baseURL + '/api/v1/node/blob/'
                    + blobID + '?batch_id='
                    + blobID + "&batch_end=" + (finished ? "1 " : "0"), chunkStr);
                start = end;
                end = start + exports.MAX_REQUEST_SIZE;
            }
        });
    }
    getDataRows(tableName, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.callSSE(this.baseURL + '/api/v1/node/table/' + tableName + "/data", { headers: this.requestOptions.additionalHeaders }, callback);
            //let rows = await this.doGet<DataRow[]>(this.baseURL + '/api/v1/node/table/' + tableName + "/data");
        });
    }
    importTableData(tableName, records, finished) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doPut(this.baseURL + '/api/v1/node/table/' + tableName + "/data" +
                "?batch_id=dataimport&batch_end=" + (finished ? "1" : "0"), records);
        });
    }
    createOrUpdateTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doPut(this.baseURL + '/api/v1/node/table/' + table.tableName, table);
            return 'OK';
        });
    }
    createTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createOrUpdateTable(table);
        });
    }
    updateTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createOrUpdateTable(table);
        });
    }
    getNodeInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doGet(this.baseURL + '/api/v1/node/');
        });
    }
    getTransactionsToReplicate(destNode) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doGet(this.baseURL + '/api/v1/node/transactions/');
        });
    }
    getRowsToReplicate(destNode, transaction_number, minCode) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doGet(this.baseURL + '/api/v1/node/transaction/'
                + transaction_number.toString() + '/blocks/' + minCode.toString());
        });
    }
    validateBlock(transactionNumber, maxCode, destNode) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doDelete(this.baseURL + '/api/v1/node/transaction/'
                + transactionNumber.toString() + '/blocks/' + maxCode.toString());
        });
    }
    replicateBlock(origNode, block) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doPut(this.baseURL + '/api/v1/node/transaction/'
                + block.transactionID.toString() + '/blocks/' + block.maxCode.toString(), block);
        });
    }
    listTables() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doGet(this.baseURL + '/api/v1/node/tables');
        });
    }
    getTableDef(tableName, fullFieldDefs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doGet(this.baseURL + '/api/v1/node/table/' + tableName);
        });
    }
    doGet(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.restClient.get(url, this.requestOptions);
            if (res.result)
                return res.result;
            else
                throw new Error('Resource not found! HTTP result:' + res.statusCode);
        });
    }
    doPut(url, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.restClient.replace(url, obj, this.requestOptions);
            return res.result;
            /*return new Promise<T>((resolve, reject) => {
                if (res.statusCode > 300)
                    reject('HTTP error ' + res.statusCode.toString());
                else
                    resolve(res.result);
            });*/
        });
    }
    doPost(url, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.restClient.create(url, obj, this.requestOptions);
            return res.result;
            /*return new Promise<T>((resolve, reject) => {
                if (res.statusCode > 200)
                    reject('HTTP error ' + res.statusCode.toString());
                else
                    resolve(res.result);
            });*/
        });
    }
    doPostEmpty(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.httpClient.post(url, '', this.requestOptions.additionalHeaders);
            if (res.message.statusCode > 299)
                throw new Error(url + ': post failed with HTTP code ' + res.message.statusCode.toString());
        });
    }
    doDelete(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.restClient.del(url, this.requestOptions);
            return res.result;
            /*return new Promise<T>((resolve, reject) => {
                if (res.statusCode != 200)
                    reject('HTTP error ' + res.statusCode.toString());
                else
                    resolve(res.result);
            });*/
        });
    }
    initReplicationMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            //await this.restClient.create(this.baseURL + '/api/v1/node/init_repl', '', this.requestOptions)
            // doPost<string>(this.baseURL + '/api/v1/node/init_repl', '');   
            let res = yield this.httpClient.post(this.baseURL + '/api/v1/node/init_repl', '', this.requestOptions.additionalHeaders);
            if (res.message.statusCode > 299)
                throw new Error('initReplicationMetadata failed with HTTP code ' + res.message.statusCode.toString());
        });
    }
    clearReplicationMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
}
exports.RestClient = RestClient;
//addDriver('RestClient', RestClient);
//# sourceMappingURL=Rest.js.map