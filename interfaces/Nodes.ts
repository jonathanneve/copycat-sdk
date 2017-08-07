export class TableOptions {
    tableName: string;
    excludedFields: string[];
    includedFields: string[];
}

export class ReplicationConfig{
    nodeConfigName: string;
    tables?: TableOptions[];
    excludedTables?: string[];    
}

export class NodeConfig{
    name: string;
    description: string;
    replFrequency: number;
    destinationNodeConfigs: ReplicationConfig[];
}

export class Node{
    username: string;
    configID: number;
    nodeID: number;
    nodeConfigName: string;
    lastReplication?: Date;
    get nodeName(): string {
        return this.nodeConfigName + '_' + this.nodeID.toString();
    }
}
