"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var wxdefine = require("@define/wxdefine");
var request = require("request");
var crypto = require("crypto");
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
function CalSign(data) {
    var keys = Object.keys(data);
    keys.sort();
    var kv = keys.map(function (x) { return x + "=" + data[x]; });
    var str = kv.join('&') + '&key=' + wxdefine.MCHKEY;
    var md5 = crypto.createHash('md5');
    var sign = md5.update(str).digest('hex').toUpperCase();
    console.log(str, sign);
    return sign;
}
exports.CalSign = CalSign;
function CheckSign(data) {
    if (!data) {
        return false;
    }
    else {
        var params = __assign({}, data);
        delete params.sign;
        var sign = CalSign(params);
        return sign === data.sign;
    }
}
exports.CheckSign = CheckSign;
