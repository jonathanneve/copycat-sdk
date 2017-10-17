export enum AlertLevel { Information, Warning, Error };

export class Alert {
    configID: number;
    alertID: number;
    nodeID: number;
    level: AlertLevel;
    alertDate: Date;
    message: string;
    active: boolean;
    newAlert: boolean;
    replicationCycleID?: number;
    replicationLogID?: number;
}