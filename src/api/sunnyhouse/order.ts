import { Request, Response, RequestHandler } from 'express';
import * as redis from 'redis';
const redis_cli = redis.createClient();
import * as  bodyParser from 'body-parser';
import * as crypto from 'crypto';

import * as contract from '@api/sunnyhouse/contract';

interface ORDER_DATA {
  orderid?: string;
  createdtime?: number;
  openid?: string;
  contractid?: string;
  room?: number;

  //费用列表
  rent?: number;
  deposit?: number;
  wifi?: number;
  trash?: number;
  water?: number;
  electricity?: number;
  total?: number;

  //抄表记录
  lastwatercnt?: number;
  lastelectricitycnt?: number;
  watercnt?: number;
  electricitycnt?: number;
  fromdate?: string;
  todate?: string;

  //微信支付订单号，如果有则认为已支付
  transaction_id?: string;
  finishedtime?: number;
}

export function PostHandler(): RequestHandler[] {
  return [
    bodyParser.json(),
    function (req: Request, res: Response) {
      let data: ORDER_DATA = req.body;
      let err = CheckOrder(data);
      if (err) {
        res.send({ code: 'SUCCESS', msg: err });
      } else {
        if (!data.orderid) {
          data.orderid = crypto.randomBytes(16).toString('hex');
          data.createdtime = Date.now();
          contract.addOrder(data.contractid, data.orderid);
        }
        let orderid = data.orderid;
        let key = 'sunnyhouse_order_' + data.orderid;
        redis_cli.set(key, JSON.stringify(data));
        res.send({ code: 'SUCCESS', data: { orderid } });
      }
    }
  ];
}

export function GetHandler(): RequestHandler[] {
  return [
    function (req: Request, res: Response) {
      let orderid: string = req.query.orderid;
      if (!orderid) {
        res.send({ code: 'SUCCESS', msg: 'no orderid' });
      } else if (orderid === 'all') {
        redis_cli.keys('sunnyhouse_order_*', function (err, keys) {
          if (!keys) {
            res.send({ code: 'SUCCESS', msg: 'no keys' });
            return;
          }
          redis_cli.mget(keys, (err, reply) => {
            if (reply) {
              let jsonList = reply.map((x) => { return JSON.parse(x); });
              res.send({ code: 'SUCCESS', data: jsonList });
            }
            else {
              res.send({ code: 'SUCCESS', msg: 'no result' });
            }
          });
        });
      } else {
        let key = 'sunnyhouse_order_' + orderid;
        redis_cli.get(key, (err, reply) => {
          res.send({ code: 'SUCCESS', data: JSON.parse(reply) });
        });
      }
    }
  ];
}

export function DelHandler(): RequestHandler[] {
  return [
    bodyParser.json(),
    function (req: Request, res: Response) {
      let data: { orderid: string } = req.body;
      if (!data.orderid) {
        res.send({ code: 'SUCCESS', msg: 'no orderid' });
        return;
      }
      let key = 'sunnyhouse_order_' + data.orderid;
      redis_cli.get(key, (err, reply) => {
        if (reply) {
          let c = JSON.parse(reply) as ORDER_DATA;
          contract.delOrder(c.contractid, c.orderid);
          redis_cli.del(key);
          res.send({ code: 'SUCCESS' });
        } else {
          res.send({ code: 'SUCCESS', msg: 'not find orderid' });
        }
      });
    }
  ];
}

function CheckOrder(data: ORDER_DATA): string {
  if (!data) {
    return 'no order data';
  } else {
    let lKey = ['openid', 'contractid', 'room',
      'rent', 'deposit', 'wifi', 'trash', 'water', 'electricity', 'total',
      'watercnt', 'electricitycnt', 'lastwatercnt', 'lastelectricitycnt',
      'fromdate', 'todate'];
    for (const k of lKey) {
      if (data[k] === undefined) {
        return `no ${k} data`;
      }
    }
  }
}
