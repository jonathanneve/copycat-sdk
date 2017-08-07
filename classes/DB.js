"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataType;
(function (DataType) {
    DataType[DataType["Unknown"] = 0] = "Unknown";
    DataType[DataType["String"] = 1] = "String";
    DataType[DataType["FixedChar"] = 2] = "FixedChar";
    DataType[DataType["Memo"] = 3] = "Memo";
    DataType[DataType["Blob"] = 4] = "Blob";
    DataType[DataType["Boolean"] = 5] = "Boolean";
    DataType[DataType["SmallInt"] = 6] = "SmallInt";
    DataType[DataType["Integer"] = 7] = "Integer";
    DataType[DataType["Int64"] = 8] = "Int64";
    DataType[DataType["AutoInc"] = 9] = "AutoInc";
    DataType[DataType["BCD"] = 10] = "BCD";
    DataType[DataType["Float"] = 11] = "Float";
    DataType[DataType["DateTime"] = 12] = "DateTime";
    DataType[DataType["Date"] = 13] = "Date";
    DataType[DataType["Time"] = 14] = "Time";
    DataType[DataType["Guid"] = 15] = "Guid";
})(DataType = exports.DataType || (exports.DataType = {}));
class Field {
    isNull() {
        return this.value == null;
    }
}
exports.Field = Field;
class Record {
    constructor() {
        this.fields = [];
    }
    fieldByName(name) {
        let field;
        this.fields.some(f => {
            if (f.fieldName.toUpperCase() == name.toUpperCase()) {
                field = f;
                return true;
            }
            return false;
        });
        return field;
    }
    addField(fieldName) {
        let f = new Field();
        f.fieldName = fieldName;
        this.fields.push(f);
        return f;
    }
}
exports.Record = Record;
class FieldDefinition {
}
exports.FieldDefinition = FieldDefinition;
class TableDefinition {
}
exports.TableDefinition = TableDefinition;
class CustomMetadataDefinition {
}
exports.CustomMetadataDefinition = CustomMetadataDefinition;
class DatabaseDefinition {
}
exports.DatabaseDefinition = DatabaseDefinition;
//# sourceMappingURL=DB.js.map