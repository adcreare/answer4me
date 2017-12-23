
// var twilio = require("twilio");
import DynamoDB = require('aws-sdk/clients/dynamodb');
import Lambda = require('aws-sdk/clients/lambda');
import * as twilio from 'twilio';
import * as winston from 'winston';
import {Config} from './config';

const logger = winston;
logger.level = 'debug';


export const phonein = (event, context, cb) => {

  if (event.body.CallStatus === 'completed') {
    TriggerProcessCompletedCallLambda(cb);
  }
  else{
    ProcessNewCall(event, cb);
  }

};

function TriggerProcessCompletedCallLambda(cb){
  logger.debug('TriggerProcessCompletedCallLambda');

  const lambda = new Lambda({region: 'us-east-1'});

  const params = {
    FunctionName: 'answer4me-dev-checkgetrecording', /* required */
  };
  lambda.invoke(params, (err, data) => {
    if (err)
    {
      logger.error('Error Calling lambda');
      logger.error(err.message, err.stack); // an error occurred
      cb(err, 'unable to call getrecording');
    }
    else{
      logger.info('called lambda function - exit');
      cb(null, 'Completed');
    }

  });

}

function ProcessNewCall(event, cb)
{
  logger.debug('event object');
  logger.debug(JSON.stringify(event));

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.play({}, Config.welcomeMP3FileUrl);
  // twiml.say('Hello, David is unavailable at the moment, this is answer4me. Please leave a message after the tone');

  const output: string = twiml.toString();

  twiml.record({timeout: 45});
  twiml.hangup();



  cb(null, twiml.toString());

  try{
    PutCallInDynamoDB(event.body.CallSid, event.body.CallerCountry, event.body.CallerState,
      event.body.CallerZip, event.body.CallerCity, event.body.Caller);
  }
  catch (e){
   logger.error('exception thrown with dynamo function call: ' + e);
  }

}


function PutCallInDynamoDB(callid, CallerCountry, CallerState, CallerZip, CallerCity, Caller){

  const dynamodb = new DynamoDB({region: 'us-east-1'});

  const params = {
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


  dynamodb.putItem(params, (err, data) => {
    if (err) {
      logger.error(err.message + err.stack);
     } // an error occurred
    else {
      logger.debug(JSON.stringify(data));
    }         // successful response
  });

}
