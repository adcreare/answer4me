"use strict";
exports.__esModule = true;
// var twilio = require("twilio");
var DynamoDB = require("aws-sdk/clients/dynamodb");
var twilio = require("twilio");
var config_1 = require("./config");
exports.phonein = function (event, context, cb) {
    if (event.body.CallStatus == 'completed') {
        TriggerProcessCompletedCallLambda();
    }
    else {
        ProcessNewCall(event, cb);
    }
};
function TriggerProcessCompletedCallLambda() {
    console.log('TriggerProcessCompletedCallLambda');
}
function ProcessNewCall(event, cb) {
    var twiml = new twilio.twiml.VoiceResponse;
    twiml.play({}, config_1.Config.welcomeMP3FileUrl);
    // twiml.say('Hello, David is unavailable at the moment, this is answer4me. Please leave a message after the tone');
    var output = twiml.toString();
    twiml.record({ timeout: 45 });
    twiml.hangup();
    console.log('the event');
    console.log(event);
    console.log('response output');
    console.log(output);
    cb(null, twiml.toString());
    try {
        PutCallInDynamoDB(event.body.CallSid, event.body.CallerCountry, event.body.CallerState, event.body.CallerZip, event.body.CallerCity, event.body.Caller);
    }
    catch (e) {
        console.log('exception thrown with dynamo function call: ' + e);
    }
}
function PutCallInDynamoDB(callid, CallerCountry, CallerState, CallerZip, CallerCity, Caller) {
    var dynamodb = new DynamoDB({ region: 'us-east-1' });
    var params = {
        Item: {
            "callid": {
                S: callid
            },
            "CallerCountry": {
                S: CallerCountry
            },
            "CallerState": {
                S: CallerState
            },
            "CallerZip": {
                S: CallerZip
            },
            "CallerCity": {
                S: CallerCity
            },
            "Caller": {
                S: Caller
            }
        },
        TableName: "answer4me-call-log"
    };
    dynamodb.putItem(params, function (err, data) {
        if (err)
            console.log(err, err.stack); // an error occurred
        else
            console.log(data); // successful response
    });
}
//# sourceMappingURL=callresponder.js.map