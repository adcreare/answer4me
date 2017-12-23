"use strict";
exports.__esModule = true;
var CallData = /** @class */ (function () {
    function CallData() {
        return;
    }
    CallData.prototype.setCallerInfo = function (callInformation) {
        this.CallerInfo = callInformation;
        return true;
    };
    CallData.prototype.getCallerInfo = function () {
        return this.CallerInfo;
    };
    CallData.prototype.setRecordingPathURI = function (url) {
        this.recordingPathURI = url;
        var splitpath = url.split('/');
        this.recordingFileName = splitpath[splitpath.length - 1];
        return;
    };
    CallData.prototype.getNotification = function () {
        // let response = {
        //   CallInfo: this.CallerInfo,
        //   RecordingURL: this.recordingPathURI
        // }
        var response = "*New Voicemail!* \n\n    Caller: " + this.CallerInfo.Caller + " \n\n    City: " + this.CallerInfo.CallerCity + " \n\n    Country: " + this.CallerInfo.CallerCountry + " \n\n    State: " + this.CallerInfo.CallerState + " \n\n    Zip: " + this.CallerInfo.CallerZip + " \n\n    Message Duration: " + this.CallerInfo.CallDuration + " Left at " + this.CallerInfo.CalledDate + " \n \n\n    URL: " + this.recordingPathURI + " \n\n";
        return response;
    };
    return CallData;
}());
exports.CallData = CallData;
//# sourceMappingURL=Notification.js.map