export declare class TableOptions {
    tableName: string;
    excludedFields?: string[];
    includedFields?: string[];
}
export declare class ReplicationOptions {
    replicate: boolean;
    tables?: TableOptions[];
    excludedTables?: string[];
}
export declare class Node {
    username: string;
    configName: string;
    nodeName: string;
    accessToken: string;
    syncToCloud: ReplicationOptions;
    syncFromCloud: ReplicationOptions;
    lastReplication?: Date;
    getTableSyncLabel(direction: string): string;
}
