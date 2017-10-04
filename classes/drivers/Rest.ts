import {Driver, ReplicationBlock, DataRow, addDriver} from "../Driver"
import {SQLDriver} from '../SQLDriver'
import {Node} from "../../interfaces/Nodes"
import * as DB from "../DB"
import * as http from 'typed-rest-client/HttpClient';
import * as rest from 'typed-rest-client/RestClient';
//import { FirebirdDriver } from "./Firebird";

console.log('rest');

interface ITransactionList {
    transactions: number[];
} 

interface EmptyRequest {

}

export class RestClient extends Driver {

    async getDataRows(tableName: string): Promise<DataRow[]> {
        return await this.doGet<DataRow[]>(this.baseURL + '/api/v1/node/table/' + tableName + "/data");
    }
    async importTableData(tableName: string, records: DataRow[]) {
        await this.doPut<DataRow[]>(this.baseURL + '/api/v1/node/table/' + tableName + "/data", records);
    }

    private httpClient: http.HttpClient;
    private restClient: rest.RestClient;
    private requestOptions: rest.IRequestOptions;

    constructor(public accessToken: string, public baseURL: string) {
        super();
        this.httpClient = new http.HttpClient('');
        this.restClient = new rest.RestClient('');

        this.requestOptions = {
            additionalHeaders: {
                "Authorization": 'JWT ' + this.accessToken,
                "Content-Type": 'application/json'}
        }
    }
        
    async createOrUpdateTable(table: DB.TableDefinition): Promise<string> {
        await this.doPut<DB.TableDefinition>(this.baseURL + '/api/v1/node/table/' + table.tableName, table);
        return 'OK';
    }
    async createTable(table: DB.TableDefinition): Promise<string> {
        return await this.createOrUpdateTable(table);
    }
    async updateTable(table: DB.TableDefinition): Promise<string> {
        return await this.createOrUpdateTable(table);
    }
    
    async getNodeInfo(): Promise<Node> {
        return await this.doGet<Node>(this.baseURL + '/api/v1/node/');
    }

    async getTransactionsToReplicate(destNode: string): Promise<number[]> {        
        return await this.doGet<number[]>(this.baseURL + '/api/v1/node/transactions/');
    }
    async getRowsToReplicate(destNode: string, transaction_number: number, minCode: number): Promise<ReplicationBlock> {
        return await this.doGet<ReplicationBlock>(this.baseURL + '/api/v1/node/transaction/'
            + transaction_number.toString() + '/blocks/' + minCode.toString());
    }
    
    async validateBlock(transactionNumber: number, maxCode: number, destNode: string): Promise<void> {
        await this.doDelete<void>(this.baseURL + '/api/v1/node/transaction/'
            + transactionNumber.toString() + '/blocks/' + maxCode.toString());
    }

    async replicateBlock(origNode: string, block: ReplicationBlock): Promise<void> {
        await this.doPut<ReplicationBlock>(this.baseURL + '/api/v1/node/transaction/'
        + block.transactionID.toString() + '/blocks/' +block.maxCode.toString(), block);
    }

    async listTables(fullFieldDefs: boolean): Promise<DB.TableDefinition[]> {
        return await this.doGet<DB.TableDefinition[]>(this.baseURL + '/api/v1/node/tables');
    }    
        
    private async doGet<T>(url: string): Promise<T>{        
        let res = await this.restClient.get<T>(url, this.requestOptions);      
        if (res.result)
            return res.result;
        else
            throw new Error('Resource not found! HTTP result:' + res.statusCode);    
    }
    private async doPut<T>(url: string, obj: T): Promise<T>{
        let res = await this.restClient.replace<T>(url, obj, this.requestOptions);                      
        return res.result;
        /*return new Promise<T>((resolve, reject) => {
            if (res.statusCode > 300)
                reject('HTTP error ' + res.statusCode.toString());
            else 
                resolve(res.result);            
        });*/
    }
    private async doPost<T>(url: string, obj: T): Promise<T>{
        let res = await this.restClient.create<T>(url, obj, this.requestOptions);                      
        return res.result;
        /*return new Promise<T>((resolve, reject) => {
            if (res.statusCode > 200)
                reject('HTTP error ' + res.statusCode.toString());
            else 
                resolve(res.result);            
        });*/
    }

    private async doPostEmpty(url: string): Promise<void> {
        let res = await this.httpClient.post(url, '', this.requestOptions.additionalHeaders);
        if (res.message.statusCode > 299)
            throw new Error(url + ': post failed with HTTP code ' + res.message.statusCode.toString());    
    }

    private async doDelete<T>(url: string): Promise<T>{
        let res = await this.restClient.del<T>(url, this.requestOptions);                      
        return res.result;
        /*return new Promise<T>((resolve, reject) => {
            if (res.statusCode != 200)
                reject('HTTP error ' + res.statusCode.toString());
            else 
                resolve(res.result);            
        });*/
    }

    async initReplicationMetadata(): Promise<void> {
        //await this.restClient.create(this.baseURL + '/api/v1/node/init_repl', '', this.requestOptions)
        // doPost<string>(this.baseURL + '/api/v1/node/init_repl', '');   
        let res = await this.httpClient.post(this.baseURL + '/api/v1/node/init_repl', '', this.requestOptions.additionalHeaders);
        if (res.message.statusCode > 299)
            throw new Error('initReplicationMetadata failed with HTTP code ' + res.message.statusCode.toString());    
    }

    async clearReplicationMetadata(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

//addDriver('RestClient', RestClient);
