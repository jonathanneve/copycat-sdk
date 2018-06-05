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
var Field = /** @class */ (function () {
    function Field() {
    }
    Field.prototype.isNull = function () {
        return this.value == null;
    };
    return Field;
}());
exports.Field = Field;
var Record = /** @class */ (function () {
    function Record() {
        this.fields = [];
    }
    Record.prototype.fieldByName = function (name) {
        var field;
        this.fields.some(function (f) {
            if (f.fieldName.toUpperCase() == name.toUpperCase()) {
                field = f;
                return true;
            }
            return false;
        });
        return field;
    };
    Record.prototype.addField = function (fieldName) {
        var f = new Field();
        f.fieldName = fieldName;
        this.fields.push(f);
        return f;
    };
    return Record;
}());
exports.Record = Record;
var FieldDefinition = /** @class */ (function () {
    function FieldDefinition() {
    }
    return FieldDefinition;
}());
exports.FieldDefinition = FieldDefinition;
var TableDefinition = /** @class */ (function () {
    function TableDefinition() {
    }
    return TableDefinition;
}());
exports.TableDefinition = TableDefinition;
var CustomMetadataDefinition = /** @class */ (function () {
    function CustomMetadataDefinition() {
    }
    return CustomMetadataDefinition;
}());
exports.CustomMetadataDefinition = CustomMetadataDefinition;
var DatabaseDefinition = /** @class */ (function () {
    function DatabaseDefinition() {
    }
    return DatabaseDefinition;
}());
exports.DatabaseDefinition = DatabaseDefinition;
//# sourceMappingURL=DB.js.map