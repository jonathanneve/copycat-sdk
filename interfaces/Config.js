"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConfigType {
}
exports.ConfigType = ConfigType;
var ConfigCreationStatus;
(function (ConfigCreationStatus) {
    ConfigCreationStatus[ConfigCreationStatus["CreatingDB"] = 0] = "CreatingDB";
    ConfigCreationStatus[ConfigCreationStatus["CreatingNodes"] = 1] = "CreatingNodes";
    ConfigCreationStatus[ConfigCreationStatus["Created"] = 2] = "Created";
})(ConfigCreationStatus = exports.ConfigCreationStatus || (exports.ConfigCreationStatus = {}));
;
class Configuration {
    constructor() {
        this.recordVersionsToKeepInCloud = 0;
        this.configType = new ConfigType();
    }
    static createFromJson(json) {
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and return it
        let conf = Object.assign(new Configuration(), json);
        return conf;
    }
}
exports.Configuration = Configuration;
class ConfigurationStatus {
    constructor() {
        this.alertsLevels = [];
    }
}
exports.ConfigurationStatus = ConfigurationStatus;
//# sourceMappingURL=Config.js.map