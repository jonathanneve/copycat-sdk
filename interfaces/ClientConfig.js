import { Driver } from '../utils/Driver';
var ClientConfiguration = (function () {
    function ClientConfiguration() {
        this.cloudNodeName = 'CLOUD';
    }
    ClientConfiguration.createFromJson = function (json) {
        json.localDatabase = Driver.createFromJson(json.localDatabase);
        json.localNode = Object.assign(new Node(), json.localNode);
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and add it to Configs array
        var conf = Object.assign(new ClientConfiguration(), json);
        return conf;
    };
    return ClientConfiguration;
}());
export { ClientConfiguration };
//# sourceMappingURL=c:/git/copycat-sdk/interfaces/ClientConfig.js.map