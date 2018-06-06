import * as DB from "./DB"
import {IDriver} from '../interfaces/IDriver'

export class DataRow {
    code: number;
    tableName: string;
    primaryKeys: DB.Field[];
    operationType: string;
    fields: DB.Field[] = [];
}

export class ReplicationBlock {
    cycleID: string;
    transactionID: number;
    maxCode: number;
    transactionFinished: boolean;
    records: DataRow[] = [];
}

export interface BlockCallback {
    (block: ReplicationBlock) : boolean;
}

export abstract class Driver implements IDriver {
    driverName: string;
    configName: string;    
    connectionParams: any;

    static createFromJson(json: IDriver): Driver {
        let driver = Object.create(drivers[json.driverName].prototype);
        driver.constructor.apply(driver);
        driver = Object.assign(driver, json);
        return driver;        
    }

    abstract getTransactionsToReplicate(destNode: string): Promise<number[]>;

    //Called to get the list of rows to replicate for the specified node
    //callback is called once for each block of rows
    abstract getRowsToReplicate(destNode: string, transaction_number: number, minCode: number): Promise<ReplicationBlock>;

    //Called once confirmation has been received from the server that 
    //the specified block has been correctly replicated
    abstract validateBlock(transactionNumber: number, maxCode: number, destNode: string): Promise<void>;

    abstract replicateBlock(origNode: string, block: ReplicationBlock): Promise<void>;

    abstract initReplicationMetadata(): Promise<void>;
    abstract clearReplicationMetadata(): Promise<void>;

    abstract listTables(): Promise<string[]>;    
    abstract getTableDef(tableName: string, fullFieldDefs: boolean): Promise<DB.TableDefinition>;
    abstract createOrUpdateTable(table: DB.TableDefinition): Promise<string>;    

    abstract getDataRows(tableName: string, callback: (row: DataRow) => Promise<boolean>): Promise<void>;
    abstract importTableData(tableName: string, records: DataRow[], finished: boolean): Promise<void>;

    /*customMetadataExists(objectName: string, objectType: string): boolean;
    createCustomMetadata(metadata: DB.CustomMetadataDefinition): void;*/
}

export var drivers: { [id: string]: typeof Driver} = {};
export function addDriver(driverName: string, driverType: typeof Driver) {
    drivers[driverName] = driverType;
}