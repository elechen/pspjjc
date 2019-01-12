"use strict";
exports.__esModule = true;
var express_1 = require("express");
var login = require("@api/sunnyhouse/login");
var upload = require("@api/sunnyhouse/upload");
var register = require("@api/sunnyhouse/register");
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
exports.router.get('/user', function (req, res) {
    login.user(req, res);
});
exports.router.post('/upload', upload.PostHandler());
exports.router.post('/register', register.PostHandler());
exports.router.get('/register', register.GetHandler());
function GetHandler(req) {
    var func = login.handler;
    return func;
}
