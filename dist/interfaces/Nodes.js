"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TableOptions = /** @class */ (function () {
    function TableOptions() {
    }
    return TableOptions;
}());
exports.TableOptions = TableOptions;
//If both tables and excludedTables are empty, replicate all tables
var ReplicationOptions = /** @class */ (function () {
    function ReplicationOptions() {
    }
    return ReplicationOptions;
}());
exports.ReplicationOptions = ReplicationOptions;
var Node = /** @class */ (function () {
    function Node() {
        this.syncToCloud = { replicate: true };
        this.syncFromCloud = { replicate: false };
    }
    Node.prototype.getTableSyncLabel = function (direction) {
        var replOptions = (direction === "TO") ? this.syncToCloud : this.syncFromCloud;
        if (!replOptions.replicate)
            return "Nothing";
        else if (replOptions.tables.length == 0)
            return "Everything";
        else
            return "[Selected tables]";
    };
    return Node;
}());
exports.Node = Node;
var NodeStatus = /** @class */ (function () {
    function NodeStatus() {
    }
    return NodeStatus;
}());
exports.NodeStatus = NodeStatus;
//# sourceMappingURL=Nodes.js.map