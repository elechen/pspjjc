import { Request, Response } from 'express';
import * as wxutils from '@utils/wxutils';
import { handler as template_order_handler } from '@api/wx/template-order';
import { handler as template_pay_success_handler } from '@api/wx/template-pay-success';

export function handler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/xml');
  if (req.body.xml['content'] === '测试账单') {
    template_order_handler(req, res);
  } else if (req.body.xml['content'] === '支付成功') {
    template_pay_success_handler(req, res);
  } else {
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