import { AlertLevel } from "./Alerts";
export declare class NotificationOptions {
    nodeID: string;
    onReplicationError: boolean;
    timeBetweenNotifications: number;
    delayBeforeFirstNotification: number;
    noReplicationTimeout: number;
}
export declare class NotificationEmail {
    emailID: string;
    nodeID: string;
    email: string;
    alertlevel: AlertLevel;
    active: boolean;
}
