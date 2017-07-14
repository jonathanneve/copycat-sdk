export var DataType;
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
})(DataType || (DataType = {}));
var Field = (function () {
    function Field() {
    }
    Field.prototype.isNull = function () {
        return this.value == null;
    };
    return Field;
}());
export { Field };
var Record = (function () {
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
export { Record };
var FieldDefinition = (function () {
    function FieldDefinition() {
    }
    return FieldDefinition;
}());
export { FieldDefinition };
var TableDefinition = (function () {
    function TableDefinition() {
    }
    return TableDefinition;
}());
export { TableDefinition };
var CustomMetadataDefinition = (function () {
    function CustomMetadataDefinition() {
    }
    return CustomMetadataDefinition;
}());
export { CustomMetadataDefinition };
var DatabaseDefinition = (function () {
    function DatabaseDefinition() {
    }
    return DatabaseDefinition;
}());
export { DatabaseDefinition };
//# sourceMappingURL=c:/git/copycat-sdk/utils/DB.js.map