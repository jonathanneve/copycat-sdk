
import {Driver} from '../classes/Driver'
import {Node} from './Nodes'

export class ConfigType{
    product: string;
    edition?: string;
}

export class Configuration{
    configID: number;
    name: string;
    configType: ConfigType;
    username: string;
    description: string;
    cloudDatabase: Driver;
    recordVersionsToKeepInCloud: number = 0;

    constructor() {
        this.configType = new ConfigType();
    }

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
