
import {Driver} from '../classes/Driver'
import {Node} from './Nodes'
import { Alert } from "./Alerts";

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
    recordVersionsToKeepInCloud: number = 0;

    constructor() {
        this.configType = new ConfigType();
    }

    static createFromJson(json: any): Configuration {
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and return it
        let conf = Object.assign(new Configuration(), json);
        return conf;
    }
}