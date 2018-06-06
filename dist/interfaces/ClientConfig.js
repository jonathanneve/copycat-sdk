"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Nodes_1 = require("./Nodes");
var ClientConfiguration = /** @class */ (function () {
    function ClientConfiguration() {
    }
    ClientConfiguration.createFromJson = function (json, driver) {
        json.localDatabase = driver; //Driver.createFromJson(json.localDatabase);        
        json.localNode = Object.assign(new Nodes_1.Node(), json.localNode);
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and add it to Configs array
        var conf = Object.assign(new ClientConfiguration(), json);
        return conf;
    };
    return ClientConfiguration;
}());
exports.ClientConfiguration = ClientConfiguration;
//# sourceMappingURL=ClientConfig.js.map