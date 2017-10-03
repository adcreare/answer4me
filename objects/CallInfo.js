"use strict";
exports.__esModule = true;
var CallInfo = /** @class */ (function () {
    // public callSid: string;
    // public recordingid: string;
    // public recordingPathURI: string;
    // public recordingFileLocalPath: string;
    // public callInformation: CallInfo
    function CallInfo() {
        return;
    }
    CallInfo.prototype.getListOfCallerObjectKeys = function () {
        var returnObj;
        returnObj = ["Caller", "CallerCountry", "CallerState", "CallerZip", "CallerCity"];
        return returnObj;
    };
    return CallInfo;
}());
exports.CallInfo = CallInfo;
//# sourceMappingURL=CallInfo.js.map