export declare class TableOptions {
    tableName: string;
    excludedFields: string[];
    includedFields: string[];
}
export declare class ReplicationConfig {
    nodeConfigName: string;
    tables?: TableOptions[];
    excludedTables?: string[];
}
export declare class NodeConfig {
    name: string;
    description: string;
    replFrequency: number;
    tables?: TableOptions[];
    excludedTables?: string[];
    destinationNodeConfigs: ReplicationConfig[];
}
export declare class Node {
    username: string;
    configID: number;
    nodeID: number;
    nodeConfigName: string;
    lastReplication?: Date;
    readonly nodeName: string;
}
