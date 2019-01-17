import { Request, Response, RequestHandler } from 'express';
import * as multer from 'multer';
import * as crypto from 'crypto';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/../../upload/');
  },
  filename: function (req, file, cb) {
    //后缀名
    const extName = /\.[^\.]+/.exec(file.originalname);
    const ext = Array.isArray(extName)
      ? extName[0]
      : '';
    cb(null, crypto.randomBytes(16).toString('hex') + ext);
  }
});
const upload = multer({ storage });

export function PostHandler(): RequestHandler[] {
  return [
    upload.any(),
    function (req: Request, res: Response) {
      const file = req.files[0];
      let ret = /[^\:]+/.exec(req.headers.referer);
      let scheme = ret ? ret[0] : 'http';
      let host: string, port: string;
      [host, port] = req.headers.host.split(':');
      port = (!port || port === '80') ? '' : (':' + port);
      const url = scheme + '://' + host + port + '/upload/' + file.filename;
      res.send({ code: 'SUCCESS', data: { url } });
    }
  ];
}