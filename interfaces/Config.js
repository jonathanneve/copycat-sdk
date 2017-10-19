"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConfigType {
}
exports.ConfigType = ConfigType;
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
//# sourceMappingURL=Config.js.map