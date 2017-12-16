
// var twilio = require("twilio");
import * as twilio from 'twilio';
import * as winston from 'winston';
import * as mp3Duration from 'mp3-duration';

import DynamoDB = require("aws-sdk/clients/dynamodb");
import S3 = require("aws-sdk/clients/s3");

import {Config} from './config'
import {Notification} from './objects/Notification'
import {CallInfo} from './objects/CallInfo'

import * as request from 'request-promise-native';


winston.info('Starting Application Answer 4 Me');
winston.level = 'debug'

const accountSid = Config.accountSid
const authToken = Config.authToken
const twilioClient = twilio(accountSid, authToken);

export interface TwilioCall {
  callSid?: string;
  sid?: string;
  uri?: string;
}


export const phonein = (event, context, cb) => {
 
  try{
    main(cb);
  }
  catch (e)
  {
    winston.error(`Exception received calling main: ${e}`);
  }


}

async function main(cb){

  winston.info('getting list of recordings available on twilio');

  let listOfRecordings: TwilioCall[];
  try{
    listOfRecordings  = await listAllRecordings(); 
  }
  catch(e){
    const error = new Error(`unable to receive calls from twillo: ${e}`)
    winston.error(error);
    cb(error); // make it retry in lambda
  }  


  listOfRecordings.forEach(async (call: TwilioCall) => {
    let notification: Notification;
    
    try{
      winston.info('processing to notification obj');
      notification = await processRecording2Notifcation(call)
  
      winston.info('getting caller information')
      notification = await GatherCallerInformation(notification)
  
      winston.info('downloading audio and uploading to S3')
      notification = await DownloadAndUploadAllCallAudio(notification);

      // winston.info('try and get recording length')
      // await notification.setCallerInfo(getRecordingLength(
      //   notification.getCallerInfo(),notification.recordingFile));
  
      winston.info('Make notification')
      MakeNotification(notification);
  
      winston.info('clean up ')
      CleanUpTwilioRecording(notification.recordingid);
    }
    catch (e){
      
      winston.error(`Exception thrown processing a call: ${call} - Exception: ${e}`);
      const message = `Exception thrown processing a call. Exception: ${e};`
        +`Call info ${call}`;

      PostSlackMessage(Config.slackPostWebhoock,message);
      PostSlackMessage(Config.slackPostWebhoock,`Notification object: ${JSON.stringify(notification)}`);

    }

  });

}

function MakeNotification(notification: Notification)
{
  PostSlackMessage(Config.slackPostWebhoock,notification.getNotification());
}

function PostSlackMessage(slackurl,messageObject)
{

   const params = {
     method: 'POST',
     uri: slackurl,
     json: {text: messageObject}
   }

  request.post(params, function (err, response, body) {
    if(err){
      winston.error('Received error on slack message:' + err);
    }
    else{
      winston.info("Posted to slack!");
    }
  });

}

async function DownloadAndUploadAllCallAudio(notification: Notification) 
{

  notification.recordingFile = await httpGetBinary(notification.recordingPathURI);
  await uploadFileToS3('answer-4me','callrecordings',notification.recordingFileName,notification.recordingFile);
  notification.setRecordingPathURI(getSigngedURL('answer-4me','callrecordings',
        notification.recordingFileName));
                                                              
  return notification;
}

async function GatherCallerInformation(notification: Notification) 
{
  winston.debug('Entered GatherCallerInformation');

  let callInfoPromise = await addCallerInformation(notification);
  notification = callInfoPromise;

  return notification;
}

