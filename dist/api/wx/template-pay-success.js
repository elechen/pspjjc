"use strict";
exports.__esModule = true;
var wxutils = require("@utils/wxutils");
var wxdefine = require("@define/wxdefine");
var request = require("request");
var template_id = 'DCNkK6xqUujTBSWul00x19JfyOFwxZBo4p0FIb8vMQM';
var color = '#173177';
function handler(req, res) {
    var query = req.body.xml;
    var touser = query['fromusername'];
    wxutils.GetAccessToken(function (token) {
        SendTemplateMessage(touser, token);
    });
    res.send('success');
}
exports.handler = handler;
function SendTemplateMessage(touser, token) {
    var url = wxdefine.API_URL.message_template;
    url = url.replace('$ACCESS_TOKEN', token);
    var order = {
        touser: touser,
        template_id: template_id,
        url: 'pspjjc.chenxiaofeng.vip/sunnyhouse/order?order_id=1111',
        topcolor: color,
        data: GenData()
    };
    console.log('url->', url);
    console.log('order->', order);
    request.post({
        url: url,
        json: order
    }, function (err, httpResponse, body) {
        console.log('SendTemplateMessage Callback', err, body);
    });
}
function GenData() {
    var data = {
        first: { value: '尊敬的101租客，您2019年2月的账单已结清\n', color: color },
        keyword1: { value: '¥645', color: color },
        keyword2: { value: '2564659879813214796416', color: color },
        remark: { value: '\n点击查看详情', color: color }
    };
    return data;
}
