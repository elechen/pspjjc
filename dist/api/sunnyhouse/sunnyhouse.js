"use strict";
exports.__esModule = true;
var express_1 = require("express");
var login = require("@api/sunnyhouse/login");
var upload = require("@api/sunnyhouse/upload");
var register = require("@api/sunnyhouse/register");
var contract = require("@api/sunnyhouse/contract");
var order = require("@api/sunnyhouse/order");
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
exports.router.post('/register/state', register.PostStateHandler());
exports.router.post('/register/contract', register.PostContractHandler());
exports.router["delete"]('/register/contract', register.DelContractHandler());
exports.router.post('/register/order', register.PostOrderHandler());
exports.router["delete"]('/register/order', register.DelOrderHandler());
exports.router.post('/register', register.PostHandler());
exports.router.get('/register', register.GetHandler());
exports.router["delete"]('/register', register.DelHandler());
exports.router.post('/contract/new', contract.PostNewContractHandler());
exports.router.get('/contract/new', contract.GetNewContractHandler());
exports.router["delete"]('/contract/new', contract.DelNewContractHandler());
exports.router.post('/contract/confirm', contract.PostConfirmContractHandler());
exports.router.post('/contract', contract.PostHandler());
exports.router.get('/contract', contract.GetHandler());
exports.router["delete"]('/contract', contract.DelHandler());
exports.router.post('/order', order.PostHandler());
exports.router.get('/order', order.GetHandler());
exports.router["delete"]('/order', order.DelHandler());
function GetHandler(req) {
    var func = login.handler;
    return func;
}
