"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var twilio = require("twilio");
var config_1 = require("../config");
var Notification_1 = require("../objects/Notification");
var util = require("./util");
var accountSid = config_1.Config.accountSid;
var authToken = config_1.Config.authToken;
var twilioClient = twilio(accountSid, authToken);
function listRecordings() {
    return twilioClient.recordings.list();
}
exports.listRecordings = listRecordings;
function parseRecording(recording) {
    var notification = new Notification_1.CallData();
    notification.callSid = recording.callSid;
    notification.recordingid = recording.sid;
    notification.setRecordingPathURI('https://api.twilio.com' + recording.uri.replace('.json', '.mp3'));
    return notification;
}
exports.parseRecording = parseRecording;
function getCallTwilioInfo(callSid) {
    return __awaiter(this, void 0, void 0, function () {
        var callObject, url, twilioCallData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, twilioClient.calls(callSid)];
                case 1:
                    callObject = _a.sent();
                    url = 'https://' + accountSid + ':' + authToken
                        + '@api.twilio.com/2010-04-01' + callObject._uri;
                    return [4 /*yield*/, util.httpGet(url)];
                case 2:
                    twilioCallData = _a.sent();
                    twilioCallData = JSON.parse(twilioCallData);
                    return [2 /*return*/, twilioCallData];
            }
        });
    });
}
exports.getCallTwilioInfo = getCallTwilioInfo;
function deleteRecording(recordingSid) {
    twilioClient.recordings(recordingSid).remove();
}
exports.deleteRecording = deleteRecording;
//# sourceMappingURL=twilio.js.map