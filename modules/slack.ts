import * as util from './util';


export function postMessage(slackurl, messageObject)
{

  const params = {
    method: 'POST',
    uri: slackurl,
    json: {text: messageObject}
  };

  return util.httpPost(params);
}
