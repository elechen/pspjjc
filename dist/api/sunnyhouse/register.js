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
                delete data.code;
                var key = 'sunnyhouse_register_' + data.openid;
                redis_cli.set(key, JSON.stringify(data));
                res.send({ code: 'SUCCESS' });
            }
        }
    ];
}
exports.PostHandler = PostHandler;
function DelHandler() {
    return [
        function (req, res) {
            var data = req.query;
            if (!data.openid) {
                res.send({ code: 'SUCCESS', msg: 'no openid' });
                return;
            }
            var key = 'sunnyhouse_register_' + data.openid;
            redis_cli.del(key, function (num) {
                if (num) {
                    res.send({ code: 'SUCCESS' });
                }
                else {
                    res.send({ code: 'SUCCESS', msg: 'not find openid' });
                }
            });
        }
    ];
}
exports.DelHandler = DelHandler;
function PostStateHandler() {
    return [
        bodyParser.json(),
        function (req, res) {
            var data = req.body;
            var key = 'sunnyhouse_register_' + data.openid;
            redis_cli.get(key, function (err, reply) {
                if (reply) {
                    var info = JSON.parse(reply);
                    if (info) {
                        info.state = data.state;
                        redis_cli.set(key, JSON.stringify(info));
                        res.send({ code: 'SUCCESS' });
                    }
                    else {
                        res.send({ code: 'SUCCESS', msg: 'parse error' });
                    }
                }
                else {
                    res.send({ code: 'SUCCESS', msg: 'no data' });
                }
            });
        }
    ];
}
exports.PostStateHandler = PostStateHandler;
function PostContractHandler() {
    return [
        bodyParser.json(),
        function (req, res) {
            var data = req.body;
            var key = 'sunnyhouse_register_' + data.openid;
            redis_cli.get(key, function (err, reply) {
                if (reply) {
                    var info = JSON.parse(reply);
                    if (!info.contractid) {
                        info.contractid = [data.contractid];
                    }
                    else if (info.contractid.indexOf(data.contractid) === -1) {
                        info.contractid.push(data.contractid);
                    }
                    redis_cli.set(key, JSON.stringify(info));
                    res.send({ code: 'SUCCESS' });
                }
                else {
                    res.send({ code: 'SUCCESS', msg: 'no data' });
                }
            });
        }
    ];
}
exports.PostContractHandler = PostContractHandler;
function DelContractHandler() {
    return [
        function (req, res) {
            var data = req.query;
            if (!data.openid) {
                res.send({ code: 'SUCCESS', msg: 'no openid' });
                return;
            }
            if (!data.contractid) {
                res.send({ code: 'SUCCESS', msg: 'no contractid' });
                return;
            }
            var key = 'sunnyhouse_register_' + data.openid;
            redis_cli.get(key, function (err, reply) {
                if (reply) {
                    var info = JSON.parse(reply);
                    if (!info.contractid) {
                        res.send({ code: 'SUCCESS', msg: 'no find contractid' });
                        return;
                    }
                    var idx = info.contractid.indexOf(data.contractid);
                    if (idx !== -1) {
                        info.contractid.splice(idx);
                        redis_cli.set(key, JSON.stringify(info));
                        res.send({ code: 'SUCCESS' });
                    }
                    else {
                        res.send({ code: 'SUCCESS', msg: 'not find contractid' });
                    }
                }
                else {
                    res.send({ code: 'SUCCESS', msg: 'no data' });
                }
            });
        }
    ];
}
exports.DelContractHandler = DelContractHandler;
function PostOrderHandler() {
    return [
        bodyParser.json(),
        function (req, res) {
            var data = req.body;
            var key = 'sunnyhouse_register_' + data.openid;
            redis_cli.get(key, function (err, reply) {
                if (reply) {
                    var info = JSON.parse(reply);
                    if (!info.orderid) {
                        info.orderid = [data.orderid];
                    }
                    else if (info.orderid.indexOf(data.orderid) !== -1) {
                        info.orderid.push(data.orderid);
                    }
                    redis_cli.set(key, JSON.stringify(info));
                    res.send({ code: 'SUCCESS' });
                }
                else {
                    res.send({ code: 'SUCCESS', msg: 'no data' });
                }
            });
        }
    ];
}
exports.PostOrderHandler = PostOrderHandler;
function DelOrderHandler() {
    return [
        bodyParser.json(),
        function (req, res) {
            var data = req.body;
            if (!data.openid) {
                res.send({ code: 'SUCCESS', msg: 'no openid' });
                return;
            }
            if (!data.orderid) {
                res.send({ code: 'SUCCESS', msg: 'no orderid' });
                return;
            }
            var key = 'sunnyhouse_register_' + data.openid;
            redis_cli.get(key, function (err, reply) {
                if (reply) {
                    var info = JSON.parse(reply);
                    if (!info.orderid) {
                        res.send({ code: 'SUCCESS', msg: 'no find orderid' });
                        return;
                    }
                    var idx = info.orderid.indexOf(data.orderid);
                    if (idx !== -1) {
                        info.orderid.splice(idx);
                        redis_cli.set(key, JSON.stringify(info));
                        res.send({ code: 'SUCCESS' });
                    }
                    else {
                        res.send({ code: 'SUCCESS', msg: 'not find orderid' });
                    }
                }
                else {
                    res.send({ code: 'SUCCESS', msg: 'no data' });
                }
            });
        }
    ];
}
exports.DelOrderHandler = DelOrderHandler;
function GetHandler() {
    return [
        function (req, res) {
            var openid = req.query.openid;
            if (!openid) {
                res.send({ code: 'SUCCESS', msg: 'no openid' });
            }
            else if (openid === 'all') {
                redis_cli.keys('sunnyhouse_register_*', function (err, keys) {
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
                var key = 'sunnyhouse_register_' + openid;
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
        var lKey = ['openid', 'headimgurl', 'id', 'name', 'phone', 'code', 'idimgurl'];
        for (var _i = 0, lKey_1 = lKey; _i < lKey_1.length; _i++) {
            var k = lKey_1[_i];
            if (!data[k]) {
                return "no " + k + " data";
            }
        }
    }
}
function addContractToRegister(openid, contractid) {
    var key = 'sunnyhouse_register_' + openid;
    redis_cli.get(key, function (err, reply) {
        if (reply) {
            var info = JSON.parse(reply);
            if (!info.contractid) {
                info.contractid = [contractid];
            }
            else if (info.contractid.indexOf(contractid) === -1) {
                info.contractid.push(contractid);
            }
            redis_cli.set(key, JSON.stringify(info));
        }
    });
}
exports.addContractToRegister = addContractToRegister;
function delContractFromRegister(openid, contractid) {
    var key = 'sunnyhouse_register_' + openid;
    redis_cli.get(key, function (err, reply) {
        if (reply) {
            var info = JSON.parse(reply);
            if (info && info.contractid) {
                var idx = info.contractid.indexOf(contractid);
                if (idx !== -1) {
                    info.contractid.splice(idx);
                    redis_cli.set(key, JSON.stringify(info));
                }
            }
        }
    });
}
exports.delContractFromRegister = delContractFromRegister;
