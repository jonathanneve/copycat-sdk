import { ReplicationCycle } from "./Log";

export class TableOptions {
    tableName: string;
    excludedFields?: string[];
    includedFields?: string[];
}


//If both tables and excludedTables are empty, replicate all tables
export class ReplicationOptions{
    replicate: boolean;
    tables?: TableOptions[];
    excludedTables?: string[];    
}

export class Node{
    configID: number;
    nodeName: string; 
    accessToken: string;
    syncToCloud: ReplicationOptions = { replicate: true };
    syncFromCloud: ReplicationOptions = { replicate: false };
    lastCycle?: ReplicationCycle;

    getTableSyncLabel(direction: string): string {
        let replOptions = (direction === "TO") ? this.syncToCloud : this.syncFromCloud;
        if (!replOptions.replicate)
            return "Nothing";
        else if (replOptions.tables.length == 0)
            return "Everything";
        else
            return "[Selected tables]";
    }
}
