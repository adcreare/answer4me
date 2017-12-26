import * as assert from 'assert';
import * as nock from 'nock';
import * as util from './util';

import utilNock from '../nocks/util.nock';

const testBuffer = new Buffer([0x74, 0xd8, 0x74, 0x04, 0xd0, 0xa0, 0xb9, 0xed, 0xc5, 0xa4]);

describe('Test Util', () => {

  utilNock();

  test('http get', async () => {
    const response = await util.httpGet('http://test.nock/');
    assert.strictEqual(response, 'HTTP-test-Response');

    // test with binary ensure we're processing to utf 8
    const responseBinary = await util.httpGet('http://nock.binrary');
    assert.strictEqual(responseBinary, testBuffer.toString());

  });

  test('http get binary encoding method', async () => {

    const response = await util.httpGetBinary('http://nock.binrary');
    assert.deepStrictEqual(response, testBuffer);

  });

  test('http post', async () => {
    const params = {
      url: 'http://nock.post',
      form: {
        key1: 'keyvalue',
      }
    };

    const response = await util.httpPost(params);
    assert.deepStrictEqual(response, 'key1=keyvalue');


  });


});
