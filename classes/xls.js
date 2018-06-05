"use strict";
exports.__esModule = true;
var XLSX = require("xlsx");
var fs = require("fs-extra");
var xls = /** @class */ (function () {
    function xls(filename) {
        this.workbook = XLSX.readFile(filename);
    }
    xls.prototype.readCell = function (address_of_cell) {
        var first_sheet_name = this.workbook.SheetNames[0];
        /* Get worksheet */
        var worksheet = this.workbook.Sheets[first_sheet_name];
        /* Find desired cell */
        var desired_cell = worksheet[address_of_cell];
        /* Get the value */
        var desired_value = desired_cell ? desired_cell.v : undefined;
        return desired_value;
    };
    xls.prototype.CopyFile = function (source, destination) {
        fs.copy(source, destination, function (err) {
            if (err)
                return console.error(err);
            console.log('success!');
        });
    };
    xls.prototype.VerifModification = function (path) {
        fs.stat(path, function (error, stats) {
            console.log(stats.mtime);
        });
    };
    return xls;
}());
exports.xls = xls;
