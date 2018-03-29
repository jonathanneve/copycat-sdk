import { ReplicationCycle } from "./Log";
import { Alert } from "./Alerts";
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
    configID: number;
    nodeName: string;
    accessToken: string;
    syncToCloud: ReplicationOptions;
    syncFromCloud: ReplicationOptions;
    lastCycle?: ReplicationCycle;
    getTableSyncLabel(direction: string): string;
}
export declare class NodeStatus {
    rowsToReplicate: number;
    alerts: Alert[];
    lastReplication: Date;
    replicating: boolean;
}
