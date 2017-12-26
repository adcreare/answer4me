import * as nock from 'nock';

export default function(){
  nock('https://api.twilio.com/')
  .persist()
  .get(/Recordings.json+/)
  .reply(200, (uriRequest) => {

    const response = {
      first_page_uri: uriRequest,
      end: 0,
      previous_page_uri: null,
      uri: uriRequest,
      page_size: 50,
      start: 0,
      next_page_uri: null,
      page: 0,
      recordings: [
        {
          call_sid: 'CA8dfedb55c129dd4d6bd1f59af9d11080',
          date_created: 'Tue, 18 Oct 2016 21:55:38 +0000',
          date_updated: 'Tue, 18 Oct 2016 21:56:34 +0000',
          duration: 53,
          price: '-0.00250',
          price_unit: 'USD',
          sid: 'RE557ce644e5ab84fa21cc21112e22c485',
          source: 'DialVerb',
          status: 'completed',
          uri: `/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/`
          + `Recordings/RE557ce644e5ab84fa21cc21112e22c485.json`
        },
        {
          call_sid: 'BA8dfedb55c129dd4d6bd1f59af9d11080',
          date_created: 'Tue, 16 Oct 2016 21:55:38 +0000',
          date_updated: 'Tue, 16 Oct 2016 21:56:34 +0000',
          duration: 5,
          price: '-0.00050',
          price_unit: 'USD',
          sid: 'AE557ce644e5ab84fa21cc21112e22c485',
          source: 'DialVerb',
          status: 'completed',
          uri: `/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/`
          + `Recordings/AE557ce644e5ab84fa21cc21112e22c485.json`
        },
      ]
    };

    return response;
  });

  nock('https://api.twilio.com/')
  .persist()
  .get(/Calls\/\w+\.json+/)
  .reply(200, (uriRequest) => {
    const response = {
      sid: 'CAe1644a7eed5088b159577c5802d8be38',
      account_sid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      to: '+14153855708',
      from: '+14158141819',
      to_formatted: '(415) 385-5708',
      from_formatted: '(415) 814-1819',
      start_time: 'Tue, 10 Aug 2010 08:02:31 +0000',
      end_time: 'Tue, 10 Aug 2010 08:02:47 +0000',
      duration: '16',
      price: '-0.03000',
      uri: '\/2010-04-01\/Accounts\/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\/Calls\/CAe1644a7eed5088b159577c5802d8be38.json',
    };

    return response;
    });

  nock('https://api.twilio.com/')
  .persist()
  .get(/\.mp3+/)
  .query(true)
  .reply(200, (uriRequest) => {

    const response = new Buffer([ 0x8, 0x6, 0x7, 0x5, 0x3, 0x0, 0x9]);

    return response;
  });

  // TODO: if this isn't here then we get an exception in the code
  // need to look into that
  nock('https://api.twilio.com/')
  .persist()
  .delete(() => true)
  .reply(200, (uriRequest) => {

    return '';
  });

}
