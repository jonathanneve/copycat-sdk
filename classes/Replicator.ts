import * as DB from "./DB"
import {Driver, ReplicationBlock} from "./Driver"
import {Configuration} from '../interfaces/Config';
import {Node} from '../interfaces/Nodes'
import {ClientConfiguration} from '../interfaces/ClientConfig'
import {RestClient} from "./Drivers/Rest"
import {SQLDriver} from './SQLDriver'

export class Replicator {
    private localConfig: ClientConfiguration;     
    public cloudConnection: RestClient;
    public node: Node;
    tables: DB.TableDefinition[];

    constructor (localConf: ClientConfiguration){
        this.localConfig = localConf;
        this.cloudConnection = new RestClient(this.localConfig.accessToken, this.localConfig.cloudURL);        
    }

    async refreshConfig(){
        //Fetch node configuration from cloud and store it in config object
        this.node = await this.cloudConnection.getNodeInfo();
        //this.cloudNodeConfig = await this.cloudConnection.getNodeConfig('CLOUD');
    }

    createLocalTriggers(localDB: SQLDriver, tableName: string): void {
        let tableOptions = this.node.syncToCloud.tables.find((table) => (table.tableName == tableName));                        
        
        //If tableOptions can't be found, it means we should be replicating all tables
        //so we just create a TableOptions object with default options
        if (!tableOptions)
            tableOptions = {tableName: tableName}
        
        localDB.createTriggers(tableOptions);      
    }

    async initializeLocalNode(): Promise<void> {
        await this.refreshConfig();
        
        let localDB = <SQLDriver>this.localConfig.localDatabase;
        await localDB.initReplicationMetadata();
      
        let localTables = await localDB.listTables(true);
        if (this.node.syncToCloud) {
            //Get lists of existing tables 
            let cloudTables = await this.cloudConnection.listTables(false);

            //Cycle through local tables and check if they exist on the cloud
            for (let localTable of localTables) {

                let shouldRepl: boolean;                
                if (this.node.syncToCloud.tables)
                    shouldRepl = (this.node.syncToCloud.tables.find((t) => (t.tableName == localTable.tableName)) != null);
                else if (this.node.syncToCloud.excludedTables)
                    shouldRepl = (this.node.syncToCloud.excludedTables.find((val) => (val == localTable.tableName)) == null);
                else
                    shouldRepl = true;
                    
                if (shouldRepl) {
                    let cloudTable = cloudTables.find((t: DB.TableDefinition) => (t.tableName == localTable.tableName));
                    if (cloudTable) {
                        //Table already exists in the cloud
                        //Compare list of fields and add any missing fields 
                        for (let localField of localTable.fieldDefs) {
                            if (!cloudTable.fieldDefs.find((f) => (f.fieldName == localField.fieldName))) {
                                await this.cloudConnection.updateTable(localTable)
                                break;
                            }
                        }
                        //Create triggers in case they don't already exist
                        this.createLocalTriggers(localDB, localTable.tableName);                        
                    }
                    else {
                        //The table doesn't exist in the cloud, and should be replicated
                        //      1. Create it in the cloud
                        //      2. Create triggers locally
                        //      3. Upload existing data from local DB
                        await this.cloudConnection.createTable(localTable);
                        this.createLocalTriggers(localDB, localTable.tableName);
                        
                        //TODO: import existing data
                    }
                }
                else {
                    //Remove local triggers if table shouldn't be replicated
                    localDB.dropTriggers(localTable.tableName);
                }
            }

            //Add CLOUD to RPL$NODES (nodes to be replicated to)
            localDB.addNode('CLOUD');        
        }
        else {
            //We shouldn't be replicating to the cloud at all (does that ever make sense?)
            //Remove all triggers 
            for (let localTable of localTables) {
                localDB.dropTriggers(localTable.tableName);
            }
        }
    }

    async replicate() {
        let doRepl = async (srcDB: Driver, srcNode: string, destDB: Driver, destNode: string) => {
            let transactions: number[] = await srcDB.getTransactionsToReplicate(destNode);
            if (transactions) {
                for(let trNumber of transactions) {
                    let block: ReplicationBlock;
                    do {
                        block = await srcDB.getRowsToReplicate(destNode, trNumber, (block? block.maxCode: -1));
                        if (block.records.length > 0) {
                            await destDB.replicateBlock(srcNode, block);                                                       
                            await srcDB.validateBlock(block.transactionID, block.maxCode, destNode);                
                        }
                    }
                    while (!block.transactionFinished);
                };        
            }
        };
        await this.refreshConfig();
        
        if (this.node.syncToCloud) 
            await doRepl(this.localConfig.localDatabase, this.localConfig.localNode.nodeName, this.cloudConnection, 'CLOUD');
        if (this.node.syncFromCloud) 
            await doRepl(this.cloudConnection, 'CLOUD', this.localConfig.localDatabase, this.localConfig.localNode.nodeName);
    }
}