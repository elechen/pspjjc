"use strict";
exports.__esModule = true;
var redis = require("redis");
var redis_cli = redis.createClient();
var bodyParser = require("body-parser");
var uuid = require("uuid/v1");
var register = require("@api/sunnyhouse/register");
function PostHandler() {
    return [
        bodyParser.json(),
        function (req, res) {
            var data = req.body;
            var err = CheckContract(data);
            if (err) {
                res.send({ code: 'SUCCESS', msg: err });
            }
            else {
                if (!data.contractid) {
                    data.contractid = uuid();
                    addToNewList(data.contractid);
                    register.addContractToRegister(data.openid, data.contractid);
                }
                var contractid = data.contractid;
                var key = 'sunnyhouse_contract_' + data.contractid;
                redis_cli.set(key, JSON.stringify(data));
                res.send({ code: 'SUCCESS', data: { contractid: contractid } });
            }
        }
    ];
}
exports.PostHandler = PostHandler;
function addToNewList(contractid) {
    var key1 = 'sunnyhouse_contract_newlist';
    redis_cli.get(key1, function (err, reply) {
        if (reply) {
            var lst = JSON.parse(reply);
            var idx = lst.indexOf(contractid);
            if (idx === -1) {
                lst.push(contractid);
                redis_cli.set(key1, JSON.stringify(lst));
            }
        }
    });
}
function GetHandler() {
    return [
        function (req, res) {
            var contractid = req.query.contractid;
            if (!contractid) {
                res.send({ code: 'SUCCESS', msg: 'no contractid' });
            }
            else if (contractid === 'all') {
                redis_cli.keys('sunnyhouse_contract_*', function (err, keys) {
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
                var key = 'sunnyhouse_contract_' + contractid;
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
        function (req, res) {
            var data = req.query;
            if (!data.contractid) {
                res.send({ code: 'SUCCESS', msg: 'no contractid' });
                return;
            }
            delFromNewList(data.contractid);
            var key = 'sunnyhouse_contract_' + data.contractid;
            redis_cli.get(key, function (err, reply) {
                var c = JSON.parse(reply);
                if (c) {
                    register.delContractFromRegister(c.openid, data.contractid);
                    redis_cli.del(key, function (num) {
                        if (num) {
                            res.send({ code: 'SUCCESS' });
                        }
                        else {
                            res.send({ code: 'SUCCESS', msg: 'not find contractid' });
                        }
                    });
                }
                else {
                    res.send({ code: 'SUCCESS', msg: 'not find contractid' });
                }
            });
        }
    ];
}
exports.DelHandler = DelHandler;
function CheckContract(data) {
    if (!data) {
        return 'no register data';
    }
    else {
        var lKey = ['openid', 'rent', 'watercnt', 'electricitycnt', 'fromdate', 'todate'];
        for (var _i = 0, lKey_1 = lKey; _i < lKey_1.length; _i++) {
            var k = lKey_1[_i];
            if (!data[k]) {
                return "no " + k + " data";
            }
        }
    }
}
function PostNewContractHandler() {
    return [
        bodyParser.json(),
        function (req, res) {
            var data = req.body;
            console.log('PostNewContractHandler', data);
            if (!data.contractid) {
                res.send({ code: 'SUCCESS', msg: 'no contractid' });
            }
            else {
                var key_1 = 'sunnyhouse_contract_newlist';
                redis_cli.get(key_1, function (err, reply) {
                    if (reply) {
                        var lst = JSON.parse(reply);
                        if (lst.indexOf(data.contractid) !== -1) {
                            lst.push(data.contractid);
                            redis_cli.set(key_1, JSON.stringify(lst));
                        }
                    }
                    else {
                        redis_cli.set(key_1, JSON.stringify([data.contractid]));
                    }
                    res.send({ code: 'SUCCESS' });
                });
            }
        }
    ];
}
exports.PostNewContractHandler = PostNewContractHandler;
function DelNewContractHandler() {
    return [
        function (req, res) {
            var data = req.query;
            if (!data.contractid) {
                res.send({ code: 'SUCCESS', msg: 'no contractid' });
            }
            else {
                var key_2 = 'sunnyhouse_contract_newlist';
                redis_cli.get(key_2, function (err, reply) {
                    if (reply) {
                        var lst = JSON.parse(reply);
                        var idx = lst.indexOf(data.contractid);
                        if (idx !== -1) {
                            lst.splice(idx);
                            redis_cli.set(key_2, JSON.stringify(lst));
                            res.send({ code: 'SUCCESS' });
                        }
                        else {
                            res.send({ code: 'SUCCESS', msg: 'not in newlist' });
                        }
                    }
                    else {
                        res.send({ code: 'SUCCESS', msg: 'no data' });
                    }
                });
            }
        }
    ];
}
exports.DelNewContractHandler = DelNewContractHandler;
function GetNewContractHandler() {
    return [
        function (req, res) {
            var key = 'sunnyhouse_contract_newlist';
            redis_cli.get(key, function (err, reply) {
                var idList = JSON.parse(reply);
                if (req.query.detail && idList) {
                    var keys = idList.map(function (x) { return 'sunnyhouse_contract_' + x; });
                    redis_cli.mget(keys, function (err1, reply1) {
                        if (reply1) {
                            var jsonList = reply1.map(function (x) { return JSON.parse(x); });
                            res.send({ code: 'SUCCESS', data: jsonList });
                        }
                        else {
                            res.send({ code: 'SUCCESS', msg: 'no result' });
                        }
                    });
                }
                else {
                    res.send({ code: 'SUCCESS', data: JSON.parse(reply) });
                }
            });
        }
    ];
}
exports.GetNewContractHandler = GetNewContractHandler;
function PostConfirmContractHandler() {
    return [
        bodyParser.json(),
        function (req, res) {
            var data = req.body;
            console.log('PostNewContractHandler', data);
            if (!data.contractid) {
                res.send({ code: 'SUCCESS', msg: 'no contractid' });
            }
            else {
                var key_3 = 'sunnyhouse_contract_' + data.contractid;
                redis_cli.get(key_3, function (err, reply) {
                    if (reply) {
                        var jsonObj = JSON.parse(reply);
                        if (!jsonObj.confirm) {
                            jsonObj.confirm = Date.now();
                            redis_cli.set(key_3, JSON.stringify(jsonObj));
                            res.send({ code: 'SUCCESS', data: { confirm: jsonObj.confirm } });
                        }
                        else {
                            res.send({ code: 'SUCCESS', msg: 'already confirmed' });
                        }
                        delFromNewList(data.contractid);
                    }
                });
            }
        }
    ];
}
exports.PostConfirmContractHandler = PostConfirmContractHandler;
function delFromNewList(contractid) {
    var key = 'sunnyhouse_contract_newlist';
    redis_cli.get(key, function (err, reply) {
        if (reply) {
            var lst = JSON.parse(reply);
            var idx = lst.indexOf(contractid);
            if (idx !== -1) {
                lst.splice(idx);
                redis_cli.set(key, JSON.stringify(lst));
            }
        }
    });
}
