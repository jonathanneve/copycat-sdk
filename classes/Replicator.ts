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

    constructor (localConf: ClientConfiguration){
        this.localConfig = localConf;
        this.cloudConnection = new RestClient(this.localConfig.username, this.localConfig.configName, this.localConfig.accessToken, this.localConfig.cloudURL);        
    }

    async refreshConfig(){
        //Fetch node configuration from cloud and store it in config object
        this.node = await this.cloudConnection.getNode(this.localConfig.localNode.accessToken);
        //this.cloudNodeConfig = await this.cloudConnection.getNodeConfig('CLOUD');
    }

    async initializeLocalNode(): Promise<void> {
        await this.refreshConfig();
        
        let localDB = <SQLDriver>this.localConfig.localDatabase;
        await localDB.initReplicationMetadata();

        
        if (this.node.syncToCloud) {
            //TODO: add triggers for all tables if syncToCloud.tables is undefined
            //Create triggers for each table, based on configuration 
            for (let tableOptions of this.node.syncToCloud.tables) {
                localDB.createTriggers(tableOptions);             
            };

            localDB.addNode('CLOUD');        
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