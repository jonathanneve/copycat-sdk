import {Driver} from '../classes/Driver';
import {Node} from './Nodes';

export class ClientConfiguration{
    username: string;
    configName: string;
    accessToken: string;
    localNode?: Node;
    localDatabase: Driver;
    cloudURL?: string;
    
    static createFromJson(json: any): ClientConfiguration {
        json.localDatabase = Driver.createFromJson(json.localDatabase);        
        json.localNode = Object.assign(new Node(), json.localNode);
        
        //Create a fresh Configuration, shallow-copy the properties from the JSON, 
        //assign our newly-created Driver instance, and add it to Configs array
        let conf: ClientConfiguration = Object.assign(new ClientConfiguration(), json);
        return conf;
    }
}