async function addCallerInformation(notification: Notification)
{

  let callInfo = new CallInfo();

  let callObject = await getCallTwilio(notification.callSid);
  
  //create download url with acccess perms
  const url = 'https://' + accountSid + ':' + authToken 
  + '@api.twilio.com/2010-04-01' + callObject._uri;

  let twilioCallData = await httpGet(url);
  twilioCallData = JSON.parse(twilioCallData);
  winston.debug(JSON.stringify(twilioCallData));

  let dynamodbCallLog;

  try{
    let dynamodbCallLog = await getCallLogDynamoDB(notification.callSid);
    let dynDBExpectedKeys = callInfo.getListOfCallerObjectKeys();
    winston.debug('DynamoDB output');
    winston.debug(dynamodbCallLog);
    winston.debug('DynamoDB expected Keys');
    winston.debug(dynDBExpectedKeys);

    dynDBExpectedKeys.forEach(element => {
      callInfo[element] = dynamodbCallLog.Item[element]['S']
      winston.debug(element + " : " + callInfo[element]);
    })

  }
  catch (e){
    winston.info('dynamodb said no call log found');
    winston.debug(e);

  }  // TODO: whole try catch block is a mess FIX!
  

  callInfo.Caller = twilioCallData.from_formatted
  callInfo.CalledDate = twilioCallData.start_time
  callInfo.CallDuration = twilioCallData.duration // maybe unknow (source null)
  

  notification.setCallerInfo(callInfo);
  
  return notification //can i even return this?
}

async function httpGet(callurl : string,) : Promise<any>
{
  return request(callurl);
}

async function httpGetBinary(callurl : string,) : Promise<any>
{
  return request(callurl,{ encoding : null });
}

async function getCallTwilio(callSid : string) : Promise<any>
{
  return twilioClient.calls(callSid);
}


async function getCallLogDynamoDB(callid) : Promise<any>
{
  const params = {
    Key: {
     "callid": {
       S: callid
      }
    }, 
    TableName: "answer4me-call-log"
  };

  let dynamodb = new DynamoDB({region:'us-east-1'});
  return dynamodb.getItem(params).promise();
  
}


function processRecording2Notifcation(recording: TwilioCall) : Notification
{

  let notification: Notification = new Notification();

  notification.callSid = recording.callSid;
  notification.recordingid = recording.sid;
  notification.setRecordingPathURI('https://api.twilio.com' + recording.uri.replace(".json",".mp3"));

  return notification;
}

async function listAllRecordings():Promise<any>
{
  return twilioClient.recordings.list();
}

async function uploadFileToS3(bucket,keyprefix,filename,file){

  const s3 = new S3({region:'us-east-1'});

  const params = {
    Body: file, 
    Bucket: bucket, 
    Key: keyprefix + '/' + filename 
   };

  try{
    await s3.putObject(params).promise(); 
    winston.info(`File uploaded to S3:  ${filename}`);
  }
  catch(e) {
    winston.debug(e); // an error occurred
    winston.error(`failed S3 upload: ${e}`);
    throw new Error('unable to upload to S3');
  }

}

function getSigngedURL(bucket,keyprefix,filename): string
{
  let s3 = new S3({region:'us-east-1'});
  let key: string = keyprefix + '/' + filename
  const params = {Bucket: bucket, Key: key, Expires: 4000};

  var url: string = s3.getSignedUrl('getObject', params);
  console.log('The URL is', url); // expires in 4000 seconds (over an hour) 

  return url
  
}

async function getRecordingLength(call: CallInfo, file: Buffer)
{

  if (call.CallDuration === null)
  {    
    // try and get duration
    try{
      call.CallDuration = await getMP3duration(file)
    }
    catch(e)
    {
      winston.error('unable to parse duration off mp3. Using provided value (if set)')
    }

  }

  return call;

}


function CleanUpTwilioRecording(recordingSid: string)
{
  twilioClient.recordings(recordingSid)
  .remove()
  .then(() => console.log(`Sid ${recordingSid} deleted successfully.`))
  .catch((err) => {
    console.log(err.status);
    throw err;
  });
}


function getMP3duration(file: Buffer): Promise<string>
{

  return new Promise( (resolve,reject) => {

    mp3Duration(file, function(err, duration){
      if(err) 
      {
        winston.error(`unable to parse mp3 for duration: ${err}`);
        reject(err);
      }
      winston.debug(`obtained length of mp3 ${duration}`);
      resolve(duration);
    })
  })


}