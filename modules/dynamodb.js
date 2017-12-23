"use strict";
exports.__esModule = true;
var DynamoDB = require("aws-sdk/clients/dynamodb");
var dynamodb = new DynamoDB({ region: 'us-east-1' });
function getCall(callid) {
    var params = {
        Key: {
            callid: {
                S: callid
            }
        },
        TableName: 'answer4me-call-log'
    };
    return dynamodb.getItem(params).promise();
}
exports.getCall = getCall;
//# sourceMappingURL=dynamodb.js.map