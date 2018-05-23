
import {Driver} from '../classes/Driver'
import {Node} from './Nodes'
import { Alert, AlertLevel } from "./Alerts";

export class ConfigType{
    product: string;
    edition?: string;
}
export enum ConfigCreationStatus { CreatingDB, CreatingNodes, Created };

export class Configuration{
    configID: number;
    name: string;
    configType: ConfigType;
    username: string;
    description: string;
    recordVersionsToKeepInCloud: number = 0;
    status : ConfigCreationStatus;  
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

export class ConfigurationStatus{
    configID: number;
    alertsLevels: { level: AlertLevel, nb: number }[] = [];
    lastReplication: Date;
    status : ConfigCreationStatus;    
}
