"use strict";
exports.__esModule = true;
var wxdefine = require("@define/wxdefine");
var axios_1 = require("axios");
var redis = require("redis");
var redis_cli = redis.createClient();
function handler(req, res) {
    console.log('login-req.query:', JSON.stringify(req.query));
    var uid = req.session.uid;
    if (!uid) {
        wxlogin(req, res);
    }
    else {
        uidlogin(uid, req, res);
    }
}
exports.handler = handler;
function wxlogin(req, res) {
    var callback = encodeURIComponent('http://pspjjc.chenxiaofeng.vip/sunnyhouse/auth2callback');
    var outh2uri = wxdefine.API_URL.oauth2_code.replace('$REDIREC_URI', callback);
    res.redirect(outh2uri);
}
function auth2callback(req, res) {
    if (req.query.code) {
        var url = wxdefine.API_URL.oauth2_accesstoken.replace('$CODE', req.query.code);
        axios_1["default"].get(url).then(function (response) {
            console.log('auth2callback-AxiosResponse:', response);
            var data = response.data;
            console.log(data);
            req.session.uid = data.openid;
            SaveAccessToken(data);
            GetAccessToken(data.openid, function (data) {
                GetUserInfo(req, res);
                _GetUserInfo(data.openid, function (data) {
                    res.send('_GetUserInfo:' + JSON.stringify(data));
                });
            });
        })["catch"](function (error) {
            console.log(error);
            res.send('success');
        });
    }
}
exports.auth2callback = auth2callback;
function SaveAccessToken(data) {
    var uid = data.openid;
    var key = 'accesstoken_' + uid;
    redis_cli.set(key, JSON.stringify(data));
}
function GetAccessToken(uid, cb) {
    var key = 'accesstoken_' + uid;
    redis_cli.get(key, function (error, reply) {
        cb(JSON.parse(reply));
    });
}
function RefreshAceessToken(req, res) {
    var refresh_token = '';
    var url = wxdefine.API_URL.oauth2_refreshtoken.replace('$REFRESH_TOKEN', refresh_token);
    axios_1["default"].get(url).then(function (response) {
        console.log('AxiosResponse', response);
        var data = response.data;
        console.log(data);
        req.session.uid = data.openid;
        SaveAccessToken(data);
    })["catch"](function (error) {
        console.log(error);
    });
}
exports.RefreshAceessToken = RefreshAceessToken;
function GetUserInfo(req, res) {
    var openid = '';
    var access_token = '';
    var url = wxdefine.API_URL.userinfo.replace('$ACCESS_TOKEN', access_token);
    url = url.replace('$OPENID', openid);
    axios_1["default"].get(url).then(function (response) {
        console.log('AxiosResponse', response);
        var data = response.data;
        console.log(data);
        SaveUserInfo(data);
    })["catch"](function (error) {
        console.log(error);
    });
}
exports.GetUserInfo = GetUserInfo;
function SaveUserInfo(data) {
    var uid = data.openid;
    var key = 'userinfo_' + uid;
    redis_cli.set(key, JSON.stringify(data));
}
function _GetUserInfo(uid, cb) {
    var key = 'userinfo_' + uid;
    redis_cli.get(key, function (error, reply) {
        cb(JSON.parse(reply));
    });
}
function uidlogin(uid, req, res) {
    if (isvalid(uid)) {
        _GetUserInfo(uid, function (data) {
            res.send('uidlogin_GetUserInfo:' + JSON.stringify(data));
        });
    }
    else {
        wxlogin(req, res);
    }
}
function isvalid(ui) {
    return true;
}
