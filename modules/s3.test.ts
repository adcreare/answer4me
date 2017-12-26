import * as assert from 'assert';
import * as nock from 'nock';
import * as  s3 from './s3';

import s3Nock from '../nocks/s3.nock';


describe('Test S3', () => {

  s3Nock();

  test('put item into bucket(simple)', async () => {

    const dummyFile = new Buffer([ 0x8, 0x6, 0x7, 0x5, 0x3, 0x0, 0x9]);
    const request = await s3.uploadFileToS3('testBucket', 'keyprefix', 'filename', dummyFile);
    assert.deepStrictEqual(request, {});

  });

  test('put item into bucket(complex)', async () => {

    const dummyFile = new Buffer([ 0x8, 0x6, 0x7, 0x5, 0x3, 0x0, 0x9]);
    const request = await s3.uploadFileToS3('answer-4me', 'callrecordings',
    'RE557ce644e5ab84fa21cc21112e22c485.mp3', dummyFile);
    assert.deepStrictEqual(request, {});

  });

  test('Get signed url', async () => {

    const request = await s3.getSigngedURL('testBucket', 'keyprefix', 'filename');
    assert.strictEqual(request.startsWith('https://s3.amazonaws.com/'), true);

  });

});

