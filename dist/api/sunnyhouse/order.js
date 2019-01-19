"use strict";
exports.__esModule = true;
var redis = require("redis");
var redis_cli = redis.createClient();
var bodyParser = require("body-parser");
var uuid = require("uuid/v1");
function PostHandler() {
    return [
        bodyParser.json(),
        function (req, res) {
            var data = req.body;
            var err = CheckOrder(data);
            if (err) {
                res.send({ code: 'SUCCESS', msg: err });
            }
            else {
                if (!data.orderid) {
                    data.orderid = uuid();
                }
                var orderid = data.orderid;
                var key = 'sunnyhouse_order_' + data.orderid;
                redis_cli.set(key, JSON.stringify(data));
                res.send({ code: 'SUCCESS', data: { orderid: orderid } });
            }
        }
    ];
}
exports.PostHandler = PostHandler;
function GetHandler() {
    return [
        function (req, res) {
            var orderid = req.query.orderid;
            if (!orderid) {
                res.send({ code: 'SUCCESS', msg: 'no orderid' });
            }
            else if (orderid === 'all') {
                redis_cli.keys('sunnyhouse_order_*', function (err, keys) {
                    if (!keys) {
                        res.send({ code: 'SUCCESS', msg: 'no keys' });
                        return;
                    }
                    redis_cli.mget(keys, function (err, reply) {
                        if (reply) {
                            var jsonList = reply.map(function (x) { return JSON.parse(x); });
                            res.send({ code: 'SUCCESS', data: jsonList });
                        }
                        else {
                            res.send({ code: 'SUCCESS', msg: 'no result' });
                        }
                    });
                });
            }
            else {
                var key = 'sunnyhouse_order_' + orderid;
                redis_cli.get(key, function (err, reply) {
                    res.send({ code: 'SUCCESS', data: JSON.parse(reply) });
                });
            }
        }
    ];
}
exports.GetHandler = GetHandler;
function DelHandler() {
    return [
        bodyParser.json(),
        function (req, res) {
            var data = req.body;
            if (!data.orderid) {
                res.send({ code: 'SUCCESS', msg: 'no orderid' });
                return;
            }
            var key = 'sunnyhouse_order_' + data.orderid;
            redis_cli.del(key, function (num) {
                if (num) {
                    res.send({ code: 'SUCCESS' });
                }
                else {
                    res.send({ code: 'SUCCESS', msg: 'not find orderid' });
                }
            });
        }
    ];
}
exports.DelHandler = DelHandler;
function CheckOrder(data) {
    if (!data) {
        return 'no order data';
    }
    else {
        var lKey = ['openid', 'room',
            'rent', 'deposit', 'wifi', 'trash', 'water', 'electricity', 'total',
            'watercnt', 'electricitycnt', 'lastwatercnt', 'lastelectricitycnt',
            'fromdate', 'todate'];
        for (var _i = 0, lKey_1 = lKey; _i < lKey_1.length; _i++) {
            var k = lKey_1[_i];
            if (data[k] === undefined) {
                return "no " + k + " data";
            }
        }
    }
}
