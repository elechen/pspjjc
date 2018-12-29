import { Router, Request, Response } from 'express';
import * as xmlparser from 'express-xml-bodyparser';

import * as authtoken from '@api/mp/authtoken';
import * as textmsg from '@api/mp/textmsg';
import * as subscribe from '@api/mp/subscribe';

export let router = Router();
router.post('/', xmlparser({ trim: false, explicitArray: false }), function (req: Request, res: Response) {
  console.log('args->', req.body);
  let handler = GetHandler(req);
  if (handler) {
    handler(req, res);
  } else {
    res.send('success'); //告诉微信后台，第三方服务器收到了，避免提示异常
  }
});

function GetHandler(req: Request): (req: Request, res: Response) => void {
  let func;
  if (req.query['echostr']) {
    func = authtoken.handler;
  } else if (req.body.xml['msgtype'] == 'text') {
    func = textmsg.handler;
  } else if (req.body.xml['event'] == 'subscribe') {
    func = subscribe.handler;
  }
  return func;
}