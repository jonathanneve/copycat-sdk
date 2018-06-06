"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigType = /** @class */ (function () {
    function ConfigType() {
    }
    return ConfigType;
}());
exports.ConfigType = ConfigType;
var ConfigCreationStatus;
(function (ConfigCreationStatus) {
    ConfigCreationStatus[ConfigCreationStatus["CreatingDB"] = 0] = "CreatingDB";
    ConfigCreationStatus[ConfigCreationStatus["CreatingNodes"] = 1] = "CreatingNodes";
    ConfigCreationStatus[ConfigCreationStatus["Created"] = 2] = "Created";
})(ConfigCreationStatus = exports.ConfigCreationStatus || (exports.ConfigCreationStatus = {}));
;
var Configuration = /** @class */ (function () {
    function Configuration() {
        this.recordVersionsToKeepInCloud = 0;
        this.configType = new ConfigType();
    }
    Configuration.createFromJson = function (json) {
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and return it
        var conf = Object.assign(new Configuration(), json);
        return conf;
    };
    return Configuration;
}());
exports.Configuration = Configuration;
var ConfigurationStatus = /** @class */ (function () {
    function ConfigurationStatus() {
        this.alertsLevels = [];
    }
    return ConfigurationStatus;
}());
exports.ConfigurationStatus = ConfigurationStatus;
//# sourceMappingURL=Config.js.map