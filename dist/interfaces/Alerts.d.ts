export declare enum AlertLevel {
    Information = 0,
    Warning = 1,
    Error = 2,
}
export declare class Alert {
    configID: string;
    alertID: number;
    nodeID: string;
    level: AlertLevel;
    alertDate: Date;
    message: string;
    active: boolean;
    newAlert: boolean;
    replicationCycleID?: string;
    replicationLogID?: string;
}
