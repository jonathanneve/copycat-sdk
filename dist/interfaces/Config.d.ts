import { AlertLevel } from "./Alerts";
export declare class ConfigType {
    product: string;
    edition?: string;
}
export declare enum ConfigCreationStatus {
    CreatingDB = 0,
    CreatingNodes = 1,
    Created = 2,
}
export declare class Configuration {
    configID: string;
    name: string;
    configType: ConfigType;
    username: string;
    description: string;
    recordVersionsToKeepInCloud: number;
    status: ConfigCreationStatus;
    constructor();
    static createFromJson(json: any): Configuration;
}
export declare class ConfigurationStatus {
    configID: string;
    alertsLevels: {
        level: AlertLevel;
        nb: number;
    }[];
    lastReplication: Date;
    status: ConfigCreationStatus;
}
