import * as twilio from 'twilio';
import {Config} from '../config';
import {CallData} from '../objects/Notification';
import {TwilioCall} from '../objects/TwilioCall';
import * as util from './util';

const accountSid = Config.accountSid;
const authToken = Config.authToken;
const twilioClient = twilio(accountSid, authToken);



export function listRecordings(): Promise<TwilioCall[]>
{
  return twilioClient.recordings.list();
}

export function parseRecording(recording: TwilioCall): CallData
{
  const notification: CallData = new CallData();

  notification.callSid = recording.callSid;
  notification.recordingid = recording.sid;
  notification.setRecordingPathURI('https://api.twilio.com' + recording.uri.replace('.json', '.mp3'));

  return notification;
}

export async function getCallTwilioInfo(callSid: string): Promise<any>
{

  const callObject = await twilioClient.calls(callSid);

  // create download url with acccess perms
  const url = 'https://' + accountSid + ':' + authToken
    + '@api.twilio.com/2010-04-01' + callObject._uri;

  let twilioCallData = await util.httpGet(url);
  twilioCallData = JSON.parse(twilioCallData);

  return twilioCallData;
}

export function deleteRecording(recordingSid: string)
{
  twilioClient.recordings(recordingSid).remove();
}

