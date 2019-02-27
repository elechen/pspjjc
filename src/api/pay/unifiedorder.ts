import { Request, Response, RequestHandler } from 'express';
import * as redis from 'redis';
const redis_cli = redis.createClient();
import Axios, { AxiosResponse } from 'axios';
import * as bodyParser from 'body-parser';
import * as wxutils from '@utils/wxutils';
import * as wxdefine from '@define/wxdefine';
import * as xml2js from 'xml2js';

interface ORDER_DATA {
  appid?: string;
  mch_id?: string;
  nonce_str?: string;
  sign?: string;
  openid: string;
  body: string; // 商品简单描述
  out_trade_no: string;
  total_fee: number;
  spbill_create_ip?: string;
  notify_url?: string;
  trade_type?: string;
  attach?: string; // 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用
}

interface PREPAY_DATA {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string; //提交格式如：prepay_id=\*\*\*）
  signType: string;
  paySign?: string;
}

export function GetHandler(): RequestHandler[] {
  return [
    function (req: Request, res: Response) {
      let data: ORDER_DATA = req.query;
      let err = CheckOrder(data);
      if (err) {
        res.send({ code: 'FAIL', msg: err });
        return;
      }
      let defaultData = GetDefaultParams(req);
      data = { ...defaultData, ...data };
      let url = wxdefine.API_URL.unifiedorder;
      data.sign = wxutils.CalSign(data);
      console.log('xml->', wxutils.GenXml(data));
      Axios.post(url, wxutils.GenXml(data)).then((res1: AxiosResponse) => {
        console.log('PostHandler Res->', res1.data);
        xml2js.parseString(res1.data, { explicitArray: false }, (err, xmlData) => {
          const data = xmlData['xml'];
          console.log('xml2js->', data);
          if (data.return_code === 'SUCCESS') {
            if (data.result_code === 'SUCCESS') {
              let appId = wxdefine.APPID;
              let timeStamp = Math.ceil(Date.now() / 1000).toString();
              let nonceStr = Math.random().toString().substr(2, 8);
              let packageInfo = 'prepay_id=' + data.prepay_id;
              let prepay: PREPAY_DATA = { appId, timeStamp, nonceStr, package: packageInfo, signType: 'MD5' };
              prepay.paySign = wxutils.CalSign(prepay);
              res.send({ code: 'SUCCESS', data: prepay });
            } else {
              res.send({ code: 'FAIL', msg: 'err_code:' + data.err_code });
            }
          } else {
            res.send({ code: 'FAIL', msg: data.return_msg });
          }
        });
      });
    }
  ];
}

function GetDefaultParams(req: Request) {
  return {
    appid: wxdefine.APPID,
    mch_id: wxdefine.MCHID,
    nonce_str: Math.random().toString().substr(2, 8),
    // sign?: string;
    // body: string; // 商品简单描述
    // out_trade_no: string;
    // total_fee: number;
    spbill_create_ip: GetRealIP(req),
    notify_url: 'http://pspjjc.chenxiaofeng.vip/pay/notify',
    trade_type: wxdefine.TRADE_TYPE.JSAPI,
    // attach?: string; 
  };
}

function GetRealIP(req: Request) {
  var ip = req.headers['x-forwarded-for'] as string ||
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.remoteAddress || '';
  if (ip.split(',').length > 0) {
    ip = ip.split(',')[0];
  }
  ip = ip.substr(ip.lastIndexOf(':') + 1, ip.length);
  ip = '116.22.32.151';
  console.log("GetRealIP:" + ip);
  return ip;
}

function CheckOrder(data: ORDER_DATA): string {
  if (!data) {
    return 'no order data';
  } else {
    let lKey = ['openid', 'body', 'out_trade_no', 'total_fee'];
    for (const k of lKey) {
      if (!data[k]) {
        return `no ${k} data`;
      }
    }
  }
}
