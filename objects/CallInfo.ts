export class CallInfo {

    
    public callerNumberFormatted: string

    public Caller: string
    public CallerCountry: string
    public CallerState: string
    public CallerZip: string
    public CallerCity: string

    public CalledDate: Date
    public CallDuration: String

    // public callSid: string;
    // public recordingid: string;
    // public recordingPathURI: string;
    // public recordingFileLocalPath: string;
    // public callInformation: CallInfo
    constructor(){
      return
    }
  
    public getListOfCallerObjectKeys(): Array<string>
    {
        let returnObj: Array<string>
        returnObj = ["Caller","CallerCountry","CallerState","CallerZip","CallerCity"];
        
        return returnObj
    }

  }