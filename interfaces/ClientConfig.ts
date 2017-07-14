import {Driver} from '../utils/Driver';

export class ClientConfiguration{
    userID: number;
    configID: number;
    localNode: Node;
    localDatabase: Driver;
    cloudNodeName: string = 'CLOUD';    
    cloudURL: string;    
    
    static createFromJson(json: any): ClientConfiguration {
        json.localDatabase = Driver.createFromJson(json.localDatabase);        
        json.localNode = Object.assign(new Node(), json.localNode);
        
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and add it to Configs array
        let conf: ClientConfiguration = Object.assign(new ClientConfiguration(), json);
        return conf;
    }
}