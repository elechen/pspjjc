"use strict";
exports.__esModule = true;
var express_1 = require("express");
exports.router = express_1.Router();
var unifiedorder = require("@api/pay/unifiedorder");
var notify = require("@api/pay/notify");
exports.router.get('/unifiedorder', unifiedorder.GetHandler());
exports.router.post('/notify', notify.PostHandler());
