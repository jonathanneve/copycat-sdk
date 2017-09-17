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
        let driver = Object.create(exports.drivers[json.driverName].prototype);
        driver.constructor.apply(driver);
        driver = Object.assign(driver, json);
        return driver;
    }
}
exports.Driver = Driver;
exports.drivers = {};
function addDriver(driverName, driverType) {
    exports.drivers[driverName] = driverType;
}
exports.addDriver = addDriver;
console.log('Driver module initialized');
//# sourceMappingURL=Driver.js.map