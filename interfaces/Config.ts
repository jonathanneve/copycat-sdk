
import {Driver} from '../classes/Driver'
import {NodeConfig} from './Nodes'

export class Configuration{
    configName: string;
    username: string;
    nodeConfigs: NodeConfig[];
    cloudDatabase: Driver;
    recordVersionsToKeepInCloud: number = 0;
    static createFromJson(json: any): Configuration {
        if (json.cloudDatabase) {
            json.cloudDatabase = Driver.createFromJson(json.cloudDatabase);
        }
        
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and return it
        let conf = Object.assign(new Configuration(), json);
        return conf;
    }

}
