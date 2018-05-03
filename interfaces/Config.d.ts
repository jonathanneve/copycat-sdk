import { AlertLevel } from "./Alerts";
export declare class ConfigType {
    product: string;
    edition?: string;
}
export declare class Configuration {
    configID: number;
    name: string;
    configType: ConfigType;
    username: string;
    description: string;
    recordVersionsToKeepInCloud: number;
    constructor();
    static createFromJson(json: any): Configuration;
}
export declare class ConfigurationStatus {
    configID: number;
    alertsLevels: {
        level: AlertLevel;
        nb: number;
    }[];
    lastReplication: Date;
}
