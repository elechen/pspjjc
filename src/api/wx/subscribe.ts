import { Request, Response } from 'express';
import * as wxutils from '@utils/wxutils';

export function handler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/xml');
  res.send(genResponseXml(req.body.xml));
}

function genResponseXml(query: {}): string {
  let obj = {
    'ToUserName': query['fromusername'],
    'FromUserName': query['tousername'],
    'CreateTime': Math.floor(Date.now() / 1000),
    'MsgType': 'text',
    'Content': '感谢您的关注'
  };
  return wxutils.GenXml(obj);
}