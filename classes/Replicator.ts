import * as DB from "./DB"
import {Driver, ReplicationBlock} from "./Driver"
import {Configuration} from '../interfaces/Config';
import {TableOptions, NodeConfig} from '../interfaces/Nodes'
import {ClientConfiguration} from '../interfaces/ClientConfig'
import {RestClient} from "./Drivers/Rest"
import {SQLDriver} from './SQLDriver'

export class Replicator {
    private localConfig: ClientConfiguration;     
    public cloudConnection: RestClient;
    public nodeConfig: NodeConfig;
    public cloudNodeConfig: NodeConfig;

    constructor (localConf: ClientConfiguration){
        this.localConfig = localConf;
        this.cloudConnection = new RestClient(this.localConfig.username, this.localConfig.configName, this.localConfig.cloudURL);        
    }

    async refreshConfig(){
        //Fetch node type configuration from cloud and store it in config object
        this.nodeConfig = await this.cloudConnection.getNodeConfig(this.localConfig.localNode.nodeConfigName);
        this.cloudNodeConfig = await this.cloudConnection.getNodeConfig('CLOUD');
    }

    async initializeLocalNode(): Promise<void> {
        await this.refreshConfig();
        
        let localDB = <SQLDriver>this.localConfig.localDatabase;
        await localDB.initReplicationMetadata();

        let localToCloud = this.nodeConfig.destinationNodeConfigs.find(nodeConf => nodeConf.nodeConfigName == 'CLOUD');
        if (localToCloud) {
            //TODO: add triggers for all tables if localToCloud.tables is undefined
            //Create triggers for each table, based on configuration 
            for (let tableOptions of localToCloud.tables) {
                localDB.createTriggers(tableOptions);             
            };

            localDB.addNode(this.localConfig.cloudNodeName);        
        }
    }

    async replicate() {
        let doRepl = async (srcDB: Driver, srcNode: string, destDB: Driver, destNode: string) => {
            let transactions: number[] = await this.localConfig.localDatabase.getTransactionsToReplicate(destNode);
            if (transactions) {
                for(let trNumber of transactions) {
                    let block: ReplicationBlock;
                    do {
                        block = await this.localConfig.localDatabase.getRowsToReplicate(destNode, trNumber, (block? block.maxCode: -1));
                        if (block.records.length > 0) {
                            await destDB.replicateBlock(srcNode, block);                                                       
                            await this.localConfig.localDatabase.validateBlock(block.transactionID, block.maxCode, destNode);                
                        }
                    }
                    while (!block.transactionFinished);
                };        
            }
        };
        await this.refreshConfig();
        
        if (this.nodeConfig.destinationNodeConfigs.find(nodeConf => nodeConf.nodeConfigName == 'CLOUD')) 
            await doRepl(this.localConfig.localDatabase, this.localConfig.localNode.nodeName, this.cloudConnection, this.localConfig.cloudNodeName);
        if (this.cloudNodeConfig.destinationNodeConfigs.find(nodeConf => nodeConf.nodeConfigName == this.nodeConfig.name)) 
            await doRepl(this.cloudConnection, this.localConfig.cloudNodeName, this.localConfig.localDatabase, this.localConfig.localNode.nodeName);
    }
}