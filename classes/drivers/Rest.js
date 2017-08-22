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
console.log('rest');
class RestClient extends Driver_1.Driver {
    constructor(userName, configName, accessToken, baseURL) {
        super();
        this.userName = userName;
        this.configName = configName;
        this.accessToken = accessToken;
        this.baseURL = baseURL;
        this.httpClient = new http.HttpClient('');
        this.restClient = new rest.RestClient('');
    }
    getNode(nodeConfigName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doGet(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName
                + '/node_configs/' + nodeConfigName);
        });
    }
    getTransactionsToReplicate(destNode) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doGet(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName
                + '/cloud/nodes/' + destNode + '/transactions/');
        });
    }
    getRowsToReplicate(destNode, transaction_number, minCode) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doGet(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName
                + '/cloud/nodes/' + destNode + '/transactions/' + transaction_number.toString() + '/blocks/' + minCode.toString());
        });
    }
    validateBlock(transactionNumber, maxCode, destNode) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doDelete(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName
                + '/cloud/nodes/' + destNode + '/transactions/' + transactionNumber.toString() + '/blocks/' + maxCode.toString());
        });
    }
    replicateBlock(origNode, block) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doPut(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName
                + '/cloud/nodes/' + origNode + '/transactions/' + block.transactionID.toString() + '/blocks/' + block.maxCode.toString(), block);
        });
    }
    listTables(fullFieldDefs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doGet(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName + '/tables');
        });
    }
    createTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doPost(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName + '/tables', table);
        });
    }
    updateTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doPut(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName + '/tables', table);
        });
    }
    doGet(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.restClient.get(url);
            return new Promise((resolve, reject) => {
                if (res.statusCode != 200)
                    reject('HTTP error ' + res.statusCode.toString());
                else
                    resolve(res.result);
            });
        });
    }
    doPut(url, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.restClient.replace(url, obj);
            return new Promise((resolve, reject) => {
                if (res.statusCode != 200)
                    reject('HTTP error ' + res.statusCode.toString());
                else
                    resolve(res.result);
            });
        });
    }
    doPost(url, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.restClient.create(url, obj);
            return new Promise((resolve, reject) => {
                if (res.statusCode != 200)
                    reject('HTTP error ' + res.statusCode.toString());
                else
                    resolve(res.result);
            });
        });
    }
    doDelete(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.restClient.del(url);
            return new Promise((resolve, reject) => {
                if (res.statusCode != 200)
                    reject('HTTP error ' + res.statusCode.toString());
                else
                    resolve(res.result);
            });
        });
    }
    initReplicationMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
            //        return await this.doPost<void>(this.baseURL + '/api/v1/users/' + this.userID.toString() + '/configs/' + this.configID.toString() + '/initReplicationMetadata', '');                      
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