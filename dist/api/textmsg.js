"use strict";
exports.__esModule = true;
var express_1 = require("express");
var xmlparser = require("express-xml-bodyparser");
var wxutils = require("@utils/wxutils");
exports.router = express_1.Router();
exports.router.post('/', xmlparser({ trim: false, explicitArray: false }), function (req, res) {
    console.log('args->', req.body);
    res.setHeader('Content-Type', 'text/xml');
    res.send(genResponseXml(req.body.xml));
});
function genResponseXml(query) {
    var obj = {
        'ToUserName': query['fromusername'],
        'FromUserName': query['tousername'],
        'CreateTime': Math.floor(Date.now() / 1000),
        'MsgType': 'text',
        'Conten': query['content']
    };
    return wxutils.GenXml(obj);
}
