"use strict";
exports.__esModule = true;
// var twilio = require("twilio");
var DynamoDB = require("aws-sdk/clients/dynamodb");
var Lambda = require("aws-sdk/clients/lambda");
var twilio = require("twilio");
var winston = require("winston");
var config_1 = require("./config");
var logger = winston;
logger.level = 'debug';
exports.phonein = function (event, context, cb) {
    if (event.body.CallStatus === 'completed') {
        TriggerProcessCompletedCallLambda(cb);
    }
    else {
        ProcessNewCall(event, cb);
    }
};
function TriggerProcessCompletedCallLambda(cb) {
    logger.debug('TriggerProcessCompletedCallLambda');
    var lambda = new Lambda({ region: 'us-east-1' });
    var params = {
        FunctionName: 'answer4me-dev-checkgetrecording'
    };
    lambda.invoke(params, function (err, data) {
        if (err) {
            logger.error('Error Calling lambda');
            logger.error(err.message, err.stack); // an error occurred
            cb(err, 'unable to call getrecording');
        }
        else {
            logger.info('called lambda function - exit');
            cb(null, 'Completed');
        }
    });
}
function ProcessNewCall(event, cb) {
    logger.debug('event object');
    logger.debug(JSON.stringify(event));
    var twiml = new twilio.twiml.VoiceResponse();
    twiml.play({}, config_1.Config.welcomeMP3FileUrl);
    // twiml.say('Hello, David is unavailable at the moment, this is answer4me. Please leave a message after the tone');
    var output = twiml.toString();
    twiml.record({ timeout: 45 });
    twiml.hangup();
    cb(null, twiml.toString());
    try {
        PutCallInDynamoDB(event.body.CallSid, event.body.CallerCountry, event.body.CallerState, event.body.CallerZip, event.body.CallerCity, event.body.Caller);
    }
    catch (e) {
        logger.error('exception thrown with dynamo function call: ' + e);
    }
}
function PutCallInDynamoDB(callid, CallerCountry, CallerState, CallerZip, CallerCity, Caller) {
    var dynamodb = new DynamoDB({ region: 'us-east-1' });
    var params = {
        Item: {
            callid: {
                S: callid
            },
            CallerCountry: {
                S: CallerCountry
            },
            CallerState: {
                S: CallerState
            },
            CallerZip: {
                S: CallerZip
            },
            CallerCity: {
                S: CallerCity
            },
            Caller: {
                S: Caller
            }
        },
        TableName: 'answer4me-call-log'
    };
    dynamodb.putItem(params, function (err, data) {
        if (err) {
            logger.error(err.message + err.stack);
        } // an error occurred
        else {
            logger.debug(JSON.stringify(data));
        } // successful response
    });
}
//# sourceMappingURL=callresponder.js.map