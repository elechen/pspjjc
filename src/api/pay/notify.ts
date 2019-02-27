import { Request, Response, RequestHandler } from 'express';
import * as redis from 'redis';
const redis_cli = redis.createClient();
import * as xmlparser from 'express-xml-bodyparser';
import * as wxutils from '@utils/wxutils';
import { ORDER_DATA } from '@api/sunnyhouse/order';

interface NOTIFY_DATA {
  return_code: string;
  return_msg: string;
  //以下字段在return_code为SUCCESS的时候有返回
  appid: string;
  mch_id: string;
  device_info?: string;
  nonce_str: string;
  sign: string;
  sign_type?: string;
  result_code: string;//SUCCESS/FAIL
  err_code?: string;
  err_code_des?: string;
  openid: string;
  is_subscribe: string;//Y-关注，N-未关注
  trade_type: string;//JSAPI、NATIVE、APP
  bank_type: string;
  total_fee: number;
  cash_fee: number;
  cash_fee_type?: string;
  coupon_fee?: number;
  coupon_count?: number;
  coupon_type_$n?: string;
  coupon_id_$n?: string;
  coupon_fee_$n?: number;
  transaction_id: string;
  out_trade_no: string;
  attach?: string;
  time_end: string;//如2009年12月25日9点10分10秒表示为20091225091010
}

export function PostHandler(): RequestHandler[] {
  return [
    xmlparser({ trim: false, explicitArray: false }),
    function (req: Request, res: Response) {
      let data: NOTIFY_DATA = req.body.xml;
      let bPass = wxutils.CheckSign(data);
      if (bPass) {
        let orderid = data.out_trade_no;
        let key = 'sunnyhouse_order_' + orderid;
        redis_cli.get(key, (err, reply) => {
          if (reply) {
            let c = JSON.parse(reply) as ORDER_DATA;
            c.finishedtime = data.time_end;
            c.transaction_id = data.transaction_id;
            redis_cli.set(key, JSON.stringify(c));
          }
        });
      }
      let key = 'sunnyhouse_wx_pay_notify_' + Date.now().toString();
      redis_cli.set(key, JSON.stringify(data));
      res.send(wxutils.GenXml({ return_code: 'SUCCESS', return_msg: 'OK' }));
      console.log(data)
    }
  ];
}