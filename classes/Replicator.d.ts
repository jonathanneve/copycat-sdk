import * as DB from "./DB";
import { Node } from '../interfaces/Nodes';
import { ClientConfiguration } from '../interfaces/ClientConfig';
import { RestClient } from "./Drivers/Rest";
import { SQLDriver } from './SQLDriver';
export declare class Replicator {
    private localConfig;
    cloudConnection: RestClient;
    node: Node;
    tables: DB.TableDefinition[];
    constructor(localConf: ClientConfiguration);
    refreshConfig(): Promise<void>;
    createLocalTriggers(localDB: SQLDriver, tableName: string): Promise<void>;
    initializeLocalNode(): Promise<void>;
    initializeCloudDatabase(): Promise<void>;
    replicate(): Promise<void>;
}
