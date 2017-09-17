"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Nodes_1 = require("./Nodes");
class ClientConfiguration {
    static createFromJson(json, driver) {
        json.localDatabase = driver; //Driver.createFromJson(json.localDatabase);        
        json.localNode = Object.assign(new Nodes_1.Node(), json.localNode);
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and add it to Configs array
        let conf = Object.assign(new ClientConfiguration(), json);
        return conf;
    }
}
exports.ClientConfiguration = ClientConfiguration;
//# sourceMappingURL=ClientConfig.js.map