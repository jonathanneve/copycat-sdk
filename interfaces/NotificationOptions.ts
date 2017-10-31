import { AlertLevel } from "./Alerts";

export class NotificationOptions {
    nodeID:string
    onReplicationError:boolean;
    timeBetweenNotifications:number;
    delayBeforeFirstNotification:number;
    noReplicationTimeout:number;
}

export class EmailNotificationOptions {
    nodeID:string;
    email:string;
    alertlevel : AlertLevel;
    active:boolean;
}