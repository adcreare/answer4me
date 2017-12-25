import * as assert from 'assert';
import * as nock from 'nock';
import * as  dynamodb from './dynamodb';

import dynamodbNock from '../nocks/dynamodb.nock';

describe('Test Dynamodb', () => {

  dynamodbNock();

  test('Get basic item', async () => {
    const response = await dynamodb.getCall('callid');
    assert.strictEqual(response.Item.callid.S, 'test-Dynamodb-Call-ID');

  });


});
