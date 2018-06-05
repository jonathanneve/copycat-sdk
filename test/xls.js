"use strict";
exports.__esModule = true;
var xls_1 = require("../classes/xls");
var test = new xls_1.xls('./xls/testxls.xls');
var cell = 'A1';
var result = test.readCell(cell);
console.log(cell + ' : ' + result);
test.CopyFile('./xls/testxls.xls', './xls/xlscopy/test.xls');
test.VerifModification('./xls/testxls.xls');
