export enum DataType {
    Unknown,
    String,
    FixedChar, 
    Memo,
    Blob,
    Boolean,
    SmallInt,
    Integer,
    Int64,
    AutoInc,
    BCD,
    Float,
    DateTime,
    Date,
    Time,
    Guid
}    

export class Field {
    fieldName: string;
    dataType: DataType;
    value: Object
    isNull() : boolean{
        return this.value == null;
    }
    size?: number;
}

export class Record {
    tableName: string;
    fields: Field[] = [];

    fieldByName(name: string): Field {
        let field: Field;
        this.fields.some(f => {
            if (f.fieldName.toUpperCase() == name.toUpperCase()) {
                field = f;
                return true;
            }
            return false;
        });
        return field;
    }

    addField(fieldName: string): Field {
        let f = new Field();
        f.fieldName = fieldName;
        this.fields.push(f);
        return f;
    }
    
}

export class FieldDefinition{
    fieldName: string;
    dataType?: DataType;
    dataTypeStr?: string;
    length?: number;
    precision?: number;
    scale?: number;
    notNull?: boolean;
    autoInc?: boolean;    
}

export class TableDefinition {
    tableName: string;
    fieldDefs: FieldDefinition[];
    primaryKeys: string[];
}

export class CustomMetadataDefinition {
    objectName: string;
    objectType: string;
    SQL: string[];
}

export class DatabaseDefinition {
    databaseType: string;
    customMetadata: CustomMetadataDefinition[];
    triggerTemplates: string[];
}
