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
var mp3Duration = require("mp3-duration");
var winston = require("winston");
var util = require("./modules/util");
var config_1 = require("./config");
var CallInfo_1 = require("./objects/CallInfo");
var DynamoDB = require("./modules/dynamodb");
var S3 = require("./modules/s3");
var Slack = require("./modules/slack");
var TwilioApi = require("./modules/twilio");
var logger = winston;
logger.level = 'debug';
logger.info('Starting Application Answer 4 Me');
exports.phonein = function (event, context, cb) {
    try {
        main(cb);
    }
    catch (e) {
        logger.error("Exception received calling main: " + e);
    }
};
function main(cb) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var listOfRecordings, e_1, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info('getting list of recordings available on twilio');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, TwilioApi.listRecordings()];
                case 2:
                    listOfRecordings = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    error = new Error("unable to receive calls from twillo: " + e_1);
                    logger.error(error.message);
                    cb(error); // make it retry in lambda
                    return [3 /*break*/, 4];
                case 4:
                    // process the calls!
                    listOfRecordings.forEach(function (call) { return __awaiter(_this, void 0, void 0, function () {
                        var callData, e_2, message;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    logger.info('processing to notification obj');
                                    return [4 /*yield*/, TwilioApi.parseRecording(call)];
                                case 1:
                                    callData = _a.sent();
                                    logger.info('getting caller information');
                                    return [4 /*yield*/, GatherCallerInformation(callData)];
                                case 2:
                                    callData = _a.sent();
                                    logger.info('downloading audio and uploading to S3');
                                    return [4 /*yield*/, DownloadAndUploadAllCallAudio(callData)];
                                case 3:
                                    callData = _a.sent();
                                    // logger.info('try and get recording length')
                                    // await notification.setCallerInfo(getRecordingLength(
                                    //   notification.getCallerInfo(),notification.recordingFile));
                                    logger.info('Make notification');
                                    MakeNotification(callData);
                                    logger.info('clean up ');
                                    TwilioApi.deleteRecording(callData.recordingid);
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_2 = _a.sent();
                                    logger.error("Exception thrown processing a call: " + call + " - Exception: " + e_2);
                                    message = "Exception thrown processing a call. Exception: " + e_2 + ";"
                                        + ("Call info " + call);
                                    Slack.postMessage(config_1.Config.slackPostWebhoock, message);
                                    Slack.postMessage(config_1.Config.slackPostWebhoock, "Notification object: " + JSON.stringify(callData));
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
    Slack.postMessage(config_1.Config.slackPostWebhoock, notification.getNotification());
}
function DownloadAndUploadAllCallAudio(notification) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = notification;
                    return [4 /*yield*/, util.httpGetBinary(notification.recordingPathURI)];
                case 1:
                    _a.recordingFile = _b.sent();
                    return [4 /*yield*/, S3.uploadFileToS3('answer-4me', 'callrecordings', notification.recordingFileName, notification.recordingFile)];
                case 2:
                    _b.sent();
                    notification.setRecordingPathURI(S3.getSigngedURL('answer-4me', 'callrecordings', notification.recordingFileName));
                    return [2 /*return*/, notification];
            }
        });
    });
}
function GatherCallerInformation(callData) {
    return __awaiter(this, void 0, void 0, function () {
        var callInfoPromise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.debug('Entered GatherCallerInformation');
                    return [4 /*yield*/, addCallerInformation(callData)];
                case 1:
                    callInfoPromise = _a.sent();
                    callData = callInfoPromise;
                    return [2 /*return*/, callData];
            }
        });
    });
}
function addCallerInformation(notification) {
    return __awaiter(this, void 0, void 0, function () {
        var callInfo, twilioCallData, dynDBExpectedKeys, dynamodbCallLog, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    callInfo = new CallInfo_1.CallInfo();
                    return [4 /*yield*/, TwilioApi.getCallTwilioInfo(notification.callSid)];
                case 1:
                    twilioCallData = _a.sent();
                    dynDBExpectedKeys = callInfo.getListOfCallerObjectKeys();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, DynamoDB.getCall(notification.callSid)];
                case 3:
                    dynamodbCallLog = _a.sent();
                    dynDBExpectedKeys.forEach(function (element) {
                        callInfo[element] = dynamodbCallLog.Item[element].S;
                        logger.debug(element + ' : ' + callInfo[element]);
                    });
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    logger.info('dynamodb said no call log found');
                    logger.debug(e_3);
                    return [3 /*break*/, 5];
                case 5:
                    callInfo.Caller = twilioCallData.from_formatted;
                    callInfo.CalledDate = twilioCallData.start_time;
                    callInfo.CallDuration = twilioCallData.duration; // maybe unknow (source null)
                    notification.setCallerInfo(callInfo);
                    return [2 /*return*/, notification]; // can i even return this?
            }
        });
    });
}
function getRecordingLength(call, file) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, e_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(call.CallDuration === null)) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = call;
                    return [4 /*yield*/, getMP3duration(file)];
                case 2:
                    _a.CallDuration = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_4 = _b.sent();
                    logger.error('unable to parse duration off mp3. Using provided value (if set)');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, call];
            }
        });
    });
}
function getMP3duration(file) {
    return new Promise(function (resolve, reject) {
        mp3Duration(file, function (err, duration) {
            if (err) {
                logger.error("unable to parse mp3 for duration: " + err);
                reject(err);
            }
            logger.debug("obtained length of mp3 " + duration);
            resolve(duration);
        });
    });
}
//# sourceMappingURL=checkgetrecording.js.map