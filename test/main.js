"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Replicator_1 = require("../classes/Replicator");
//import * as FB from '../classes/drivers/Firebird'
const ClientConfig_1 = require("../interfaces/ClientConfig");
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
let conf = ClientConfig_1.ClientConfiguration.createFromJson(__dirname + "/config.json");
const repl = new Replicator_1.Replicator(conf);
repl.initializeLocalNode()
    .catch((reason) => {
    console.log("Error initializing: " + reason.message);
})
    .then(() => {
    //console.log(repl.nodeConfig);
    //console.log(repl.cloudNodeConfig);
    repl.replicate()
        .then(() => {
        console.log("done");
    })
        .catch(err => {
        console.log("Error replicating: " + err.message);
    });
});
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
//# sourceMappingURL=main.js.map