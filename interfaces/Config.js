"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Driver_1 = require("../classes/Driver");
class ConfigType {
}
exports.ConfigType = ConfigType;
class Configuration {
    constructor() {
        this.recordVersionsToKeepInCloud = 0;
        this.configType = new ConfigType();
    }
    static createFromJson(json) {
        if (json.cloudDatabase) {
            json.cloudDatabase = Driver_1.Driver.createFromJson(json.cloudDatabase);
        }
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and return it
        let conf = Object.assign(new Configuration(), json);
        return conf;
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=Config.js.map