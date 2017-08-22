import * as DB from "./DB"
import {IDriver} from '../interfaces/Driver'

export class ReplicationRecord {
    code: number;
    tableName: string;
    primaryKeys: DB.Field[];
    operationType: string;
    changedFields: DB.Field[] = [];
}

export class ReplicationBlock {
    transactionID: number;
    maxCode: number;
    transactionFinished: boolean;
    records: ReplicationRecord[] = [];
}

export interface BlockCallback {
    (block: ReplicationBlock) : boolean;
}

export abstract class Driver implements IDriver {
    driverName: string;
    configName: string;
    databaseVersion: string;
    connectionParams: any;

    static createFromJson(json: IDriver): Driver {
        let driver = Object.create(drivers[json.driverName].prototype);
        driver = driver.constructor();
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

    abstract listTables(fullFieldDefs: boolean): Promise<DB.TableDefinition[]>;
    abstract createTable(table: DB.TableDefinition): Promise<void>;
    abstract updateTable(table: DB.TableDefinition): Promise<void>;

    /*customMetadataExists(objectName: string, objectType: string): boolean;
    createCustomMetadata(metadata: DB.CustomMetadataDefinition): void;*/
}

var drivers: { [id: string]: typeof Driver} = {};
export function addDriver(driverName: string, driverType: typeof Driver) {
    drivers[driverName] = driverType;
}