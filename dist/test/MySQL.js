"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("../classes/MySQLDriver");
var DB = require("../classes/DB");
var Config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'copycat'
};
var test = new mysql.MySQLDriver(Config);
var newTable = new DB.TableDefinition();
var updateTable = new DB.TableDefinition();
var fieldNewTable = new DB.FieldDefinition;
var updatefieldNewTable = new DB.FieldDefinition;
fieldNewTable.fieldName = 'test';
fieldNewTable.dataType = DB.DataType.String;
newTable.tableName = 'NewTable';
newTable.fieldDefs = [fieldNewTable];
newTable.primaryKeys = ['id'];
updatefieldNewTable.fieldName = 'test';
updatefieldNewTable.dataType = DB.DataType.Integer;
updateTable.tableName = 'NewTable';
updateTable.fieldDefs = [updatefieldNewTable];
test.connect()
    .then(function () { return test.isConnected(); })
    .then(function (connected) {
    console.log('Connecté à la BDD :' + connected);
    return test.startTransaction();
})
    .then(function () { return test.tableExists('test'); })
    .then(function (tableExist) {
    console.log('la table test exist : ' + tableExist);
})
    .then(function () { return test.dropTable('NewTable'); })
    .then(function () { return test.createTable(newTable); })
    .then(function (result) {
    console.log('Sql create table : ' + result);
})
    .then(function () { return test.listTables(); })
    .then(function (listTables) {
    console.log('liste des tables : ' + listTables);
})
    .then(function () { return test.updateTable(updateTable); })
    .then(function () { return test.listTables(); })
    .then(function (listTables) {
    console.log('liste des tables : ' + listTables);
})
    .then(function () { return test.inTransaction(); })
    .then(function (inTR) {
    console.log('Transaction en cours : ' + inTR);
    return test.commit();
})
    .then(function () { return console.log('Terminé'); })
    .catch(function (err) { return console.log(err); });
//# sourceMappingURL=MySQL.js.map