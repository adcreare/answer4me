import * as assert from 'assert';
import * as nock from 'nock';
import * as twilio from './twilio';

import twilioNock from '../nocks/twilio.nock';

describe('Test Twilio', () => {

  twilioNock();

  test('list calls', async () => {
    const response = await twilio.listRecordings();
    assert.strictEqual(response.length, 2);
    assert.strictEqual(typeof(response[0].callSid), 'string');
    assert.strictEqual(typeof(response[0].sid), 'string');
    assert.strictEqual(response[0].uri.endsWith('.json'), true);
  });


  test('list one call', async () => {
    const response = await twilio.getCallTwilioInfo('testcall');

    // check for fields we specifically use
    assert.strictEqual(typeof(response.start_time), 'string');
    assert.strictEqual(typeof(response.from_formatted), 'string');
    assert.strictEqual(typeof(response.duration), 'string');
  });

  test('parse the call', async () => {
    const response = await twilio.listRecordings();
    const responseCall = await twilio.parseRecording(response[0]);

    assert.strictEqual(responseCall.recordingFileName.endsWith('.mp3'), true);

  });

});


