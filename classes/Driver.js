"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReplicationRecord {
    constructor() {
        this.changedFields = [];
    }
}
exports.ReplicationRecord = ReplicationRecord;
class ReplicationBlock {
    constructor() {
        this.records = [];
    }
}
exports.ReplicationBlock = ReplicationBlock;
class Driver {
    static createFromJson(json) {
        let driver = Object.create(drivers[json.driverName].prototype);
        driver = driver.constructor();
        driver = Object.assign(driver, json);
        return driver;
    }
}
exports.Driver = Driver;
var drivers = {};
function addDriver(driverName, driverType) {
    drivers[driverName] = driverType;
}
exports.addDriver = addDriver;
//# sourceMappingURL=Driver.js.map