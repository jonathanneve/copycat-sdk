import { Driver } from '../utils/Driver';
var TableOptions = (function () {
    function TableOptions() {
    }
    return TableOptions;
}());
export { TableOptions };
var ReplicationConfig = (function () {
    function ReplicationConfig() {
    }
    return ReplicationConfig;
}());
export { ReplicationConfig };
var NodeConfig = (function () {
    function NodeConfig() {
    }
    return NodeConfig;
}());
export { NodeConfig };
var Node = (function () {
    function Node() {
    }
    Node.prototype.nodeName = function () {
        return this.nodeConfigName + '_' + this.id.toString();
    };
    return Node;
}());
export { Node };
var Configuration = (function () {
    function Configuration() {
        this.recordVersionsToKeepInCloud = 0;
    }
    Configuration.createFromJson = function (json) {
        if (json.cloudDatabase) {
            json.cloudDatabase = Driver.createFromJson(json.cloudDatabase);
        }
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and add it to Configs array
        var conf = Object.assign(new Configuration(), json);
        return conf;
    };
    return Configuration;
}());
export { Configuration };
//# sourceMappingURL=c:/git/copycat-sdk/interfaces/Config.js.map