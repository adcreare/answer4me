import {CallInfo} from './CallInfo';

export class Notification {
  public callSid: string;
  public recordingid: string;
  public recordingPathURI: string;
  public recordingFile: Buffer;
  public recordingFileName: string;
  private CallerInfo: CallInfo

  constructor(){
    return
  }

  public setCallerInfo(callInformation)
  {
    this.CallerInfo = callInformation
    return true;
  }
  public getCallerInfo(): CallInfo{
    return this.CallerInfo;
  }

  public setRecordingPathURI(url:string)
  {
    this.recordingPathURI = url
    let splitpath = url.split('/');
    this.recordingFileName = splitpath[splitpath.length-1];
    return
  }

  getNotification(){
 
    // let response = {
    //   CallInfo: this.CallerInfo,
    //   RecordingURL: this.recordingPathURI
    // }

    let response = `*New Voicemail!* \n
    Caller: ${this.CallerInfo.Caller} \n
    City: ${this.CallerInfo.CallerCity} \n
    Country: ${this.CallerInfo.CallerCountry} \n
    State: ${this.CallerInfo.CallerState} \n
    Zip: ${this.CallerInfo.CallerZip} \n
    Message Duration: ${this.CallerInfo.CallDuration} Left at ${this.CallerInfo.CalledDate} \n \n
    URL: ${this.recordingPathURI} \n\n`;

    return response;
  }

}