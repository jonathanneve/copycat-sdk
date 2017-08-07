import * as DB from "./DB";
import { IDriver } from '../interfaces/Driver';
export declare class ReplicationRecord {
    code: number;
    tableName: string;
    primaryKeys: DB.Field[];
    operationType: string;
    changedFields: DB.Field[];
}
export declare class ReplicationBlock {
    transactionID: number;
    maxCode: number;
    transactionFinished: boolean;
    records: ReplicationRecord[];
}
export interface BlockCallback {
    (block: ReplicationBlock): boolean;
}
export declare abstract class Driver implements IDriver {
    driverName: string;
    configName: string;
    databaseVersion: string;
    connectionParams: any;
    static createFromJson(json: IDriver): Driver;
    abstract getTransactionsToReplicate(destNode: string): Promise<number[]>;
    abstract getRowsToReplicate(destNode: string, transaction_number: number, minCode: number): Promise<ReplicationBlock>;
    abstract validateBlock(transactionNumber: number, maxCode: number, destNode: string): Promise<void>;
    abstract replicateBlock(origNode: string, block: ReplicationBlock): Promise<void>;
    abstract initReplicationMetadata(): Promise<void>;
    abstract clearReplicationMetadata(): Promise<void>;
}
export declare function addDriver(driverName: string, driverType: typeof Driver): void;
