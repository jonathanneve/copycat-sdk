export class ReplicationLogEvent{
    logEventID: string;
    configID: number;
    nodeID: string;
    transactionNumber: number;
    toCloud: boolean;
    eventTime: Date;
    resultOK: boolean;
    tableName: string;
    keyNames: string[];
    keyValues: Object[];
    operationType: string;
    fieldsChanged: string[];
    message: string;
    
    constructor() {
        
    }
}

export class DebugLogEvent {
    eventTime: Date;
    nodeID: string;
    message: string;
}