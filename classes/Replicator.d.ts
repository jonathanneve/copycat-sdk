import { NodeConfig } from '../interfaces/Nodes';
import { ClientConfiguration } from '../interfaces/ClientConfig';
import { RestClient } from "./Drivers/Rest";
export declare class Replicator {
    private localConfig;
    cloudConnection: RestClient;
    nodeConfig: NodeConfig;
    cloudNodeConfig: NodeConfig;
    constructor(localConf: ClientConfiguration);
    refreshConfig(): Promise<void>;
    initializeLocalNode(): Promise<void>;
    replicate(): Promise<void>;
}
