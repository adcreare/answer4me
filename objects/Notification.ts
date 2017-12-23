import {CallInfo} from './CallInfo';


export class CallData {
  public callSid: string;
  public recordingid: string;
  public recordingPathURI: string;
  public recordingFile: Buffer;
  public recordingFileName: string;
  public CallerInfo: CallInfo;

  constructor(){
    return;
  }

  public setCallerInfo(callInformation)
  {
    this.CallerInfo = callInformation;
    return true;
  }
  public getCallerInfo(): CallInfo{
    return this.CallerInfo;
  }

  public setRecordingPathURI(url: string)
  {
    this.recordingPathURI = url;
    const splitpath = url.split('/');
    this.recordingFileName = splitpath[splitpath.length - 1];
    return;
  }

  public getNotification(){

    // let response = {
    //   CallInfo: this.CallerInfo,
    //   RecordingURL: this.recordingPathURI
    // }

    const response = `*New Voicemail!* \n
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
