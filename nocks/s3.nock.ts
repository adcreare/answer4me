import * as nock from 'nock';

export default function(){

  nock('https://s3.amazonaws.com/')
  .persist()
  .put(() =>  true) // match all
  .reply(200, (uriRequest, body) => {

    return '';
  });

  nock(/[a-z0-9][a-z0-9-.]*\.s3.amazonaws.com/)
  .filteringPath(() => '/')
  .persist()
  .put('/')
  .reply(200, (uriRequest, body) => {

    return '';
  });

}
