import * as nock from 'nock';

export default function(){

  nock('https://hooks.slack.com')
  .persist()
  .post(() =>  true)
  .reply(200, (uri: string, requestBody: string) => {
    return requestBody ;
  });

}
