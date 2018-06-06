"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("../classes/MySQLDriver");
const DB = require("../classes/DB");
let Config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'copycat'
};
let test = new mysql.MySQLDriver(Config);
let newTable = new DB.TableDefinition();
let updateTable = new DB.TableDefinition();
let fieldNewTable = new DB.FieldDefinition;
let updatefieldNewTable = new DB.FieldDefinition;
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
    .then(() => test.isConnected())
    .then((connected) => {
    console.log('Connecté à la BDD :' + connected);
    return test.startTransaction();
})
    // .then(() => test.executeSQL('INSERT INTO test (id, name) VALUES (NULL, \'azerty\');' ,false))
    // .then((resultExecSQL) =>{
    //     console.log('Result Exec SQL : ' + resultExecSQL);
    // })
    // .then(()=> test.exec('INSERT INTO test (id, name) VALUES (NULL, \'qwerty\');'))
    // .then(()=> test.query('select * from test', null, null, async (rec) => {
    //     console.log(rec);
    // }))
    .then(() => test.tableExists('test'))
    .then((tableExist) => {
    console.log('la table test exist : ' + tableExist);
})
    .then(() => test.dropTable('NewTable'))
    .then(() => test.createTable(newTable))
    .then((result) => {
    console.log('Sql create table : ' + result);
})
    .then(() => test.listTables())
    .then((listTables) => {
    console.log('liste des tables : ' + listTables);
})
    .then(() => test.updateTable(updateTable))
    .then(() => test.listTables())
    .then((listTables) => {
    console.log('liste des tables : ' + listTables);
})
    .then(() => test.inTransaction())
    .then((inTR) => {
    console.log('Transaction en cours : ' + inTR);
    return test.commit();
})
    .then(() => console.log('Terminé'))
    .catch((err) => console.log(err));
//# sourceMappingURL=MySQL.js.map