
// var twilio = require("twilio");
import * as twilio from 'twilio';
import * as winston from 'winston';

import DynamoDB = require("aws-sdk/clients/dynamodb");
import S3 = require("aws-sdk/clients/s3");

import {Config} from './config'
import {Notification} from './objects/Notification'
import {CallInfo} from './objects/CallInfo'

import * as request from 'request-promise-native';
/*
^^^^ make note somewhere how this can be 
import {Request} from 'request-promise-native';

usage New Request(uri) //almost works needs some options.uri set

*/

winston.info('Starting Application Answer 4 Me');
winston.level = 'debug'

const accountSid = Config.accountSid
const authToken = Config.authToken

const client = twilio(accountSid, authToken);

export const phonein = (event, context, cb) => {
 

  main();


}

async function main(){

  winston.info('getting list of recordings available on twilio');
  let listOfRecordings  = await listAllRecordings(); 

  winston.info('processing to notification obj');
  let listOfNotifications = await processRecordings2Notifcations(listOfRecordings)

  winston.info('getting caller information')
  listOfNotifications = await GatherCallerInformation(listOfNotifications)

  winston.info('downloading audio and uploading to S3')
  listOfNotifications = await DownloadAndUploadAllCallAudio(listOfNotifications);

  winston.info('Make notification calls')
  MakeNotifications(listOfNotifications);


  // CleanUpRecordings(listOfNotifications);
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
  console.log("--------------------------")

  //tasks


}

function MakeNotifications(listAllRecordings: Array<Notification>)
{
  listAllRecordings.forEach(notification => {

    //send email 
    //send slack msg 
    notification.getNotification();
    
    PostSlackMessage(Config.slackPostWebhoock,notification.getNotification());

  });


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
      winston.error("Received error on slack message:" + err);
    }
    else{
      winston.info("Posted to slack!");
      //winston.info(response);
      //winston.info(body);
    }
  });

}

async function DownloadAndUploadAllCallAudio(listOfNotifications: Array<Notification>) 
{
  for(let i: number = 0; i < listOfNotifications.length; i++)
  {
    listOfNotifications[i].recordingFile = await httpGetBinary(listOfNotifications[i].recordingPathURI);
    uploadFileToS3('answer-4me','callrecordings',listOfNotifications[i].recordingFileName,listOfNotifications[i].recordingFile);
    listOfNotifications[i].setRecordingPathURI(getSigngedURL('answer-4me','callrecordings',
                                                              listOfNotifications[i].recordingFileName));
                                                              
    // listOfNotifications[i].setRecordingPathURI('https://s3.amazonaws.com/answer-4me/callrecordings/' + 
    //                                             listOfNotifications[i].recordingFileName);

  }
  return listOfNotifications;
}

async function GatherCallerInformation(listOfNotifications: Array<Notification>) 
{
  winston.debug('Entered GatherCallerInformation');
  for(let i: number = 0; i < listOfNotifications.length; i++)
  {
    let callInfoPromise = await addCallerInformation(listOfNotifications[i]);
    listOfNotifications[i] = callInfoPromise;
  }
  return listOfNotifications;
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

  let dynamodbCallLog;

  try{
    let dynamodbCallLog = await getCallLogDynamoDB(notification.callSid);
    let dynDBExpectedKeys = callInfo.getListOfCallerObjectKeys();
    winston.debug('DynamoDB output');
    // console.log(dynamodbCallLog.Item.CallerZip.S);
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
  




  //TODO make query to dynamo to try and get location for that call
  callInfo.Caller = twilioCallData.from_formatted
  callInfo.CallDuration = twilioCallData.duration
  callInfo.CalledDate = twilioCallData.start_time
    

  notification.setCallerInfo(callInfo);
  
  //console.log(callData.subresource_uris);

  // console.log(JSON.parse(callData));
  //console.log(callData);
  // console.log('^ yup ');
  // console.log("dynamodb output");

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
  return client.calls(callSid);
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


function processRecordings2Notifcations(listOfRecordings) : Array<Notification>
{
  let notifications: Array<Notification> = new Array();

  listOfRecordings.forEach(recording => {
    let notification: Notification = new Notification();

    notification.callSid = recording.callSid;
    notification.recordingid = recording.sid;
    notification.setRecordingPathURI('https://api.twilio.com' + recording.uri.replace(".json",".mp3"));

    notifications.push(notification);

  });

  return notifications;
}

async function listAllRecordings():Promise<any>
{
  return client.recordings.list();
}

function uploadFileToS3(bucket,keyprefix,filename,file){
  let s3 = new S3({region:'us-east-1'});

  const params = {
    Body: file, 
    Bucket: bucket, 
    Key: keyprefix + '/' + filename 
   };

  s3.putObject(params, function(err, data) {
    if (err){
      winston.debug(err, err.stack); // an error occurred
      winston.error('failed S3 upload: '+err);
    } 
    else{
      winston.info("File uploaded to S3: " + filename);
    }
  });

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

function CleanUpRecordings(listOfNotifications: Array<Notification>)
{
  listOfNotifications.forEach(element => {
    deleteRecording(element.recordingid);
  });
}


function deleteRecording(recordingSid)
{
  client.recordings(recordingSid)
  .remove()
  .then(() => console.log(`Sid ${recordingSid} deleted successfully.`))
  .catch((err) => {
    console.log(err.status);
    throw err;
  });
}
