import { Request, Response } from 'express';
import * as wxutils from '@utils/wxutils';
import * as wxdefine from '@define/wxdefine';
import * as request from "request";

const template_id = 'GNEosc4tROty2Hl-0x4LOuXd6JHnHFDu3EF9PJ1Cd3k';
const color = '#173177';

interface ITEM {
  'value': string;
  'color': string;
}

// {{first.DATA}}
// 房租：{{keyword1.DATA}}
// 水费：{{keyword2.DATA}}
// 电费：{{keyword3.DATA}}
// 其他：{{keyword4.DATA}}
// 合计：{{keyword5.DATA}}
// {{remark.DATA}}
interface DATA {
  'first': ITEM;
  'keyword1': ITEM;
  'keyword2': ITEM;
  'keyword3': ITEM;
  'keyword4': ITEM;
  'keyword5': ITEM;
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
  res.send('sucess');
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
  request.post({ url: url, form: order }, function (err, httpResponse, body) {
    console.log('SendTemplateMessage Callback', err, body);
  });
}

function GenData(): DATA {
  let data: DATA = {
    first: { value: '尊敬的101租客，这是您2019年2月的账单', color },
    keyword1: { value: '¥500', color },
    keyword2: { value: '¥10', color },
    keyword3: { value: '¥100', color },
    keyword4: { value: '¥35', color },
    keyword5: { value: '¥645', color },
    remark: { value: '点击查看详情，支持信用卡支付', color }
  };
  return data;
}