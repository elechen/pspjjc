"use strict";
exports.__esModule = true;
require('module-alias/register');
var express = require("express");
var session = require("express-session");
var cors = require("cors");
var connectRedis = require("connect-redis");
var RedisStore = connectRedis(session);
var wx_1 = require("@api/wx/wx");
var sunnyhouse_1 = require("@api/sunnyhouse/sunnyhouse");
var pay_1 = require("@api/pay/pay");
var options = {
    host: 'localhost',
    port: 6379,
    logErrors: function (error) { return console.warn('redis log', error); }
};
var app = express();
var expires = 10 * 60 * 1000;
app.use(session({
    name: 'pspjjc',
    secret: 'gdufs',
    resave: false,
    saveUninitialized: false,
    store: new RedisStore(options),
    cookie: { expires: new Date(Date.now() + expires), maxAge: expires }
}));
app.use('/upload', express.static(__dirname + '/upload'));
// 跨域调用
var whitelist = ['http://localhost:8001', 'http://sunnyhouse.chenxiaofeng.vip'];
var corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS' + origin));
        }
    }
};
app.use(cors(corsOptions));
// app.use(cors());
app.use('/wx', wx_1.router);
app.use('/sunnyhouse', sunnyhouse_1.router);
app.use('/pay', pay_1.router);
app.listen(8000, function () {
    console.log('app is running on port:8000');
});
