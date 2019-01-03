import { Router, Request, Response } from 'express';
import * as xmlparser from 'express-xml-bodyparser';

import * as authtoken from '@api/wx/authtoken';
import * as textmsg from '@api/wx/textmsg';
import * as subscribe from '@api/wx/subscribe';

export let router = Router();
router.post('/', xmlparser({ trim: false, explicitArray: false }), function (req: Request, res: Response) {
  console.log('body->', req.body);
  let handler = PosHandler(req);
  if (handler) {
    handler(req, res);
  } else {
    res.send('success'); //告诉微信后台，第三方服务器收到了，避免提示异常
  }
});

router.get('/', function (req:Request, res:Response){
  console.log('query->', req.query);
  let handler = GetHandler(req);
  if (handler) {
    handler(req, res);
  } else {
    res.send('success');
  }
});

function GetHandler(req: Request): (req: Request, res: Response) => void {
  let func;
  if (req.query.echostr) {
    func = authtoken.handler;
  }
  return func;
}

function PosHandler(req: Request): (req: Request, res: Response) => void {
  let func;
  if (req.body.xml['msgtype'] == 'text') {
    func = textmsg.handler;
  } else if (req.body.xml['event'] == 'subscribe') {
    func = subscribe.handler;
  }
  return func;
}