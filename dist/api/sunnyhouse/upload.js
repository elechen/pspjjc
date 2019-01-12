"use strict";
exports.__esModule = true;
var multer = require("multer");
var crypto = require("crypto");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/../../upload/');
    },
    filename: function (req, file, cb) {
        //后缀名
        var extName = /\.[^\.]+/.exec(file.originalname);
        var ext = Array.isArray(extName)
            ? extName[0]
            : '';
        cb(null, crypto.randomBytes(16).toString('hex') + ext);
    }
});
var upload = multer({ storage: storage });
function PostHandler() {
    return [
        upload.any(),
        function (req, res) {
            var _a;
            var file = req.files[0];
            var ret = /[^\:]+/.exec(req.headers.referer);
            var scheme = ret ? ret[0] : 'http';
            var host, port;
            _a = req.headers.host.split(':'), host = _a[0], port = _a[1];
            port = port === '80' ? '' : (':' + port);
            var url = scheme + '://' + host + port + '/upload/' + file.filename;
            res.send({ code: 'SUCCESS', url: url });
        }
    ];
}
exports.PostHandler = PostHandler;
