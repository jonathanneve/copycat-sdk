import { Driver } from '../classes/Driver';
import { Node } from './Nodes';
export declare class ClientConfiguration {
    username: string;
    configName: string;
    accessToken: string;
    localNode?: Node;
    localDatabase: Driver;
    cloudURL?: string;
    static createFromJson(json: any, driver: Driver): ClientConfiguration;
}
