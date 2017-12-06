"use strict";
exports.__esModule = true;
var Notification = /** @class */ (function () {
    function Notification() {
        return;
    }
    Notification.prototype.setCallerInfo = function (callInformation) {
        this.CallerInfo = callInformation;
        return true;
    };
    Notification.prototype.getCallerInfo = function () {
        return this.CallerInfo;
    };
    Notification.prototype.setRecordingPathURI = function (url) {
        this.recordingPathURI = url;
        var splitpath = url.split('/');
        this.recordingFileName = splitpath[splitpath.length - 1];
        return;
    };
    Notification.prototype.getNotification = function () {
        // let response = {
        //   CallInfo: this.CallerInfo,
        //   RecordingURL: this.recordingPathURI
        // }
        var response = "*New Voicemail!* \n\n    Caller: " + this.CallerInfo.Caller + " \n\n    City: " + this.CallerInfo.CallerCity + " \n\n    Country: " + this.CallerInfo.CallerCountry + " \n\n    State: " + this.CallerInfo.CallerState + " \n\n    Zip: " + this.CallerInfo.CallerZip + " \n\n    Message Duration: " + this.CallerInfo.CallDuration + " Left at " + this.CallerInfo.CalledDate + " \n \n\n    URL: " + this.recordingPathURI + " \n\n";
        return response;
    };
    return Notification;
}());
exports.Notification = Notification;
