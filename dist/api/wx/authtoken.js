"use strict";
exports.__esModule = true;
var crypto = require("crypto");
function handler(req, res) {
    var token = process.env.WX_TOKEN;
    var args = [req.query.nonce, req.query.timestamp, token];
    args.sort();
    var argsSignature = sha1(args.join(''));
    console.log('args->', req.query);
    console.log('argsSignature->', argsSignature);
    var echostr = req.query.echostr;
    if (req.query.signature === argsSignature) {
        res.send(echostr);
        console.log('verify token success');
    }
    else {
        res.send('fail');
        console.log('verify token failed');
    }
}
exports.handler = handler;
function sha1(argsStr) {
    var hash = crypto.createHash('sha1');
    return hash.update(argsStr, 'utf8').digest('hex');
}
