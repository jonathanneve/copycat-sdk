export interface Log{
    id: string,
    configID: number,
    nodeID: number,
    start: Date,
    end: Date,
    transactionNumber: number,
    toCloud: boolean

}

export enum EventTypes { RowReplicated, RowError, GeneralError, Debug };
    
export interface LogEvent{
    id: string,
    logID: string,
    eventTime: Date,
    eventType: EventTypes,
    tableName: string,
    keyNames: string,
    keyValues: string,
    operationType: string,
    fieldsChanged: string,
    message: string
}

export interface DebugLogEvent {
    eventTime: Date,
    nodeID: number,
    message: string
}