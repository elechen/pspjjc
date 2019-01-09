"use strict";
exports.__esModule = true;
var wxdefine = require("@define/wxdefine");
var request = require("request");
function GenXml(object) {
    var xml = '<xml>';
    for (var key in object) {
        var element = object[key];
        var line = "<" + key + "><![CDATA[" + element + "]]></" + key + ">";
        xml += line;
    }
    xml += '</xml>';
    return xml;
}
exports.GenXml = GenXml;
var TokenInfo;
function GetAccessToken(cb) {
    if (TokenInfo && TokenInfo.expires_time > Date.now()) {
        cb(TokenInfo.access_token);
    }
    else {
        var url = wxdefine.API_URL.token;
        request.get(url, null, function (error, response, body) {
            var info = JSON.parse(body);
            console.log('info=>', info);
            if (info['errcode']) {
                //do nothing
            }
            else {
                TokenInfo = { expires_time: 0, access_token: '' };
                TokenInfo.expires_time = info['expires_in'] * 1000 + Date.now();
                TokenInfo.expires_time -= 60 * 1000; //提前60秒过期，重新申请
                TokenInfo.access_token = info['access_token'];
                cb(TokenInfo.access_token);
            }
        });
    }
}
exports.GetAccessToken = GetAccessToken;
