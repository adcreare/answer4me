
// var twilio = require("twilio");
import * as twilio from 'twilio';
import {Config} from './config'
import {Notification} from './objects/Notification'

import * as request from 'request-promise-native';
/*
^^^^ make note somewhere how this can be 
import {Request} from 'request-promise-native';

usage New Request(uri) //almost works needs some options.uri set

*/

const accountSid = Config.accountSid
const authToken = Config.authToken

const client = twilio(accountSid, authToken);

export const phonein = (event, context, cb) => {
 

  main();


}

async function main(){

  let listOfRecordings  = await listAllRecordings(); 

  let listOfNotifications = await processRecordings2Notifcations(listOfRecordings)

  console.log(listOfNotifications);
  console.log("\n \n")
  
  GatherCallerInformation(listOfNotifications)

  // listOfNotifications[]

  // TODO
  // DONE 1. For each record
  // DONE 2. Get Notification info
  // 3. Get all information
  // 3. Get recording file 
  // 4. Notification lex and convert to txt
  // 5. Run a notification event (class maybe and push all the notifications)

  // console.log();


  //tasks


}

function GatherCallerInformation(listOfNotifications: Array<Notification>) 
{
  listOfNotifications.forEach(function (notification: Notification){

    let callInfo = addCallerInformation(notification);

    callInfo.then((res) => {
      // console.log(res._uri);
      console.log("Promise resolved?");
      console.log("\n \n");
      return
    });

    return
    

  });

}

async function addCallerInformation(notification: Notification)
{
  let callObject = await getCall(notification.callSid);
  let twilioCallData = await getCallDetails(callObject._uri);
  twilioCallData = JSON.parse(twilioCallData);

  //TODO make query to dynamo to try and get location for that call

  console.log(twilioCallData.from);
  console.log(twilioCallData.from_formatted)
  console.log(twilioCallData.start_time);
  console.log(twilioCallData.duration);
  
  //console.log(callData.subresource_uris);

  // console.log(JSON.parse(callData));
  //console.log(callData);
  console.log('^ yup ');


  // console.log(callObject._version._account._calls)
  //console.log(callObject);

  return notification //can i even return this?
}

async function getCallDetails(callurl : string) : Promise<any>
{
  const url = 'https://' + accountSid + ':' + authToken 
              + '@api.twilio.com/2010-04-01' + callurl;
  return request(url);
}

async function getCall(callSid : string) : Promise<any>
{
  return client.calls(callSid);
}



function processRecordings2Notifcations(listOfRecordings) : Array<Notification>
{
  let notifications: Array<Notification> = new Array();

  listOfRecordings.forEach(recording => {
    let notification: Notification = new Notification();

    notification.callSid = recording.callSid;
    notification.recordingid = recording.sid;
    notification.recordingPathURI = 'https://api.twilio.com' + recording.uri.replace(".json",".mp3");
    
    notifications.push(notification);

  });

  return notifications;
}

async function listAllRecordings():Promise<any>
{
  return client.recordings.list();
}