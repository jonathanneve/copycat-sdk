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
        this.cloudConnection = new Rest_1.RestClient(this.localConfig.username, this.localConfig.configName, this.localConfig.cloudURL);
    }
    refreshConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            //Fetch node type configuration from cloud and store it in config object
            this.nodeConfig = yield this.cloudConnection.getNodeConfig(this.localConfig.localNode.nodeConfigName);
            this.cloudNodeConfig = yield this.cloudConnection.getNodeConfig('CLOUD');
        });
    }
    initializeLocalNode() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.refreshConfig();
            let localDB = this.localConfig.localDatabase;
            yield localDB.initReplicationMetadata();
            let localToCloud = this.nodeConfig.destinationNodeConfigs.find(nodeConf => nodeConf.nodeConfigName == 'CLOUD');
            if (localToCloud) {
                //TODO: add triggers for all tables if localToCloud.tables is undefined
                //Create triggers for each table, based on configuration 
                for (let tableOptions of localToCloud.tables) {
                    localDB.createTriggers(tableOptions);
                }
                ;
                localDB.addNode(this.localConfig.cloudNodeName);
            }
        });
    }
    replicate() {
        return __awaiter(this, void 0, void 0, function* () {
            let doRepl = (srcDB, srcNode, destDB, destNode) => __awaiter(this, void 0, void 0, function* () {
                let transactions = yield this.localConfig.localDatabase.getTransactionsToReplicate(destNode);
                if (transactions) {
                    for (let trNumber of transactions) {
                        let block;
                        do {
                            block = yield this.localConfig.localDatabase.getRowsToReplicate(destNode, trNumber, (block ? block.maxCode : -1));
                            if (block.records.length > 0) {
                                yield destDB.replicateBlock(srcNode, block);
                                yield this.localConfig.localDatabase.validateBlock(block.transactionID, block.maxCode, destNode);
                            }
                        } while (!block.transactionFinished);
                    }
                    ;
                }
            });
            yield this.refreshConfig();
            if (this.nodeConfig.destinationNodeConfigs.find(nodeConf => nodeConf.nodeConfigName == 'CLOUD'))
                yield doRepl(this.localConfig.localDatabase, this.localConfig.localNode.nodeName, this.cloudConnection, this.localConfig.cloudNodeName);
            if (this.cloudNodeConfig.destinationNodeConfigs.find(nodeConf => nodeConf.nodeConfigName == this.nodeConfig.name))
                yield doRepl(this.cloudConnection, this.localConfig.cloudNodeName, this.localConfig.localDatabase, this.localConfig.localNode.nodeName);
        });
    }
}
exports.Replicator = Replicator;
//# sourceMappingURL=Replicator.js.map