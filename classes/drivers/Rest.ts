import {Driver, ReplicationBlock, ReplicationRecord, addDriver} from "../Driver"
import {SQLDriver} from '../SQLDriver'
import {Node} from "../../interfaces/Nodes"
import * as DB from "../DB"
import * as http from 'typed-rest-client/HttpClient';
import * as rest from 'typed-rest-client/RestClient';
import { FirebirdDriver } from "./Firebird";

console.log('rest');

interface ITransactionList {
    transactions: number[];
} 

export class RestClient extends Driver {
    private httpClient: http.HttpClient;
    private restClient: rest.RestClient;

    constructor(public userName: string, public configName: string, public accessToken: string, public baseURL: string) {
        super();        
        this.httpClient = new http.HttpClient('');
        this.restClient = new rest.RestClient('');
    }
    async getNode(nodeConfigName: string): Promise<Node> {
        return await this.doGet<Node>(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName 
            + '/node_configs/' + nodeConfigName);
    }

    async getTransactionsToReplicate(destNode: string): Promise<number[]> {        
        return await this.doGet<number[]>(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName 
            + '/cloud/nodes/' + destNode + '/transactions/');
    }
    async getRowsToReplicate(destNode: string, transaction_number: number, minCode: number): Promise<ReplicationBlock> {
        return await this.doGet<ReplicationBlock>(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName
            + '/cloud/nodes/' + destNode + '/transactions/' + transaction_number.toString() + '/blocks/' + minCode.toString());
    }
    async validateBlock(transactionNumber: number, maxCode: number, destNode: string): Promise<void> {
        await this.doDelete<void>(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName
            + '/cloud/nodes/' + destNode + '/transactions/' + transactionNumber.toString() + '/blocks/' + maxCode.toString());
    }
    async replicateBlock(origNode: string, block: ReplicationBlock): Promise<void> {
        await this.doPut<ReplicationBlock>(this.baseURL + '/api/v1/users/' + this.userName + '/configs/' + this.configName 
            + '/cloud/nodes/' + origNode + '/transactions/' + block.transactionID.toString() + '/blocks/' + block.maxCode.toString(), block);
    }

    private async doPost<T>(url: string, data: string): Promise<T>{
        let res = await this.httpClient.post(url, data);                      
        return new Promise<T>((resolve, reject) => {
            if (res.message.statusCode != 200)
                reject('HTTP error (' + res.message.statusCode.toString() + '): ' + res.message.statusMessage);
            else {
                let message = res.readBody()
                .then((value: string) => {
                    let json = JSON.parse(value);
                    if (json.message == "OK") {
                        if (json.result)
                            resolve(<T>json.result);
                        else
                            resolve();
                    }
                    else
                        reject('API call returned error: ' + json.message);
                })
                .catch((reason) => {
                    reject('Error reading HTTP response: ' + reason);
                })                
            }
        });
    }
     private async doGet<T>(url: string): Promise<T>{
        let res = await this.restClient.get<T>(url);                      
        return new Promise<T>((resolve, reject) => {
            if (res.statusCode != 200)
                reject('HTTP error ' + res.statusCode.toString());
            else 
                resolve(res.result);            
        });
    }
    private async doPut<T>(url: string, obj: T): Promise<T>{
        let res = await this.restClient.replace<T>(url, obj);                      
        return new Promise<T>((resolve, reject) => {
            if (res.statusCode != 200)
                reject('HTTP error ' + res.statusCode.toString());
            else 
                resolve(res.result);            
        });
    }

    private async doDelete<T>(url: string): Promise<T>{
        let res = await this.restClient.del<T>(url);                      
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
