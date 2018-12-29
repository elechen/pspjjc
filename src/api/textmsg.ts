import { Router, Request, Response } from 'express';
import * as xmlparser from 'express-xml-bodyparser';

import * as wxutils from '@utils/wxutils';

export let router = Router();
router.post('/', xmlparser({ trim: false, explicitArray: false }), function (req: Request, res: Response) {
  console.log('args->', req.body);
  res.setHeader('Content-Type', 'text/xml');
  res.send(genResponseXml(req.body.xml));
})

function genResponseXml(query: {}): string {
  let obj = {
    'ToUserName': query['fromusername'],
    'FromUserName': query['tousername'],
    'CreateTime': Math.floor(Date.now() / 1000),
    'MsgType': 'text',
    'Conten': query['content']
  };
  return wxutils.GenXml(obj);
}