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
