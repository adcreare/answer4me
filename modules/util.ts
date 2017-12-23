import * as request from 'request-promise-native';

export function httpGet(callurl: string): Promise<any>
{
  return request(callurl);
}

export function httpGetBinary(callurl: string): Promise<any>
{
  return request(callurl, {encoding : null });
}

export function httpPost(params: any): Promise<any>
{
  return request.post(params);
}
