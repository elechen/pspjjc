"use strict";
exports.__esModule = true;
var wxutils = require("@utils/wxutils");
var template_order_1 = require("@api/wx/template-order");
var template_pay_success_1 = require("@api/wx/template-pay-success");
function handler(req, res) {
    res.setHeader('Content-Type', 'text/xml');
    if (req.body.xml['content'] === '测试账单') {
        template_order_1.handler(req, res);
    }
    else if (req.body.xml['content'] === '支付成功') {
        template_pay_success_1.handler(req, res);
    }
    else {
        res.send(genResponseXml(req.body.xml));
    }
}
exports.handler = handler;
function genResponseXml(query) {
    var obj = {
        'ToUserName': query['fromusername'],
        'FromUserName': query['tousername'],
        'CreateTime': Math.floor(Date.now() / 1000),
        'MsgType': 'text',
        'Content': query['content']
    };
    return wxutils.GenXml(obj);
}
