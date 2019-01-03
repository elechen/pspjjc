import { Request, Response } from 'express';
import * as wxutils from '@utils/wxutils';
import {handler as template_order_hander} from '@api/wx/template-order';

export function handler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/xml');
  if(req.body.xml['content'] === '测试账单'){
    template_order_hander(req, res);
  }else{
    res.send(genResponseXml(req.body.xml));
  }
}

function genResponseXml(query: {}): string {
  let obj = {
    'ToUserName': query['fromusername'],
    'FromUserName': query['tousername'],
    'CreateTime': Math.floor(Date.now() / 1000),
    'MsgType': 'text',
    'Content': query['content']
  };
  return wxutils.GenXml(obj);
}