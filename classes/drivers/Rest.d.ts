import { Driver, ReplicationBlock, DataRow } from "../Driver";
import { Node } from "../../interfaces/Nodes";
import * as DB from "../DB";
export declare class RestClient extends Driver {
    accessToken: string;
    baseURL: string;
    getDataRows(tableName: string): Promise<DataRow[]>;
    importTableData(tableName: string, records: DataRow[]): Promise<void>;
    private httpClient;
    private restClient;
    private requestOptions;
    constructor(accessToken: string, baseURL: string);
    createOrUpdateTable(table: DB.TableDefinition): Promise<void>;
    createTable(table: DB.TableDefinition): Promise<void>;
    updateTable(table: DB.TableDefinition): Promise<void>;
    getNodeInfo(): Promise<Node>;
    getTransactionsToReplicate(destNode: string): Promise<number[]>;
    getRowsToReplicate(destNode: string, transaction_number: number, minCode: number): Promise<ReplicationBlock>;
    validateBlock(transactionNumber: number, maxCode: number, destNode: string): Promise<void>;
    replicateBlock(origNode: string, block: ReplicationBlock): Promise<void>;
    listTables(fullFieldDefs: boolean): Promise<DB.TableDefinition[]>;
    private doGet<T>(url);
    private doPut<T>(url, obj);
    private doPost<T>(url, obj);
    private doDelete<T>(url);
    initReplicationMetadata(): Promise<void>;
    clearReplicationMetadata(): Promise<void>;
}
