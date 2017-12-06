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
var DynamoDB = require("aws-sdk/clients/dynamodb");
var S3 = require("aws-sdk/clients/s3");
var config_1 = require("./config");
var Notification_1 = require("./objects/Notification");
var CallInfo_1 = require("./objects/CallInfo");
var request = require("request-promise-native");
/*
^^^^ make note somewhere how this can be
import {Request} from 'request-promise-native';

usage New Request(uri) //almost works needs some options.uri set

*/
winston.info('Starting Application Answer 4 Me');
winston.level = 'debug';
var accountSid = config_1.Config.accountSid;
var authToken = config_1.Config.authToken;
var client = twilio(accountSid, authToken);
exports.phonein = function (event, context, cb) {
    main();
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var listOfRecordings, listOfNotifications;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    winston.info('getting list of recordings available on twilio');
                    return [4 /*yield*/, listAllRecordings()];
                case 1:
                    listOfRecordings = _a.sent();
                    winston.info('processing to notification obj');
                    return [4 /*yield*/, processRecordings2Notifcations(listOfRecordings)];
                case 2:
                    listOfNotifications = _a.sent();
                    winston.info('getting caller information');
                    return [4 /*yield*/, GatherCallerInformation(listOfNotifications)];
                case 3:
                    listOfNotifications = _a.sent();
                    winston.info('downloading audio and uploading to S3');
                    return [4 /*yield*/, DownloadAndUploadAllCallAudio(listOfNotifications)];
                case 4:
                    listOfNotifications = _a.sent();
                    winston.info('Make notification calls');
                    MakeNotifications(listOfNotifications);
                    CleanUpRecordings(listOfNotifications);
                    //MakeNotifications(listOfNotifications);
                    // listOfNotifications[]
                    // TODO
                    // DONE 1. For each record
                    // DONE 2. Get Notification info
                    // DONE 3. Get all information
                    // 3. Get recording file 
                    // 4. Notification lex and convert to txt
                    // 5. Run a notification event (class maybe and push all the notifications)
                    //console.log(listOfNotifications);
                    console.log("--------------------------");
                    return [2 /*return*/];
            }
        });
    });
}
function MakeNotifications(listAllRecordings) {
    listAllRecordings.forEach(function (notification) {
        //send email 
        //send slack msg 
        notification.getNotification();
        PostSlackMessage(config_1.Config.slackPostWebhoock, notification.getNotification());
    });
}
function PostSlackMessage(slackurl, messageObject) {
    var params = {
        method: 'POST',
        uri: slackurl,
        json: { text: messageObject }
    };
    request.post(params, function (err, response, body) {
        if (err) {
            winston.error("Received error on slack message:" + err);
        }
        else {
            winston.info("Posted to slack!");
            //winston.info(response);
            //winston.info(body);
        }
    });
}
function DownloadAndUploadAllCallAudio(listOfNotifications) {
    return __awaiter(this, void 0, void 0, function () {
        var i, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i < listOfNotifications.length)) return [3 /*break*/, 4];
                    _a = listOfNotifications[i];
                    return [4 /*yield*/, httpGetBinary(listOfNotifications[i].recordingPathURI)];
                case 2:
                    _a.recordingFile = _b.sent();
                    uploadFileToS3('answer-4me', 'callrecordings', listOfNotifications[i].recordingFileName, listOfNotifications[i].recordingFile);
                    listOfNotifications[i].setRecordingPathURI(getSigngedURL('answer-4me', 'callrecordings', listOfNotifications[i].recordingFileName));
                    _b.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, listOfNotifications];
            }
        });
    });
}
function GatherCallerInformation(listOfNotifications) {
    return __awaiter(this, void 0, void 0, function () {
        var i, callInfoPromise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    winston.debug('Entered GatherCallerInformation');
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < listOfNotifications.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, addCallerInformation(listOfNotifications[i])];
                case 2:
                    callInfoPromise = _a.sent();
                    listOfNotifications[i] = callInfoPromise;
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, listOfNotifications];
            }
        });
    });
}
function addCallerInformation(notification) {
    return __awaiter(this, void 0, void 0, function () {
        var callInfo, callObject, url, twilioCallData, dynamodbCallLog, dynamodbCallLog_1, dynDBExpectedKeys, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    callInfo = new CallInfo_1.CallInfo();
                    return [4 /*yield*/, getCallTwilio(notification.callSid)];
                case 1:
                    callObject = _a.sent();
                    url = 'https://' + accountSid + ':' + authToken
                        + '@api.twilio.com/2010-04-01' + callObject._uri;
                    return [4 /*yield*/, httpGet(url)];
                case 2:
                    twilioCallData = _a.sent();
                    twilioCallData = JSON.parse(twilioCallData);
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, getCallLogDynamoDB(notification.callSid)];
                case 4:
                    dynamodbCallLog_1 = _a.sent();
                    dynDBExpectedKeys = callInfo.getListOfCallerObjectKeys();
                    winston.debug('DynamoDB output');
                    // console.log(dynamodbCallLog.Item.CallerZip.S);
                    winston.debug(dynamodbCallLog_1);
                    winston.debug('DynamoDB expected Keys');
                    winston.debug(dynDBExpectedKeys);
                    dynDBExpectedKeys.forEach(function (element) {
                        callInfo[element] = dynamodbCallLog_1.Item[element]['S'];
                        winston.debug(element + " : " + callInfo[element]);
                    });
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    winston.info('dynamodb said no call log found');
                    winston.debug(e_1);
                    return [3 /*break*/, 6];
                case 6:
                    //TODO make query to dynamo to try and get location for that call
                    callInfo.Caller = twilioCallData.from_formatted;
                    callInfo.CallDuration = twilioCallData.duration;
                    callInfo.CalledDate = twilioCallData.start_time;
                    notification.setCallerInfo(callInfo);
                    //console.log(callData.subresource_uris);
                    // console.log(JSON.parse(callData));
                    //console.log(callData);
                    // console.log('^ yup ');
                    // console.log("dynamodb output");
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
            return [2 /*return*/, client.calls(callSid)];
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
function processRecordings2Notifcations(listOfRecordings) {
    var notifications = new Array();
    listOfRecordings.forEach(function (recording) {
        var notification = new Notification_1.Notification();
        notification.callSid = recording.callSid;
        notification.recordingid = recording.sid;
        notification.setRecordingPathURI('https://api.twilio.com' + recording.uri.replace(".json", ".mp3"));
        notifications.push(notification);
    });
    return notifications;
}
function listAllRecordings() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, client.recordings.list()];
        });
    });
}
function uploadFileToS3(bucket, keyprefix, filename, file) {
    var s3 = new S3({ region: 'us-east-1' });
    var params = {
        Body: file,
        Bucket: bucket,
        Key: keyprefix + '/' + filename
    };
    s3.putObject(params, function (err, data) {
        if (err) {
            winston.debug(err, err.stack); // an error occurred
            winston.error('failed S3 upload: ' + err);
        }
        else {
            winston.info("File uploaded to S3: " + filename);
        }
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
function CleanUpRecordings(listOfNotifications) {
    listOfNotifications.forEach(function (element) {
        deleteRecording(element.recordingid);
    });
}
function deleteRecording(recordingSid) {
    client.recordings(recordingSid)
        .remove()
        .then(function () { return console.log("Sid " + recordingSid + " deleted successfully."); })["catch"](function (err) {
        console.log(err.status);
        throw err;
    });
}
