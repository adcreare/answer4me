
// var twilio = require("twilio");
import * as twilio from 'twilio';
import {Config} from './config'
import {Notification} from './objects/Notification'

const accountSid = Config.accountSid
const authToken = Config.authToken

const client = twilio(accountSid, authToken);

export const phonein = (event, context, cb) => {
 

  main();


}

async function main(){

  let listOfRecordings  = await listAllRecordings(); 
  let listOfNotifications = combineRecordingListToNotificationList(listOfRecordings)

  listOfNotifications[]

  // TODO
  // DONE 1. For each record
  // DONE 2. Get Notification info
  // 3. Get all information
  // 3. Get recording file 
  // 4. Notification lex and convert to txt
  // 5. Run a notification event (class maybe and push all the notifications)

  console.log();


  //tasks


}

function processCalls(listOfNotifications: Array<Notification>) 
{

}

async function addCallerInformation(notification: Notification)
{
  let callInformation = await getCallInformation(notification.callSid)
}

async function getCallInformation(callSid : string) : Promise<any>
{

  return client.calls(callSid)
}

function combineRecordingListToNotificationList(listOfRecordings) : Array<Notification>
{
  let notifications: Array<Notification> = new Array();

  listOfRecordings.forEach(recording => {
    let notification: Notification = new Notification();

    notification.callSid = recording.callSid;
    notification.recordingid = recording.sid;
    notification.recordingPathURI = 'https://api.twilio.com/' + recording.uri.replace(".json",".mp3");
    
    notifications.push(notification);

  });

  return notifications;
}

async function listAllRecordings():Promise<any>
{
  return client.recordings.list();
}