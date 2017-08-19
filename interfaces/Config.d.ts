import { Driver } from '../classes/Driver';
import { Node } from './Nodes';
export declare class Configuration {
    configName: string;
    username: string;
    description: string;
    nodes: Node[];
    cloudDatabase: Driver;
    recordVersionsToKeepInCloud: number;
    static createFromJson(json: any): Configuration;
}
