"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TableOptions {
}
exports.TableOptions = TableOptions;
//If both tables and excludedTables are empty, replicate all tables
class ReplicationOptions {
}
exports.ReplicationOptions = ReplicationOptions;
class Node {
    constructor() {
        this.syncToCloud = { replicate: true };
        this.syncFromCloud = { replicate: false };
    }
    getTableSyncLabel(direction) {
        let replOptions = (direction === "TO") ? this.syncToCloud : this.syncFromCloud;
        if (!replOptions.replicate)
            return "Nothing";
        else if (replOptions.tables.length == 0)
            return "Everything";
        else
            return "[Selected tables]";
    }
}
exports.Node = Node;
//# sourceMappingURL=Nodes.js.map