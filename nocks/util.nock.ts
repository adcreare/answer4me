import * as nock from 'nock';

const testBuffer = new Buffer([0x74, 0xd8, 0x74, 0x04, 0xd0, 0xa0, 0xb9, 0xed, 0xc5, 0xa4]);

export default function(){
  nock('http://test.nock')
  .persist()
  .get('/')
  .reply(200, 'HTTP-test-Response');

  nock('http://nock.binrary')
  .persist()
  .get('/')
  .query(true)
  .reply(200, (uri: string, request: string) => {
    return testBuffer;
  });

  nock('http://nock.post')
  .persist()
  .post('/')
  .reply(200, (uri: string, requestBody: string) => {
    return requestBody ;
  });

}
