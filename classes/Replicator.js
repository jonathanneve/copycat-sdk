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
        this.cloudConnection = new Rest_1.RestClient(this.localConfig.accessToken, this.localConfig.cloudURL);
    }
    refreshConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            //Fetch node configuration from cloud and store it in config object
            this.node = yield this.cloudConnection.getNodeInfo();
            //this.cloudNodeConfig = await this.cloudConnection.getNodeConfig('CLOUD');
        });
    }
    createLocalTriggers(localDB, tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            let tableOptions = this.node.syncToCloud.tables.find((table) => (table.tableName == tableName));
            //If tableOptions can't be found, it means we should be replicating all tables
            //so we just create a TableOptions object with default options
            if (!tableOptions)
                tableOptions = { tableName: tableName, excludedFields: [], includedFields: [] };
            yield localDB.createTriggers(tableOptions);
        });
    }
    pumpTableToCloud(table) {
        return __awaiter(this, void 0, void 0, function* () {
            let rows = yield this.localConfig.localDatabase.getDataRows(table.tableName);
            yield this.cloudConnection.importTableData(table.tableName, rows);
        });
    }
    initializeLocalNode() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('getting node info');
            yield this.refreshConfig();
            console.log('initializing replication tables');
            let localDB = this.localConfig.localDatabase;
            yield localDB.initReplicationMetadata();
            console.log('getting list of tables');
            let localTables = yield localDB.listTables();
            if (this.node.syncToCloud && this.node.syncToCloud.replicate) {
                //Get lists of existing tables 
                let cloudTables = yield this.cloudConnection.listTables();
                //Cycle through local tables and check if they exist on the cloud
                for (let tableName of localTables) {
                    let shouldRepl;
                    if (this.node.syncToCloud.tables && this.node.syncToCloud.tables.length > 0)
                        shouldRepl = (this.node.syncToCloud.tables.find((t) => (t.tableName == tableName)) != null);
                    else if (this.node.syncToCloud.excludedTables && this.node.syncToCloud.excludedTables.length > 0)
                        shouldRepl = (this.node.syncToCloud.excludedTables.find((val) => (val == tableName)) == null);
                    else
                        shouldRepl = true;
                    if (shouldRepl) {
                        let cloudTable = cloudTables.find((t) => (t.toUpperCase() == tableName.toUpperCase()));
                        let localTableDef = yield localDB.getTableDef(tableName, true);
                        if (cloudTable) {
                            //Table already exists in the cloud
                            let cloudTableDef = yield this.cloudConnection.getTableDef(tableName, true);
                            //Compare list of fields and add any missing fields 
                            for (let localField of localTableDef.fieldDefs) {
                                if (!cloudTableDef.fieldDefs.find((f) => (f.fieldName.toUpperCase() == localField.fieldName.toUpperCase()))) {
                                    yield this.cloudConnection.updateTable(localTableDef);
                                    break;
                                }
                            }
                            //Create triggers in case they don't already exist
                            yield this.createLocalTriggers(localDB, tableName);
                        }
                        else {
                            //The table doesn't exist in the cloud, and should be replicated
                            //      1. Create it in the cloud
                            //      2. Create triggers locally
                            //      3. Upload existing data from local DB
                            yield this.cloudConnection.createTable(localTableDef);
                            yield this.createLocalTriggers(localDB, tableName);
                            //await this.pumpTableToCloud(localTable);
                        }
                    }
                    else {
                        //Remove local triggers if table shouldn't be replicated
                        yield localDB.dropTriggers(tableName);
                    }
                }
                //Add CLOUD to RPL$NODES (nodes to be replicated to)
                yield localDB.addNode('CLOUD');
            }
            else {
                //We shouldn't be replicating to the cloud at all (does that ever make sense?)
                //Remove all triggers 
                for (let localTable of localTables) {
                    yield localDB.dropTriggers(localTable);
                }
            }
        });
    }
    initializeCloudDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cloudConnection.initReplicationMetadata();
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
                            block.cycleID = cycle.cycleID;
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
            let cycle = yield this.cloudConnection.newReplicationCycle();
            if (this.node.syncToCloud && this.node.syncToCloud.replicate)
                yield doRepl(this.localConfig.localDatabase, this.localConfig.localNode.nodeName, this.cloudConnection, 'CLOUD');
            if (this.node.syncFromCloud && this.node.syncFromCloud.replicate)
                yield doRepl(this.cloudConnection, 'CLOUD', this.localConfig.localDatabase, this.localConfig.localNode.nodeName);
        });
    }
}
exports.Replicator = Replicator;
//# sourceMappingURL=Replicator.js.map