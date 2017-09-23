import {Replicator} from '../classes/Replicator'
import * as DB from '../classes/DB'
//import {ConfigMgr, TableOptions, NodeOptions} from '../ConfigMgr'
import {RestClient} from '../classes/drivers/Rest'
import * as FB from './Firebird' 
import { ClientConfiguration } from '../interfaces/ClientConfig'
import fs = require('fs');

let jsonConf = JSON.parse(fs.readFileSync(__dirname + "/config.json", 'utf8'));
/*let fbconn = Object.assign(new FB.FirebirdDriver(), jsonConf.localDatabase);
let conf = ClientConfiguration.createFromJson(jsonConf, fbconn);*/

//import '../Drivers/Firebird.js'
/*
const source: FirebirdDriver = new FirebirdDriver();
source.database = 'c:\\test.fdb';
source.databaseVersion = "FB30";
source.username = 'SYSDBA';
source.password = 'masterkey';
source.configName = "TST";
*/

//const dest = new RestClient('MIRROR');
//dest.baseURL = 'http://localhost:3000';
/*dest.database = 'c:\\test_mirror.fdb';
dest.databaseVersion = "FB30";
dest.username = 'SYSDBA';
dest.password = 'masterkey';
dest.configName = "TST";*/

/*class mockConfigMgr implements ConfigMgr {
    configName: string;
    listTablesToReplicate(forNode: string): TableOptions[] {
        if (forNode == "MASTER") 
            return [{ 
                        tableName: "TEST", 
                        excludedFields: [],
                        includedFields: []
                    }]
        else
            return [];

    }
    listDestinationNodes(forNode: string): NodeOptions[] {
        if (forNode == "MASTER") 
            return [{ 
                    nodeName: "MIRROR",
                    driverName: "FirebirdDriver",
                    driver: null,
                    replFrequency: 10
                }];
        else
            return [];
    }
}
const configMgr = new mockConfigMgr();
configMgr.configName = "TST";
*/

async function runReplication(init: boolean) {
    try {
        console.log('Running replication' + (init ? ": first run..." : "..."));
        
        let fbconn = Object.assign(new FB.FirebirdDriver(), jsonConf.localDatabase);
        let conf = ClientConfiguration.createFromJson(jsonConf, fbconn);
        let repl = new Replicator(conf);
        if (init) {
            /*    let fbconn = Object.assign(new FB.FirebirdDriver(), jsonConf.localDatabase);
                let conf = ClientConfiguration.createFromJson(jsonConf, fbconn);
                let repl = new Replicator(conf);*/

/*            console.log('Initializing local node...');
            await repl.initializeLocalNode();*/
            
            console.log('Getting config...');
            await repl.refreshConfig();

            console.log('Getting config...');
            await repl.refreshConfig();

            console.log('Getting config...');
            await repl.refreshConfig();

            console.log('Initializing cloud node...');
            await repl.initializeCloudDatabase();

            console.log('Getting config...');
            await repl.refreshConfig();

            console.log('Initializing cloud node again...');
            await repl.initializeCloudDatabase();

            console.log('Getting config...');
            await repl.refreshConfig();
        }
        
        console.log('Replicating...');
        await repl.replicate();

        console.log('Done!');

        setTimeout(runReplication, 5000, false);
    }
    catch (err) {
        console.log(err);
    }
}

setTimeout(runReplication, 0, true);




//let conf = ClientConfiguration.createFromJson(__dirname + "/config.json", null);
//repl.initializeLocalNode()
//.then(() => {
    //console.log(repl.nodeConfig);
    //console.log(repl.cloudNodeConfig);
  //  console.log('initialization finished')
/*repl.initializeCloudDatabase()
.then(() => {
    console.log("cloud initialization done, replicating...");
    return repl.replicate()
})*/

/*
const repl = new Replicator(conf);
repl.initializeCloudDatabase().then(() => {
    console.log("replication done");
})
.catch(err => {
    console.log("Error : " + err);
});
*/



/*})
.catch((reason:any)=> {
    console.log("Error initializing: " + reason.message);
})
*/
//repl.configMgr = configMgr;

/*repl.initializeNode(repl.sourceNode)
.then(() => {
    repl.initializeNode(repl.destNode)
    .then(() => {
        console.log('init done');
        repl.replicate(ReplicationDirection.SourceToDest);
        console.log('repl done');
    })
    .catch((err) => {
        console.log(err);
    })
})
.catch((err) => {
    console.log('1: ' + err);
});
*/

/*var con = fb.createConnection();
con.connectSync('c:\\test.fdb','sysdba','masterkey','');
con.querySync("insert into test (id,name) values (6, 'aéà testê Ê ')");
var res = con.querySync("select * from test");
var rows = res.fetchSync("all", true, true);
console.log(sys.inspect(rows));
con.commitSync();*/
