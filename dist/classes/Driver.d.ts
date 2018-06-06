import * as DB from "./DB";
import { IDriver } from '../interfaces/IDriver';
export declare class DataRow {
    code: number;
    tableName: string;
    primaryKeys: DB.Field[];
    operationType: string;
    fields: DB.Field[];
}
export declare class ReplicationBlock {
    cycleID: string;
    transactionID: number;
    maxCode: number;
    transactionFinished: boolean;
    records: DataRow[];
}
export interface BlockCallback {
    (block: ReplicationBlock): boolean;
}
export declare abstract class Driver implements IDriver {
    driverName: string;
    configName: string;
    connectionParams: any;
    static createFromJson(json: IDriver): Driver;
    abstract getTransactionsToReplicate(destNode: string): Promise<number[]>;
    abstract getRowsToReplicate(destNode: string, transaction_number: number, minCode: number): Promise<ReplicationBlock>;
    abstract validateBlock(transactionNumber: number, maxCode: number, destNode: string): Promise<void>;
    abstract replicateBlock(origNode: string, block: ReplicationBlock): Promise<void>;
    abstract initReplicationMetadata(): Promise<void>;
    abstract clearReplicationMetadata(): Promise<void>;
    abstract listTables(): Promise<string[]>;
    abstract getTableDef(tableName: string, fullFieldDefs: boolean): Promise<DB.TableDefinition>;
    abstract createOrUpdateTable(table: DB.TableDefinition): Promise<string>;
    abstract getDataRows(tableName: string, callback: (row: DataRow) => Promise<boolean>): Promise<void>;
    abstract importTableData(tableName: string, records: DataRow[], finished: boolean): Promise<void>;
}
export declare var drivers: {
    [id: string]: typeof Driver;
};
export declare function addDriver(driverName: string, driverType: typeof Driver): void;
