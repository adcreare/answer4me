import DynamoDB = require('aws-sdk/clients/dynamodb');
const dynamodb = new DynamoDB({region: 'us-east-1'});

export function getCall(callid): Promise<any>
{
  const params = {
    Key: {
     callid: {
       S: callid
      }
    },
    TableName: 'answer4me-call-log'
  };

  return dynamodb.getItem(params).promise();
}
