"use strict";
exports.__esModule = true;
var wxutils = require("@utils/wxutils");
var wxdefine = require("@define/wxdefine");
var request = require("request");
var template_id = 'GNEosc4tROty2Hl-0x4LOuXd6JHnHFDu3EF9PJ1Cd3k';
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
        first: { value: '尊敬的101租客，这是您2019年2月的账单\n', color: color },
        keyword1: { value: '¥500', color: color },
        keyword2: { value: '¥10', color: color },
        keyword3: { value: '¥100', color: color },
        keyword4: { value: '¥35', color: color },
        keyword5: { value: '¥645', color: color },
        remark: { value: '\n点击查看详情，支持信用卡支付', color: color }
    };
    return data;
}
