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
var redis = require("redis");
var redis_cli = redis.createClient();
var axios_1 = require("axios");
var wxutils = require("@utils/wxutils");
var wxdefine = require("@define/wxdefine");
var xml2js = require("xml2js");
function GetHandler() {
    return [
        function (req, res) {
            var data = req.query;
            var err = CheckOrder(data);
            if (err) {
                res.send({ code: 'FAIL', msg: err });
                return;
            }
            var defaultData = GetDefaultParams(req);
            data = __assign({}, defaultData, data);
            var url = wxdefine.API_URL.unifiedorder;
            data.sign = wxutils.CalSign(data);
            console.log('xml->', wxutils.GenXml(data));
            axios_1["default"].post(url, wxutils.GenXml(data)).then(function (res1) {
                console.log('PostHandler Res->', res1.data);
                xml2js.parseString(res1.data, { explicitArray: false }, function (err, xmlData) {
                    var data = xmlData['xml'];
                    console.log('xml2js->', data);
                    if (data.return_code === 'SUCCESS') {
                        if (data.result_code === 'SUCCESS') {
                            var appId = wxdefine.APPID;
                            var timeStamp = Math.ceil(Date.now() / 1000).toString();
                            var nonceStr = Math.random().toString().substr(2, 8);
                            var packageInfo = 'prepay_id=' + data.prepay_id;
                            var prepay = { appId: appId, timeStamp: timeStamp, nonceStr: nonceStr, package: packageInfo, signType: 'MD5' };
                            prepay.paySign = wxutils.CalSign(prepay);
                            res.send({ code: 'SUCCESS', data: prepay });
                        }
                        else {
                            res.send({ code: 'FAIL', msg: 'err_code:' + data.err_code });
                        }
                    }
                    else {
                        res.send({ code: 'FAIL', msg: data.return_msg });
                    }
                });
            });
        }
    ];
}
exports.GetHandler = GetHandler;
function GetDefaultParams(req) {
    return {
        appid: wxdefine.APPID,
        mch_id: wxdefine.MCHID,
        nonce_str: Math.random().toString().substr(2, 8),
        // sign?: string;
        // body: string; // 商品简单描述
        // out_trade_no: string;
        // total_fee: number;
        spbill_create_ip: GetRealIP(req),
        notify_url: 'http://pspjjc.chenxiaofeng.vip/pay/notify',
        trade_type: wxdefine.TRADE_TYPE.JSAPI
    };
}
function GetRealIP(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.remoteAddress || '';
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0];
    }
    ip = ip.substr(ip.lastIndexOf(':') + 1, ip.length);
    ip = '116.22.32.151';
    console.log("GetRealIP:" + ip);
    return ip;
}
function CheckOrder(data) {
    if (!data) {
        return 'no order data';
    }
    else {
        var lKey = ['openid', 'body', 'out_trade_no', 'total_fee'];
        for (var _i = 0, lKey_1 = lKey; _i < lKey_1.length; _i++) {
            var k = lKey_1[_i];
            if (!data[k]) {
                return "no " + k + " data";
            }
        }
    }
}
