"use strict";
exports.__esModule = true;
var wxutils = require("@utils/wxutils");
function handler(req, res) {
    res.setHeader('Content-Type', 'text/xml');
    res.send(genResponseXml(req.body.xml));
}
exports.handler = handler;
function genResponseXml(query) {
    var obj = {
        'ToUserName': query['fromusername'],
        'FromUserName': query['tousername'],
        'CreateTime': Math.floor(Date.now() / 1000),
        'MsgType': 'text',
        'Content': '感谢您的关注'
    };
    return wxutils.GenXml(obj);
}
