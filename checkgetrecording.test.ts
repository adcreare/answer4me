import * as assert from 'assert';
import * as nock from 'nock';

import * as checkgetrecording from './checkgetrecording';

import {CallInfo} from './objects/CallInfo';
import {CallData} from './objects/Notification';


import dynamodbNock from './nocks/dynamodb.nock';
import s3Nock from './nocks/s3.nock';
import slackNock from './nocks/slack.nock';
import twilioNock from './nocks/twilio.nock';
import utilNock from './nocks/util.nock';

nock.disableNetConnect();
dynamodbNock();
s3Nock();
slackNock();
twilioNock();
utilNock();


describe('Test full operation', () => {

  test('run everything?', async (done) => {

    // let resultObject;
    await checkgetrecording.phonein('hello', 'context', (err, result) => {

      done();
    });

  });


});

describe('Test DownloadAndUploadAllCallAudio', () => {

  test('test building call info', async () => {

    const callData = new CallData();
    const callInfo = new CallInfo();

    callData.callSid = 'CA8dfedb55c129dd4d6bd1f59af9d11080';
    callData.recordingid = 'RE557ce644e5ab84fa21cc21112e22c485';
    callData.recordingPathURI = `https://api.twilio.com/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/`
    + `Recordings/RE557ce644e5ab84fa21cc21112e22c485.mp3`;
    callData.recordingFileName = 'RE557ce644e5ab84fa21cc21112e22c485.mp3';

    callInfo.Caller = '(415) 814-1819';
    callInfo.CallerCountry = 'test-Dynamodb-CallerCountry';
    callInfo.CallerState = 'test-Dynamodb-CallerState';
    callInfo.CallerZip = 'test-Dynamodb-CallerZip';
    callInfo.CallerCity = 'test-Dynamodb-CallerCity';
    callInfo.CalledDate = new Date('Tue, 10 Aug 2010 08:02:31 +0000');
    callInfo.CallDuration = '16';

    callData.setCallerInfo(callInfo);

    // let resultObject;

    const response = await checkgetrecording.DownloadAndUploadAllCallAudio(callData);
    assert.strictEqual(response.recordingid, 'RE557ce644e5ab84fa21cc21112e22c485');

  });


});
