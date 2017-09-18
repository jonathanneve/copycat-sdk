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
//import { FirebirdDriver } from "./Firebird";
console.log('rest');
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
    getDataRows(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doGet(this.baseURL + '/api/v1/node/table/' + tableName + "/data");
        });
    }
    importTableData(tableName, records) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doPut(this.baseURL + '/api/v1/node/table/' + tableName + "/data", records);
        });
    }
    createOrUpdateTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doPut(this.baseURL + '/api/v1/node/table/' + table.tableName, table);
        });
    }
    createTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createOrUpdateTable(table);
        });
    }
    updateTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createOrUpdateTable(table);
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
    listTables(fullFieldDefs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doGet(this.baseURL + '/api/v1/node/tables');
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
            yield this.httpClient.post(this.baseURL + '/api/v1/node/init_repl', '', this.requestOptions);
            //await this.doPost<Object>(this.baseURL + '/api/v1/node/init_repl', {});
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