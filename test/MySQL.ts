const DB = require('../classes/DB');
import * as mysql from '../classes/MySQLDriver';

var Config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'copycat'
}

var test = new mysql.MySQLDriver(Config);

test.connect()
    .then(() => test.isConnected())
    .then((connected) => {
        console.log('Connecté à la BDD :' + connected);
        return test.startTransaction();
    })
    .then(() => test.executeSQL('INSERT INTO test (id, name) VALUES (NULL, azerty);' ,false))
    .then(() => test.inTransaction())
    .then((inTR) =>{ 
        console.log('Transaction en cours : ' + inTR);
        return test.commit();
    })
    .then(() => console.log('Terminé'))
    .catch((err) => console.log(err));











