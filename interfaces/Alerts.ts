export enum AlertLevel { Information, Warning, Error };

export class Alert {
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