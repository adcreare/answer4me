"use strict";
exports.__esModule = true;
var util = require("./util");
function postMessage(slackurl, messageObject) {
    var params = {
        method: 'POST',
        uri: slackurl,
        json: { text: messageObject }
    };
    return util.httpPost(params);
}
exports.postMessage = postMessage;
//# sourceMappingURL=slack.js.map