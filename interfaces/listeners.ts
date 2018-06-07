export interface ListenerTableDef {
    tableNames : string;
    fieldNames : string[];
}

export interface Listener {
    _id: any;
    tables: ListenerTableDef[];
    type: string;
}
