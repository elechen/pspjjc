"use strict";
exports.__esModule = true;
var redis = require("redis");
var redis_cli = redis.createClient();
var bodyParser = require("body-parser");
function PostHandler() {
    return [
        bodyParser.json(),
        function (req, res) {
            var data = req.body;
            var err = CheckRegister(data);
            if (err) {
                res.send({ code: 'SUCCESS', msg: err });
            }
            else {
                var key = 'sunnyhouse_regiser_' + data.openid;
                redis_cli.set(key, JSON.stringify(data));
                res.send({ code: 'SUCCESS' });
            }
        }
    ];
}
exports.PostHandler = PostHandler;
function GetHandler() {
    return [
        function (req, res) {
            var openid = req.query.openid;
            if (!openid) {
                res.send({ code: 'SUCCESS', msg: 'no openid' });
            }
            else if (openid === 'all') {
                redis_cli.keys('sunnyhouse_regiser_*', function (err, keys) {
                    if (!keys) {
                        res.send({ code: 'SUCCESS', msg: 'no keys' });
                        return;
                    }
                    redis_cli.mget(keys, function (err1, reply) {
                        if (reply) {
                            var jsonList_1 = [];
                            reply.forEach(function (element) {
                                jsonList_1.push(JSON.parse(element));
                            });
                            res.send({ code: 'SUCCESS', data: jsonList_1 });
                        }
                        else {
                            res.send({ code: 'SUCCESS', msg: 'no result' });
                        }
                    });
                });
            }
            else {
                var key = 'sunnyhouse_regiser_' + openid;
                redis_cli.get(key, function (err, reply) {
                    res.send({ code: 'SUCCESS', data: JSON.parse(reply) });
                });
            }
        }
    ];
}
exports.GetHandler = GetHandler;
function CheckRegister(data) {
    if (!data) {
        return 'no register data';
    }
    else {
        var lKey = ['openid', 'id', 'name', 'phone', 'code', 'room', 'idimgurl'];
        for (var _i = 0, lKey_1 = lKey; _i < lKey_1.length; _i++) {
            var k = lKey_1[_i];
            if (!data[k]) {
                return "no " + k + " data";
            }
        }
    }
}
