import * as mysql from '../classes/MySQLDriver';
import * as DB from '../classes/DB';

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
    // .then(() => test.executeSQL('INSERT INTO test (id, name) VALUES (NULL, \'azerty\');' ,false))
    // .then((resultExecSQL) =>{
    //     console.log('Result Exec SQL : ' + resultExecSQL);
    // })
    // .then(()=> test.exec('INSERT INTO test (id, name) VALUES (NULL, \'qwerty\');'))
    // .then(()=> test.query('select * from test', null, null, async (rec) => {
    //     console.log(rec);
    // }))
    .then(()=> test.tableExists('test'))
    .then((tableExist)=> {
        console.log('la table test exist : ' + tableExist);
    })
    .then(() => test.inTransaction())
    .then((inTR) =>{ 
        console.log('Transaction en cours : ' + inTR);
        return test.commit();
    })
    .then(() => console.log('Terminé'))
    .catch((err) => console.log(err));











