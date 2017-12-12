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
// var twilio = require("twilio");
var twilio = require("twilio");
var winston = require("winston");
var mp3Duration = require("mp3-duration");
var DynamoDB = require("aws-sdk/clients/dynamodb");
var S3 = require("aws-sdk/clients/s3");
var config_1 = require("./config");
var Notification_1 = require("./objects/Notification");
var CallInfo_1 = require("./objects/CallInfo");
var request = require("request-promise-native");
winston.info('Starting Application Answer 4 Me');
winston.level = 'debug';
var accountSid = config_1.Config.accountSid;
var authToken = config_1.Config.authToken;
var twilioClient = twilio(accountSid, authToken);
exports.phonein = function (event, context, cb) {
    try {
        main(cb);
    }
    catch (e) {
        winston.error("Exception received calling main: " + e);
    }
};
function main(cb) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var listOfRecordings, e_1, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    winston.info('getting list of recordings available on twilio');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, listAllRecordings()];
                case 2:
                    listOfRecordings = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    error = new Error("unable to receive calls from twillo: " + e_1);
                    winston.error(error);
                    cb(error); // make it retry in lambda
                    return [3 /*break*/, 4];
                case 4:
                    listOfRecordings.forEach(function (call) { return __awaiter(_this, void 0, void 0, function () {
                        var notification, e_2, message;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    winston.info('processing to notification obj');
                                    return [4 /*yield*/, processRecording2Notifcation(call)];
                                case 1:
                                    notification = _a.sent();
                                    winston.info('getting caller information');
                                    return [4 /*yield*/, GatherCallerInformation(notification)];
                                case 2:
                                    notification = _a.sent();
                                    winston.info('downloading audio and uploading to S3');
                                    return [4 /*yield*/, DownloadAndUploadAllCallAudio(notification)];
                                case 3:
                                    notification = _a.sent();
                                    winston.info('Make notification');
                                    MakeNotification(notification);
                                    winston.info('clean up ');
                                    CleanUpTwilioRecording(notification.recordingid);
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_2 = _a.sent();
                                    winston.error("Exception thrown processing a call: " + call + " - Exception: " + e_2);
                                    message = "Exception thrown processing a call. Exception: " + e_2 + ";"
                                        + ("Call info " + call);
                                    PostSlackMessage(config_1.Config.slackPostWebhoock, message);
                                    PostSlackMessage(config_1.Config.slackPostWebhoock, "Notification object: " + JSON.stringify(notification));
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
function MakeNotification(notification) {
    PostSlackMessage(config_1.Config.slackPostWebhoock, notification.getNotification());
}
function PostSlackMessage(slackurl, messageObject) {
    var params = {
        method: 'POST',
        uri: slackurl,
        json: { text: messageObject }
    };
    request.post(params, function (err, response, body) {
        if (err) {
            winston.error('Received error on slack message:' + err);
        }
        else {
            winston.info("Posted to slack!");
        }
    });
}
function DownloadAndUploadAllCallAudio(notification) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = notification;
                    return [4 /*yield*/, httpGetBinary(notification.recordingPathURI)];
                case 1:
                    _a.recordingFile = _b.sent();
                    return [4 /*yield*/, uploadFileToS3('answer-4me', 'callrecordings', notification.recordingFileName, notification.recordingFile)];
                case 2:
                    _b.sent();
                    notification.setRecordingPathURI(getSigngedURL('answer-4me', 'callrecordings', notification.recordingFileName));
                    return [2 /*return*/, notification];
            }
        });
    });
}
function GatherCallerInformation(notification) {
    return __awaiter(this, void 0, void 0, function () {
        var callInfoPromise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    winston.debug('Entered GatherCallerInformation');
                    return [4 /*yield*/, addCallerInformation(notification)];
                case 1:
                    callInfoPromise = _a.sent();
                    notification = callInfoPromise;
                    return [2 /*return*/, notification];
            }
        });
    });
}
function addCallerInformation(notification) {
    return __awaiter(this, void 0, void 0, function () {
        var callInfo, callObject, url, twilioCallData, dynamodbCallLog, dynamodbCallLog_1, dynDBExpectedKeys, e_3, _a, e_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    callInfo = new CallInfo_1.CallInfo();
                    return [4 /*yield*/, getCallTwilio(notification.callSid)];
                case 1:
                    callObject = _b.sent();
                    url = 'https://' + accountSid + ':' + authToken
                        + '@api.twilio.com/2010-04-01' + callObject._uri;
                    return [4 /*yield*/, httpGet(url)];
                case 2:
                    twilioCallData = _b.sent();
                    twilioCallData = JSON.parse(twilioCallData);
                    winston.debug(JSON.stringify(twilioCallData));
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, getCallLogDynamoDB(notification.callSid)];
                case 4:
                    dynamodbCallLog_1 = _b.sent();
                    dynDBExpectedKeys = callInfo.getListOfCallerObjectKeys();
                    winston.debug('DynamoDB output');
                    winston.debug(dynamodbCallLog_1);
                    winston.debug('DynamoDB expected Keys');
                    winston.debug(dynDBExpectedKeys);
                    dynDBExpectedKeys.forEach(function (element) {
                        callInfo[element] = dynamodbCallLog_1.Item[element]['S'];
                        winston.debug(element + " : " + callInfo[element]);
                    });
                    return [3 /*break*/, 6];
                case 5:
                    e_3 = _b.sent();
                    winston.info('dynamodb said no call log found');
                    winston.debug(e_3);
                    return [3 /*break*/, 6];
                case 6:
                    callInfo.Caller = twilioCallData.from_formatted;
                    callInfo.CalledDate = twilioCallData.start_time;
                    _b.label = 7;
                case 7:
                    _b.trys.push([7, 9, , 10]);
                    _a = callInfo;
                    return [4 /*yield*/, getMP3duration(notification.recordingFile)];
                case 8:
                    _a.CallDuration = _b.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_4 = _b.sent();
                    winston.error('unable to parse duration off mp3. Using provided value (if set)');
                    callInfo.CallDuration = twilioCallData.duration; // maybe unknow (source null)
                    return [3 /*break*/, 10];
                case 10:
                    notification.setCallerInfo(callInfo);
                    return [2 /*return*/, notification]; //can i even return this?
            }
        });
    });
}
function httpGet(callurl) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, request(callurl)];
        });
    });
}
function httpGetBinary(callurl) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, request(callurl, { encoding: null })];
        });
    });
}
function getCallTwilio(callSid) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, twilioClient.calls(callSid)];
        });
    });
}
function getCallLogDynamoDB(callid) {
    return __awaiter(this, void 0, void 0, function () {
        var params, dynamodb;
        return __generator(this, function (_a) {
            params = {
                Key: {
                    "callid": {
                        S: callid
                    }
                },
                TableName: "answer4me-call-log"
            };
            dynamodb = new DynamoDB({ region: 'us-east-1' });
            return [2 /*return*/, dynamodb.getItem(params).promise()];
        });
    });
}
function processRecording2Notifcation(recording) {
    var notification = new Notification_1.Notification();
    notification.callSid = recording.callSid;
    notification.recordingid = recording.sid;
    notification.setRecordingPathURI('https://api.twilio.com' + recording.uri.replace(".json", ".mp3"));
    return notification;
}
function listAllRecordings() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, twilioClient.recordings.list()];
        });
    });
}
function uploadFileToS3(bucket, keyprefix, filename, file) {
    return __awaiter(this, void 0, void 0, function () {
        var s3, params, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    s3 = new S3({ region: 'us-east-1' });
                    params = {
                        Body: file,
                        Bucket: bucket,
                        Key: keyprefix + '/' + filename
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, s3.putObject(params).promise()];
                case 2:
                    _a.sent();
                    winston.info("File uploaded to S3:  " + filename);
                    return [3 /*break*/, 4];
                case 3:
                    e_5 = _a.sent();
                    winston.debug(e_5); // an error occurred
                    winston.error("failed S3 upload: " + e_5);
                    throw new Error('unable to upload to S3');
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getSigngedURL(bucket, keyprefix, filename) {
    var s3 = new S3({ region: 'us-east-1' });
    var key = keyprefix + '/' + filename;
    var params = { Bucket: bucket, Key: key, Expires: 4000 };
    var url = s3.getSignedUrl('getObject', params);
    console.log('The URL is', url); // expires in 4000 seconds (over an hour) 
    return url;
}
function CleanUpTwilioRecording(recordingSid) {
    twilioClient.recordings(recordingSid)
        .remove()
        .then(function () { return console.log("Sid " + recordingSid + " deleted successfully."); })["catch"](function (err) {
        console.log(err.status);
        throw err;
    });
}
function getMP3duration(file) {
    return new Promise(function (resolve, reject) {
        mp3Duration(file, function (err, duration) {
            if (err) {
                winston.error("unable to parse mp3 for duration: " + err);
                reject(err);
            }
            winston.debug("obtained length of mp3 " + duration);
            resolve(duration);
        });
    });
}
//# sourceMappingURL=checkgetrecording.js.map