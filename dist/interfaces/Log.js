"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReplicationLogEventType;
(function (ReplicationLogEventType) {
    ReplicationLogEventType[ReplicationLogEventType["Row"] = 0] = "Row";
    ReplicationLogEventType[ReplicationLogEventType["EmptyLog"] = 1] = "EmptyLog";
    ReplicationLogEventType[ReplicationLogEventType["GeneralError"] = 2] = "GeneralError";
})(ReplicationLogEventType = exports.ReplicationLogEventType || (exports.ReplicationLogEventType = {}));
;
var ReplicationCycleDirection = /** @class */ (function () {
    function ReplicationCycleDirection() {
    }
    return ReplicationCycleDirection;
}());
exports.ReplicationCycleDirection = ReplicationCycleDirection;
var ReplicationCycle = /** @class */ (function () {
    function ReplicationCycle() {
        this.toCloud = new ReplicationCycleDirection();
        this.fromCloud = new ReplicationCycleDirection();
    }
    return ReplicationCycle;
}());
exports.ReplicationCycle = ReplicationCycle;
var ReplicationLogEvent = /** @class */ (function () {
    function ReplicationLogEvent() {
    }
    return ReplicationLogEvent;
}());
exports.ReplicationLogEvent = ReplicationLogEvent;
var DebugLogEvent = /** @class */ (function () {
    function DebugLogEvent() {
    }
    return DebugLogEvent;
}());
exports.DebugLogEvent = DebugLogEvent;
//# sourceMappingURL=Log.js.map