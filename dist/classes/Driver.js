"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataRow = /** @class */ (function () {
    function DataRow() {
        this.fields = [];
    }
    return DataRow;
}());
exports.DataRow = DataRow;
var ReplicationBlock = /** @class */ (function () {
    function ReplicationBlock() {
        this.records = [];
    }
    return ReplicationBlock;
}());
exports.ReplicationBlock = ReplicationBlock;
var Driver = /** @class */ (function () {
    function Driver() {
    }
    Driver.createFromJson = function (json) {
        var driver = Object.create(exports.drivers[json.driverName].prototype);
        driver.constructor.apply(driver);
        driver = Object.assign(driver, json);
        return driver;
    };
    return Driver;
}());
exports.Driver = Driver;
exports.drivers = {};
function addDriver(driverName, driverType) {
    exports.drivers[driverName] = driverType;
}
exports.addDriver = addDriver;
//# sourceMappingURL=Driver.js.map