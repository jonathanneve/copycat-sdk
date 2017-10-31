export enum ReplicationLogEventType { Row, EmptyLog, GeneralError };

export class ReplicationCycleDirection {
    rowsToReplicate: number;
    rowsReplicated: number;
}

export class ReplicationCycle {
    cycleID: string;
    nodeID: string;
    start: Date;
    end: Date;    
    error: string;
    toCloud: ReplicationCycleDirection = new ReplicationCycleDirection();
    fromCloud: ReplicationCycleDirection = new ReplicationCycleDirection();
}

export class ReplicationLogEvent{
    logEventID: string;
    configID: number;
    nodeID: string;
    cycleID: string;
    transactionNumber?: number;
    toCloud: boolean;
    eventTime: Date;
    resultOK?: boolean;
    tableName?: string;
    keyNames?: string[];
    keyValues?: Object[];
    operationType?: string;
    fieldsChanged?: string[];
    message: string;
    eventType: ReplicationLogEventType;
    
    constructor() {
        
    }
}

export class DebugLogEvent {
    eventTime: Date;
    nodeID: string;
    message: string;
}