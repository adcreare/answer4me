
// var twilio = require("twilio");
import * as mp3Duration from 'mp3-duration';
import * as winston from 'winston';
import * as util from './modules/util';

import {Config} from './config';
import {CallInfo} from './objects/CallInfo';
import {CallData} from './objects/Notification';
import {TwilioCall} from './objects/TwilioCall';

import * as DynamoDB from './modules/dynamodb';
import * as S3 from './modules/s3';
import * as Slack from './modules/slack';
import * as TwilioApi from './modules/twilio';

const logger = winston;
logger.add(winston.transports.File, { filename: 'somefile.log' });

logger.level = 'debug';
logger.info('Starting Application Answer 4 Me');

export const phonein = (event, context, cb) => {
  try{
    main(cb);
  }
  catch (e)
  {
    logger.error(`Exception received calling main: ${e}`);
  }


};

async function main(cb){

  logger.info('getting list of recordings available on twilio');

  let listOfRecordings: TwilioCall[];
  try{
    listOfRecordings  = await TwilioApi.listRecordings();
  }
  catch (e){
    const error = new Error(`unable to receive calls from twillo: ${e}`);
    logger.error(error.message);
    cb(error); // make it retry in lambda
  }

  const tasks: Array<Promise<any>> = [];

  // process the calls!
  listOfRecordings.forEach(async (call: TwilioCall) => {
    let callData: CallData;

    try{
      logger.info('processing to notification obj');
      callData = await TwilioApi.parseRecording(call);

      logger.info('getting caller information');
      callData = await GatherCallerInformation(callData);

      logger.info('downloading audio and uploading to S3');
      callData = await DownloadAndUploadAllCallAudio(callData);

      // logger.info('try and get recording length')
      // await notification.setCallerInfo(getRecordingLength(
      //   notification.getCallerInfo(),notification.recordingFile));

      logger.info('Make notification');
      tasks.push(MakeNotification(callData));

      logger.info('clean up ');
      tasks.push(TwilioApi.deleteRecording(callData.recordingid));
    }
    catch (e){

      logger.error(`Exception thrown processing a call: ${call} - Exception: ${e}`);
      const message = `Exception thrown processing a call. Exception: ${e};`
        + `Call info ${call}`;

      Slack.postMessage(Config.slackPostWebhoock, message);
      Slack.postMessage(Config.slackPostWebhoock, `Notification object: ${JSON.stringify(callData)}`);

    }

  });

  try {
    await Promise.all(tasks);
    cb(null, {itemsprocessed: listOfRecordings.length, status: 'complete'});
  }
  catch (exception)
  {
    throw exception;
  }

}

function MakeNotification(notification: CallData)
{
  return Slack.postMessage(Config.slackPostWebhoock, notification.getNotification());
}

export async function DownloadAndUploadAllCallAudio(notification: CallData)
{
  logger.debug('Downloading call audio');
  logger.debug(notification.recordingPathURI);

  notification.recordingFile = await util.httpGetBinary(notification.recordingPathURI);

  logger.debug('uploading call audio');

  console.log('about to make S3 call');
  await S3.uploadFileToS3('answer-4me', 'callrecordings',
        notification.recordingFileName, notification.recordingFile);

  logger.debug('Getting signed url');

  notification.setRecordingPathURI(S3.getSigngedURL('answer-4me', 'callrecordings',
        notification.recordingFileName));

  return notification;
}

async function GatherCallerInformation(callData: CallData)
{
  logger.debug('Entered GatherCallerInformation');

  const callInfoPromise = await addCallerInformation(callData);
  callData = callInfoPromise;

  return callData;
}

async function addCallerInformation(notification: CallData)
{

  const callInfo = new CallInfo();

  // TODO: do these in parallel with dynamodb
  const twilioCallData = await TwilioApi.getCallTwilioInfo(notification.callSid);
  const dynDBExpectedKeys = callInfo.getListOfCallerObjectKeys();

  let dynamodbCallLog;

  try{
    dynamodbCallLog = await DynamoDB.getCall(notification.callSid);

    dynDBExpectedKeys.forEach(element => {
      callInfo[element] = dynamodbCallLog.Item[element].S;
      logger.debug(element + ' : ' + callInfo[element]);
    });

  }
  catch (e){
    logger.info('dynamodb said no call log found');
    logger.debug(e);

  }

  callInfo.Caller = twilioCallData.from_formatted;
  callInfo.CalledDate = twilioCallData.start_time;
  callInfo.CallDuration = twilioCallData.duration; // maybe unknow (source null)


  notification.setCallerInfo(callInfo);
  return notification; // can i even return this?
}


async function getRecordingLength(call: CallInfo, file: Buffer)
{

  if (call.CallDuration === null)
  {
    // try and get duration
    try{
      call.CallDuration = await getMP3duration(file);
    }
    catch (e)
    {
      logger.error('unable to parse duration off mp3. Using provided value (if set)');
    }

  }

  return call;

}





function getMP3duration(file: Buffer): Promise<string>
{

  return new Promise((resolve, reject) => {

    mp3Duration(file, (err, duration) => {
      if (err)
      {
        logger.error(`unable to parse mp3 for duration: ${err}`);
        reject(err);
      }
      logger.debug(`obtained length of mp3 ${duration}`);
      resolve(duration);
    });
  });


}
