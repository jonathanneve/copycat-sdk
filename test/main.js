"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Replicator_1 = require("../classes/Replicator");
const FB = require("./Firebird");
const ClientConfig_1 = require("../interfaces/ClientConfig");
const fs = require("fs");
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
function runReplication(init) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Running replication' + (init ? ": first run..." : "..."));
            let fbconn = Object.assign(new FB.FirebirdDriver(), jsonConf.localDatabase);
            let conf = ClientConfig_1.ClientConfiguration.createFromJson(jsonConf, fbconn);
            let repl = new Replicator_1.Replicator(conf);
            if (init) {
                /*    let fbconn = Object.assign(new FB.FirebirdDriver(), jsonConf.localDatabase);
                    let conf = ClientConfiguration.createFromJson(jsonConf, fbconn);
                    let repl = new Replicator(conf);*/
                /*            console.log('Initializing local node...');
                            await repl.initializeLocalNode();*/
                console.log('Getting config...');
                yield repl.refreshConfig();
                console.log('Getting config...');
                yield repl.refreshConfig();
                console.log('Getting config...');
                yield repl.refreshConfig();
                console.log('Initializing cloud node...');
                yield repl.initializeCloudDatabase();
                console.log('Getting config...');
                yield repl.refreshConfig();
                console.log('Initializing cloud node again...');
                yield repl.initializeCloudDatabase();
                console.log('Getting config...');
                yield repl.refreshConfig();
            }
            console.log('Replicating...');
            yield repl.replicate();
            console.log('Done!');
            setTimeout(runReplication, 5000, false);
        }
        catch (err) {
            console.log(err);
        }
    });
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
//# sourceMappingURL=main.js.map