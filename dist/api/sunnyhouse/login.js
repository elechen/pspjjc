"use strict";
exports.__esModule = true;
var crypto = require("crypto");
var wxdefine = require("@define/wxdefine");
var redisdefine = require("@define/redisdefine");
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
            console.log('auth2callback-AxiosResponse:', response.data);
            var data = response.data;
            req.session.uid = data.openid;
            _SaveAccessToken(data);
            GetUserInfo(req, res, data);
        })["catch"](function (error) {
            console.log(error);
            res.send('success');
        });
    }
}
exports.auth2callback = auth2callback;
function user(req, res) {
    var sid = req.query.sid;
    if (sid) {
        GetUidBySid(sid, function (uid) {
            if (uid) {
                _GetUserInfo(uid, function (user) {
                    if (user) {
                        res.send({ code: 'SUCCESS', data: user });
                    }
                    else {
                        res.send({ code: 'SUCCESS', msg: "no user(user not found)" });
                    }
                });
            }
            else {
                res.send({ code: 'SUCCESS', msg: "no user(uid not found)" });
            }
        });
    }
    else {
        res.send({ code: 'SUCCESS', msg: "no user(sid not found)" });
    }
}
exports.user = user;
function _SaveAccessToken(data) {
    var uid = data.openid;
    var key = 'accesstoken_' + uid;
    redis_cli.set(key, JSON.stringify(data));
}
function _GetAccessToken(uid, cb) {
    var key = 'accesstoken_' + uid;
    redis_cli.get(key, function (error, reply) {
        cb(JSON.parse(reply));
    });
}
function RefreshAceessToken(req, res) {
    var refresh_token = '';
    var url = wxdefine.API_URL.oauth2_refreshtoken.replace('$REFRESH_TOKEN', refresh_token);
    axios_1["default"].get(url).then(function (response) {
        console.log('RefreshAceessToken-AxiosResponse', response.data);
        var data = response.data;
        req.session.uid = data.openid;
        _SaveAccessToken(data);
    })["catch"](function (error) {
        console.log(error);
    });
}
exports.RefreshAceessToken = RefreshAceessToken;
function GetUserInfo(req, res, data) {
    var openid = data.openid;
    var access_token = data.access_token;
    var url = wxdefine.API_URL.userinfo.replace('$ACCESS_TOKEN', access_token);
    url = url.replace('$OPENID', openid);
    axios_1["default"].get(url).then(function (response) {
        console.log('GetUserInfoAxiosResponse', response.data);
        var data = response.data;
        _SaveUserInfo(data);
        var sid = GenUniqueSid();
        UpdateSid2Uid(sid, data.openid);
        RedirectToSunnyHouse({ sid: sid }, req, res);
    })["catch"](function (error) {
        console.log(error);
    });
}
exports.GetUserInfo = GetUserInfo;
function _SaveUserInfo(data) {
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
            if (data && data.openid === uid) {
                var sid = GenUniqueSid();
                UpdateSid2Uid(sid, uid);
                RedirectToSunnyHouse({ sid: sid }, req, res);
            }
            else {
                wxlogin(req, res);
            }
        });
    }
    else {
        wxlogin(req, res);
    }
}
function RedirectToSunnyHouse(query, req, res) {
    var queryString = GenQueryString(query);
    res.redirect('http://sunnyhouse.chenxiaofeng.vip/?' + queryString);
}
function GenUniqueSid() {
    return crypto.randomBytes(16).toString('hex');
}
function GetUidBySid(sid, cb) {
    var key = 'sid2uid_' + sid;
    redis_cli.get(key, function (error, reply) {
        cb(reply);
        if (reply) {
            UpdateSid2Uid(sid, reply);
        }
    });
}
function UpdateSid2Uid(sid, uid) {
    var duration = 10 * 60; // sid有效期为10分钟
    var key = 'sid2uid_' + sid;
    redis_cli.set(key, uid, redisdefine.SET_MODE.EX, duration);
}
function GenQueryString(obj) {
    var queryString = Object.keys(obj).map(function (key) {
        return key + '=' + encodeURIComponent(obj[key]);
    }).join('&');
    return queryString;
}
function isvalid(ui) {
    return true;
}
