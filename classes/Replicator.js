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
const Rest_1 = require("./Drivers/Rest");
class Replicator {
    constructor(localConf) {
        this.localConfig = localConf;
        this.cloudConnection = new Rest_1.RestClient(this.localConfig.username, this.localConfig.configName, this.localConfig.accessToken, this.localConfig.cloudURL);
    }
    refreshConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            //Fetch node configuration from cloud and store it in config object
            this.node = yield this.cloudConnection.getNode(this.localConfig.localNode.accessToken);
            //this.cloudNodeConfig = await this.cloudConnection.getNodeConfig('CLOUD');
        });
    }
    initializeLocalNode() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.refreshConfig();
            let localDB = this.localConfig.localDatabase;
            yield localDB.initReplicationMetadata();
            if (this.node.syncToCloud) {
                //TODO: add triggers for all tables if syncToCloud.tables is undefined
                //Create triggers for each table, based on configuration 
                for (let tableOptions of this.node.syncToCloud.tables) {
                    localDB.createTriggers(tableOptions);
                }
                ;
                localDB.addNode('CLOUD');
            }
        });
    }
    replicate() {
        return __awaiter(this, void 0, void 0, function* () {
            let doRepl = (srcDB, srcNode, destDB, destNode) => __awaiter(this, void 0, void 0, function* () {
                let transactions = yield srcDB.getTransactionsToReplicate(destNode);
                if (transactions) {
                    for (let trNumber of transactions) {
                        let block;
                        do {
                            block = yield srcDB.getRowsToReplicate(destNode, trNumber, (block ? block.maxCode : -1));
                            if (block.records.length > 0) {
                                yield destDB.replicateBlock(srcNode, block);
                                yield srcDB.validateBlock(block.transactionID, block.maxCode, destNode);
                            }
                        } while (!block.transactionFinished);
                    }
                    ;
                }
            });
            yield this.refreshConfig();
            if (this.node.syncToCloud)
                yield doRepl(this.localConfig.localDatabase, this.localConfig.localNode.nodeName, this.cloudConnection, 'CLOUD');
            if (this.node.syncFromCloud)
                yield doRepl(this.cloudConnection, 'CLOUD', this.localConfig.localDatabase, this.localConfig.localNode.nodeName);
        });
    }
}
exports.Replicator = Replicator;
//# sourceMappingURL=Replicator.js.map