import {Driver, ReplicationBlock, DataRow, addDriver} from "../Driver"
import {SQLDriver} from '../SQLDriver'
import {Node} from "../../interfaces/Nodes"
import * as DB from "../DB"
import Axios, { AxiosRequestConfig } from "axios";
import { ReplicationCycle } from "../../interfaces/Log"
//import { FirebirdDriver } from "./Firebird";

export const MAX_REQUEST_SIZE = 100000;

interface ITransactionList {
    transactions: number[];
} 

interface EmptyRequest {

}

export class RestClient extends Driver {

    async newReplicationCycle(): Promise<ReplicationCycle> {
        return await this.doPost<ReplicationCycle>(this.baseURL + '/api/v1/node/repl/cycles/', null);
    }

    private requestOptions: AxiosRequestConfig;

    constructor(public accessToken: string, public baseURL: string) {
        super();
        
        this.requestOptions = {
            headers: {
                "Authorization": 'JWT ' + this.accessToken,
                "Content-Type": 'application/json'}
        }
    }
    
    callSSE(url: string, options: any, callback: (data: any) => Promise<any>): Promise<void> {
        return null;
       /* return new Promise<void>((resolve, reject) => {            
            let es = new SSE.EventSource(url, options);
            es.onmessage = (e) => {
                if (e.id == "CLOSE") {
                    es.close(); 
                    resolve();
                }
                else        
                    callback(e.data);
            };
            es.onerror = function() {
                reject();
            }; 
        })  */
    }

    /*
    async uploadBlob(value: Buffer, blobID: string): Promise<void> {
        let start = 0;
        let end = MAX_REQUEST_SIZE;
        
        while (start < value.length) {
            let finished = false;
            if (end >= value.length) {
                end = value.length;
                finished = true;
            }
            let chunk = new Buffer(end-start);
            value.copy(chunk, 0, start, end);
            let chunkStr = chunk.toString('base64');

            await this.doPut<string>(
                this.baseURL + '/api/v1/node/blob/'
                + blobID + '?batch_id='
                + blobID + "&batch_end=" + (finished ? "1 " : "0"), chunkStr);

            start = end;
            end = start + MAX_REQUEST_SIZE;            
        }        
    }*/

    async getDataRows(tableName: string, callback: (row: DataRow) => Promise<boolean>): Promise<void> {
        return this.callSSE(this.baseURL + '/api/v1/node/table/' + tableName + "/data", { headers: this.requestOptions.headers }, callback);
        //let rows = await this.doGet<DataRow[]>(this.baseURL + '/api/v1/node/table/' + tableName + "/data");
    }

    async importTableData(tableName: string, records: DataRow[], finished: boolean) {
        await this.doPut<DataRow[]>(this.baseURL + '/api/v1/node/table/' + tableName + "/data" +
        "?batch_id=dataimport&batch_end=" + (finished? "1": "0"), records);
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

    async listTables(): Promise<string[]> {
        return await this.doGet<string[]>(this.baseURL + '/api/v1/node/tables');
    }    
        
    async getTableDef(tableName: string, fullFieldDefs: boolean): Promise<DB.TableDefinition> {
        return await this.doGet<DB.TableDefinition>(this.baseURL + '/api/v1/node/table/' + tableName);
    }    

    private async doGet<T>(url: string): Promise<T>{        
        let res = await Axios.get<T>(url, this.requestOptions);      
        if (res.data)
            return res.data;
        else
            throw new Error('Resource not found! HTTP result:' + res.status);    
    }
    private async doPut<T>(url: string, obj: T): Promise<T>{
        let res = await Axios.post<T>(url, obj, this.requestOptions);                      
        return res.data;
        /*return new Promise<T>((resolve, reject) => {
            if (res.statusCode > 300)
                reject('HTTP error ' + res.statusCode.toString());
            else 
                resolve(res.result);            
        });*/
    }
    private async doPost<T>(url: string, obj: T): Promise<T>{
        let res = await Axios.post<T>(url, obj, this.requestOptions);                      
        return res.data;
        /*return new Promise<T>((resolve, reject) => {
            if (res.statusCode > 200)
                reject('HTTP error ' + res.statusCode.toString());
            else 
                resolve(res.result);            
        });*/
    }

    private async doPostEmpty(url: string): Promise<void> {
        let res = await Axios.post(url, '', this.requestOptions);
        if (res.status > 299)
            throw new Error(url + ': post failed with HTTP code ' + res.status.toString());    
    }

    private async doDelete<T>(url: string): Promise<void>{
        let res = await Axios.delete(url, this.requestOptions);                      
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
        let res = await Axios.post(this.baseURL + '/api/v1/node/init_repl', '', this.requestOptions);
        if (res.status > 299)
            throw new Error('initReplicationMetadata failed with HTTP code ' + res.status.toString());    
    }

    async clearReplicationMetadata(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

//addDriver('RestClient', RestClient);
