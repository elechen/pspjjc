"use strict";
exports.__esModule = true;
var redis = require("redis");
var redis_cli = redis.createClient();
var xmlparser = require("express-xml-bodyparser");
var wxutils = require("@utils/wxutils");
function PostHandler() {
    return [
        xmlparser({ trim: false, explicitArray: false }),
        function (req, res) {
            var data = req.body.xml;
            var bPass = wxutils.CheckSign(data);
            if (bPass) {
                var orderid = data.out_trade_no;
                var key_1 = 'sunnyhouse_order_' + orderid;
                redis_cli.get(key_1, function (err, reply) {
                    if (reply) {
                        var c = JSON.parse(reply);
                        c.finishedtime = data.time_end;
                        c.transaction_id = data.transaction_id;
                        redis_cli.set(key_1, JSON.stringify(c));
                    }
                });
            }
            var key = 'sunnyhouse_wx_pay_notify_' + Date.now().toString();
            redis_cli.set(key, JSON.stringify(data));
            res.send(wxutils.GenXml({ return_code: 'SUCCESS', return_msg: 'OK' }));
            console.log(data);
        }
    ];
}
exports.PostHandler = PostHandler;
