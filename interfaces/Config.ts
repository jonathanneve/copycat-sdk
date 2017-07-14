import {Driver} from '../utils/Driver';

export class TableOptions {
    tableName: string;
    excludedFields: string[];
    includedFields: string[];
}

export class ReplicationConfig{
    nodeConfigName: string;
    tables?: TableOptions[];
    excludedTables?: string[];    
}

export class NodeConfig{
    name: string;
    description: string;
    replFrequency: number;
    tables?: TableOptions[];
    excludedTables?: string[];    
    destinationNodeConfigs: ReplicationConfig[];
}

export class Node{
    userID: number;
    configID: number;
    id: number;
    nodeConfigName: string;
    lastReplication?: Date;
    nodeName(): string {
        return this.nodeConfigName + '_' + this.id.toString();
    }
}

export class Configuration{
    id: number;
    name: string;
    userID: number;
    nodeConfigs: NodeConfig[];
    cloudDatabase: Driver;
    recordVersionsToKeepInCloud: number = 0;
    static createFromJson(json: any): Configuration {
        if (json.cloudDatabase) {
            json.cloudDatabase = Driver.createFromJson(json.cloudDatabase);
        }
        
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and add it to Configs array
        let conf = Object.assign(new Configuration(), json);
        return conf;
    }

}
