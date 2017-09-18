"use strict";
exports.__esModule = true;
// var twilio = require("twilio");
var twilio = require("twilio");
var config_1 = require("./config");
exports.phonein = function (event, context, cb) {
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
};
//# sourceMappingURL=callresponder.js.map