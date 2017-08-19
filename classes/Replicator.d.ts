import { Node } from '../interfaces/Nodes';
import { ClientConfiguration } from '../interfaces/ClientConfig';
import { RestClient } from "./Drivers/Rest";
export declare class Replicator {
    private localConfig;
    cloudConnection: RestClient;
    node: Node;
    constructor(localConf: ClientConfiguration);
    refreshConfig(): Promise<void>;
    initializeLocalNode(): Promise<void>;
    replicate(): Promise<void>;
}
