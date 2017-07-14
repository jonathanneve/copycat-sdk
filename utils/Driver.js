var ReplicationRecord = (function () {
    function ReplicationRecord() {
        this.changedFields = [];
    }
    return ReplicationRecord;
}());
export { ReplicationRecord };
var ReplicationBlock = (function () {
    function ReplicationBlock() {
        this.records = [];
    }
    return ReplicationBlock;
}());
export { ReplicationBlock };
var Driver = (function () {
    function Driver() {
    }
    Driver.createFromJson = function (json) {
        var driver = Object.create(drivers[json.driverName].prototype);
        driver = driver.constructor();
        driver = Object.assign(driver, json);
        return driver;
    };
    return Driver;
}());
export { Driver };
var drivers = {};
export function addDriver(driverName, driverType) {
    drivers[driverName] = driverType;
}
//# sourceMappingURL=c:/git/copycat-sdk/utils/Driver.js.map