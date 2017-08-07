import { Driver } from '../classes/Driver';
import { NodeConfig } from './Nodes';
export declare class Configuration {
    configName: string;
    username: string;
    nodeConfigs: NodeConfig[];
    cloudDatabase: Driver;
    recordVersionsToKeepInCloud: number;
    static createFromJson(json: any): Configuration;
}
