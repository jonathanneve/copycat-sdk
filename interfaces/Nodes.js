"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TableOptions {
}
exports.TableOptions = TableOptions;
class ReplicationConfig {
}
exports.ReplicationConfig = ReplicationConfig;
class NodeConfig {
}
exports.NodeConfig = NodeConfig;
class Node {
    get nodeName() {
        return this.nodeConfigName + '_' + this.nodeID.toString();
    }
}
exports.Node = Node;
//# sourceMappingURL=Nodes.js.map