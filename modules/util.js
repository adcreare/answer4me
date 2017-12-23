"use strict";
exports.__esModule = true;
var request = require("request-promise-native");
function httpGet(callurl) {
    return request(callurl);
}
exports.httpGet = httpGet;
function httpGetBinary(callurl) {
    return request(callurl, { encoding: null });
}
exports.httpGetBinary = httpGetBinary;
function httpPost(params) {
    return request.post(params);
}
exports.httpPost = httpPost;
//# sourceMappingURL=util.js.map