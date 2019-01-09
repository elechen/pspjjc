"use strict";
exports.__esModule = true;
var express_1 = require("express");
var xmlparser = require("express-xml-bodyparser");
var authtoken = require("@api/wx/authtoken");
var textmsg = require("@api/wx/textmsg");
var subscribe = require("@api/wx/subscribe");
exports.router = express_1.Router();
exports.router.post('/', xmlparser({ trim: false, explicitArray: false }), function (req, res) {
    console.log('body->', req.body);
    var handler = PosHandler(req);
    if (handler) {
        handler(req, res);
    }
    else {
        res.send('success'); //告诉微信后台，第三方服务器收到了，避免提示异常
    }
});
exports.router.get('/', function (req, res) {
    console.log('query->', req.query);
    var handler = GetHandler(req);
    if (handler) {
        handler(req, res);
    }
    else {
        res.send('success');
    }
});
function GetHandler(req) {
    var func;
    if (req.query.echostr) {
        func = authtoken.handler;
    }
    return func;
}
function PosHandler(req) {
    var func;
    if (req.body.xml['msgtype'] == 'text') {
        func = textmsg.handler;
    }
    else if (req.body.xml['event'] == 'subscribe') {
        func = subscribe.handler;
    }
    return func;
}
