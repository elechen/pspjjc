import { Request, Response } from 'express';
import * as wxutils from '@utils/wxutils';
import * as wxdefine from '@define/wxdefine';
import * as request from "request";

const template_id = 'DCNkK6xqUujTBSWul00x19JfyOFwxZBo4p0FIb8vMQM';
const color = '#173177';

interface ITEM {
  'value': string;
  'color': string;
}

// {{first.DATA}}
// 付款金额：{{keyword1.DATA}}
// 交易单号：{{keyword2.DATA}}
// {{remark.DATA}}
interface DATA {
  'first': ITEM;
  'keyword1': ITEM;
  'keyword2': ITEM;
  'remark': ITEM;
}

interface ORDER {
  'touser': string;
  'template_id': string;
  'url': string;
  'topcolor': string;
  'data': DATA;
}

export function handler(req: Request, res: Response) {
  let query = req.body.xml;
  let touser = query['fromusername'];
  wxutils.GetAccessToken((token: string) => {
    SendTemplateMessage(touser, token);
  });
  res.send('success');
}

function SendTemplateMessage(touser: string, token: string) {
  let url = wxdefine.API_URL.message_template;
  url = url.replace('$ACCESS_TOKEN', token);
  let order: ORDER = {
    touser,
    template_id,
    url: 'pspjjc.chenxiaofeng.vip/sunnyhouse/order?order_id=1111',
    topcolor: color,
    data: GenData()
  };
  console.log('url->', url);
  console.log('order->', order);
  request.post({
    url: url,
    json: order
  }, function (err, httpResponse, body) {
    console.log('SendTemplateMessage Callback', err, body);
  });
}

function GenData(): DATA {
  let data: DATA = {
    first: { value: '尊敬的101租客，您2019年2月的账单已结清\n', color },
    keyword1: { value: '¥645', color },
    keyword2: { value: '2564659879813214796416', color },
    remark: { value: '\n点击查看详情', color }
  };
  return data;
}