import { Driver } from '../classes/Driver';
import { Node } from './Nodes';
export declare class ClientConfiguration {
    username: string;
    configName: string;
    localNode: Node;
    localDatabase: Driver;
    cloudNodeName: string;
    cloudURL: string;
    static createFromJson(json: any): ClientConfiguration;
}
