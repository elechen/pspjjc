"use strict";
exports.__esModule = true;
var express_1 = require("express");
var login = require("@api/sunnyhouse/login");
exports.router = express_1.Router();
exports.router.get('/', function (req, res) {
    var handler = GetHandler(req);
    if (handler) {
        handler(req, res);
    }
    else {
        res.send('success');
    }
});
exports.router.get('/auth2callback', function (req, res) {
    login.auth2callback(req, res);
});
function GetHandler(req) {
    var func = login.handler;
    return func;
}
