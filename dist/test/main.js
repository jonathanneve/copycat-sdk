"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Replicator_1 = require("../classes/Replicator");
var FB = require("./Firebird");
var ClientConfig_1 = require("../interfaces/ClientConfig");
var fs = require("fs");
var jsonConf = JSON.parse(fs.readFileSync(__dirname + "/config.json", 'utf8'));
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
    return __awaiter(this, void 0, void 0, function () {
        var fbconn, conf, repl, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    console.log('Running replication' + (init ? ": first run..." : "..."));
                    fbconn = Object.assign(new FB.FirebirdDriver(), jsonConf.localDatabase);
                    conf = ClientConfig_1.ClientConfiguration.createFromJson(jsonConf, fbconn);
                    repl = new Replicator_1.Replicator(conf);
                    if (!init) return [3 /*break*/, 8];
                    /*    let fbconn = Object.assign(new FB.FirebirdDriver(), jsonConf.localDatabase);
                        let conf = ClientConfiguration.createFromJson(jsonConf, fbconn);
                        let repl = new Replicator(conf);*/
                    /*            console.log('Initializing local node...');
                                await repl.initializeLocalNode();*/
                    console.log('Getting config...');
                    return [4 /*yield*/, repl.refreshConfig()];
                case 1:
                    _a.sent();
                    console.log('Getting config...');
                    return [4 /*yield*/, repl.refreshConfig()];
                case 2:
                    _a.sent();
                    console.log('Getting config...');
                    return [4 /*yield*/, repl.refreshConfig()];
                case 3:
                    _a.sent();
                    console.log('Initializing cloud node...');
                    return [4 /*yield*/, repl.initializeCloudDatabase()];
                case 4:
                    _a.sent();
                    console.log('Getting config...');
                    return [4 /*yield*/, repl.refreshConfig()];
                case 5:
                    _a.sent();
                    console.log('Initializing cloud node again...');
                    return [4 /*yield*/, repl.initializeCloudDatabase()];
                case 6:
                    _a.sent();
                    console.log('Getting config...');
                    return [4 /*yield*/, repl.refreshConfig()];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    console.log('Replicating...');
                    return [4 /*yield*/, repl.replicate()];
                case 9:
                    _a.sent();
                    console.log('Done!');
                    setTimeout(runReplication, 5000, false);
                    return [3 /*break*/, 11];
                case 10:
                    err_1 = _a.sent();
                    console.log(err_1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
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