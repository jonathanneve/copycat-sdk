import { Driver, ReplicationBlock } from "../Driver";
import { NodeConfig } from "../../interfaces/Nodes";
export declare class RestClient extends Driver {
    userName: string;
    configName: string;
    baseURL: string;
    private httpClient;
    private restClient;
    constructor(userName: string, configName: string, baseURL: string);
    getNodeConfig(nodeConfigName: string): Promise<NodeConfig>;
    getTransactionsToReplicate(destNode: string): Promise<number[]>;
    getRowsToReplicate(destNode: string, transaction_number: number, minCode: number): Promise<ReplicationBlock>;
    validateBlock(transactionNumber: number, maxCode: number, destNode: string): Promise<void>;
    replicateBlock(origNode: string, block: ReplicationBlock): Promise<void>;
    private doPost<T>(url, data);
    private doGet<T>(url);
    private doPut<T>(url, obj);
    private doDelete<T>(url);
    initReplicationMetadata(): Promise<void>;
    clearReplicationMetadata(): Promise<void>;
}
