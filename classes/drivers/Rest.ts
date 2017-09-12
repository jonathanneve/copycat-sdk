import {Driver, ReplicationBlock, ReplicationRecord, addDriver} from "../Driver"
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

export class RestClient extends Driver {

    private httpClient: http.HttpClient;
    private restClient: rest.RestClient;
    private requestOptions: rest.IRequestOptions;

    constructor(public accessToken: string, public baseURL: string) {
        super();
        this.httpClient = new http.HttpClient('');
        this.restClient = new rest.RestClient('');

        this.requestOptions.additionalHeaders['Authorization'] = 'JWT ' + this.accessToken;
        this.requestOptions.additionalHeaders['Content-Type'] = 'application/json';
    }
        
    async createTable(table: DB.TableDefinition): Promise<void> {
        await this.doPut<DB.TableDefinition>(this.baseURL + '/api/v1/node/table/' + table.tableName, table);
    }
    async updateTable(table: DB.TableDefinition): Promise<void> {
        await this.doPut<DB.TableDefinition>(this.baseURL + '/api/v1/node/table/' + table.tableName, table);
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
        return new Promise<T>((resolve, reject) => {
            if (res.statusCode != 200)
                reject('HTTP error ' + res.statusCode.toString());
            else 
                resolve(res.result);            
        });
    }
    private async doPut<T>(url: string, obj: T): Promise<T>{
        let res = await this.restClient.replace<T>(url, obj, this.requestOptions);                      
        return new Promise<T>((resolve, reject) => {
            if (res.statusCode != 200)
                reject('HTTP error ' + res.statusCode.toString());
            else 
                resolve(res.result);            
        });
    }
    private async doPost<T>(url: string, obj: T): Promise<T>{
        let res = await this.restClient.create<T>(url, obj, this.requestOptions);                      
        return new Promise<T>((resolve, reject) => {
            if (res.statusCode != 200)
                reject('HTTP error ' + res.statusCode.toString());
            else 
                resolve(res.result);            
        });
    }

    private async doDelete<T>(url: string): Promise<T>{
        let res = await this.restClient.del<T>(url, this.requestOptions);                      
        return new Promise<T>((resolve, reject) => {
            if (res.statusCode != 200)
                reject('HTTP error ' + res.statusCode.toString());
            else 
                resolve(res.result);            
        });
    }

    async initReplicationMetadata(): Promise<void> {
        throw new Error('Method not implemented.');
//        return await this.doPost<void>(this.baseURL + '/api/v1/users/' + this.userID.toString() + '/configs/' + this.configID.toString() + '/initReplicationMetadata', '');                      
    }
    async clearReplicationMetadata(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

//addDriver('RestClient', RestClient);
