const DB = require('../classes/DB');
var MySQL = require('../classes/MySQLDriver');
var Config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'copycat'
};
var test = new MySQL.MySQLDriver(Config);
test.connect();
if (test.isConnected() === true) {
    console.log('Connecté à la BDD :' + test.isConnected());
    test.startTransaction();
    test.executeSQL('Select * from test', false);
    console.log('Transaction en cours : ' + test.inTransaction());
    test.commit();
}
//# sourceMappingURL=MySQL.js.map