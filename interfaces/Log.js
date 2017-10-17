"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReplicationLogEventType;
(function (ReplicationLogEventType) {
    ReplicationLogEventType[ReplicationLogEventType["Row"] = 0] = "Row";
    ReplicationLogEventType[ReplicationLogEventType["EmptyLog"] = 1] = "EmptyLog";
    ReplicationLogEventType[ReplicationLogEventType["GeneralError"] = 2] = "GeneralError";
})(ReplicationLogEventType = exports.ReplicationLogEventType || (exports.ReplicationLogEventType = {}));
;
class ReplicationCycleDirection {
}
exports.ReplicationCycleDirection = ReplicationCycleDirection;
class ReplicationCycle {
    constructor() {
        this.toCloud = new ReplicationCycleDirection();
        this.fromCloud = new ReplicationCycleDirection();
    }
}
exports.ReplicationCycle = ReplicationCycle;
class ReplicationLogEvent {
    constructor() {
    }
}
exports.ReplicationLogEvent = ReplicationLogEvent;
class DebugLogEvent {
}
exports.DebugLogEvent = DebugLogEvent;
//# sourceMappingURL=Log.js.map