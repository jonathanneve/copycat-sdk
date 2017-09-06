import { Driver } from '../classes/Driver';
export declare class Configuration {
    configName: string;
    username: string;
    description: string;
    cloudDatabase: Driver;
    recordVersionsToKeepInCloud: number;
    static createFromJson(json: any): Configuration;
}
