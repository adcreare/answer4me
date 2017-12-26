import * as assert from 'assert';
import * as nock from 'nock';
import * as slack from './slack';

import slackNock from '../nocks/slack.nock';

describe('Test Slack', () => {

  slackNock();

  test('http post', async () => {
    const params = {
      url: 'http://nock.post',
      form: {
        key1: 'keyvalue',
      }
    };

    const response = await slack.postMessage('https://hooks.slack.com/services/balbalha', 'hello');
    assert.deepStrictEqual(response, {text: 'hello'});

  });


});

