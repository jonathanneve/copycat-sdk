export declare enum ReplicationLogEventType {
    Row = 0,
    EmptyLog = 1,
    GeneralError = 2,
}
export declare class ReplicationCycleDirection {
    rowsReplicated: number;
    error: string;
}
export declare class ReplicationCycle {
    cycleID: string;
    nodeID: string;
    start: Date;
    end: Date;
    toCloud: ReplicationCycleDirection;
    fromCloud: ReplicationCycleDirection;
}
export declare class ReplicationLogEvent {
    logEventID: string;
    configID: string;
    nodeID: string;
    cycleID: number;
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
    constructor();
}
export declare class DebugLogEvent {
    eventTime: Date;
    nodeID: string;
    message: string;
}
