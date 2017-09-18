
// var twilio = require("twilio");
import * as twilio from 'twilio';
import {Config} from './config'

export const phonein = (event, context, cb) => {

  var twiml = new twilio.twiml.VoiceResponse
  twiml.play({},Config.welcomeMP3FileUrl);
  // twiml.say('Hello, David is unavailable at the moment, this is answer4me. Please leave a message after the tone');

  let output: string = twiml.toString();
  
  twiml.record({timeout: 45});
  twiml.hangup();
  
  console.log('the event');
  console.log(event);
  console.log('response output');
  console.log(output);

  cb(null,twiml.toString());


}

