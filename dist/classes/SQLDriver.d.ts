import * as DB from './DB';
import { Driver, ReplicationBlock, DataRow } from './Driver';
import { TableOptions } from '../interfaces/Nodes';
export declare abstract class SQLDriver extends Driver {
    protected dbDefinition: DB.DatabaseDefinition;
    protected constructor(dbDef: DB.DatabaseDefinition);
    protected abstract isConnected(): Promise<boolean>;
    protected abstract connect(): Promise<void>;
    protected abstract disconnect(): Promise<void>;
    protected abstract inTransaction(): Promise<boolean>;
    protected abstract startTransaction(): Promise<void>;
    protected abstract commit(): Promise<void>;
    protected abstract rollback(): Promise<void>;
    protected abstract executeSQL(sql: string, autocreateTR: boolean, fetchResultSet?: boolean, callback?: (record: DB.Record) => Promise<boolean | void>, params?: Object[]): Promise<boolean>;
    private processParams(sql, resultParams, namedParams?, unnamedParams?);
    query(sql: string, namedParams?: DB.Field[], unnamedParams?: Object[], callback?: (record: DB.Record) => Promise<boolean | void>): Promise<boolean>;
    exec(sql: string, namedParams?: DB.Field[], unnamedParams?: Object[]): Promise<void>;
    protected abstract dropTable(tableName: string): Promise<void>;
    protected abstract tableExists(tableName: string): Promise<boolean>;
    abstract createTable(table: DB.TableDefinition): Promise<string>;
    abstract listPrimaryKeyFields(tableName: string): Promise<string[]>;
    protected abstract customMetadataExists(objectName: string, objectType: string): Promise<boolean>;
    protected abstract createCustomMetadata(metadata: DB.CustomMetadataDefinition): Promise<void>;
    addNode(nodeName: string): Promise<void>;
    initReplicationMetadata(): Promise<void>;
    clearReplicationMetadata(): Promise<void>;
    protected abstract getTriggerNames(tableName: string): Promise<string[]>;
    protected abstract getTriggerSQL(tableOptions: TableOptions, callback: (triggerName: string, sql: string) => Promise<boolean>): Promise<void>;
    abstract triggerExists(triggerName: string): Promise<boolean>;
    abstract dropTriggers(tableName: string): Promise<void>;
    createTriggers(tableOptions: TableOptions): Promise<void>;
    getTransactionsToReplicate(destNode: string): Promise<number[]>;
    getDataRows(tableName: string, callback: (row: DataRow) => Promise<boolean>): Promise<void>;
    getRowsToReplicate(destNode: string, transaction_number: number, minCode?: number): Promise<ReplicationBlock>;
    protected abstract getFieldType(sqlType: number): DB.DataType;
    protected getChangedFields(change_number: string, nodeName: string): Promise<DB.Field[]>;
    validateBlock(transaction_number: number, maxCode: number, destNode: string): Promise<void>;
    protected abstract setReplicatingNode(origNode: string): Promise<void>;
    protected abstract checkRowExists(record: DataRow): Promise<boolean>;
    protected abstract getDataTypesOfFields(tableName: string, keyName: string[]): Promise<DB.DataType[]>;
    protected abstract parseFieldValue(dataType: DB.DataType, fieldValue: string): Promise<Object>;
    protected getSQLStatement(record: DataRow): string;
    private parseKeys(keys);
    private prepareKeyValues(tableName, keyNames, keyValues, keyValueObjects?);
    protected getWhereClause(record: DataRow): string;
    protected getWhereFieldValues(record: DataRow): Object[];
    importTableData(tableName: string, records: DataRow[], finished: boolean): Promise<void>;
    replicateBlock(origNode: string, block: ReplicationBlock): Promise<void>;
}