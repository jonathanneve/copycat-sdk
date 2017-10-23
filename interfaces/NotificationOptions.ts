import { AlertLevel } from "./Alerts";

export class NotificationOptions {
    notiyID:string;
    notify:boolean;
    sameError:number;
    waitNotify:number;
    noReplication:number;
}

export class EmailNotificationOptions {
    emailNotifyID: string;
    email:string;
    alertlevel : AlertLevel;
    active:boolean;
}