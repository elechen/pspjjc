import { Request, Response, RequestHandler } from 'express';
import * as redis from 'redis';
const redis_cli = redis.createClient();
import * as  bodyParser from 'body-parser';

interface REGISTER_DATA {
  openid?: string;
  id?: string;
  name?: string;
  phone?: string;
  code?: string;
  room?: string;
  idimgurl?: string[];
}

export function PostHandler(): RequestHandler[] {
  return [
    bodyParser.json(),
    function (req: Request, res: Response) {
      let data: REGISTER_DATA = req.body;
      let err = CheckRegister(data);
      if (err) {
        res.send({ code: 'SUCCESS', msg: err });
      } else {
        let key = 'sunnyhouse_regiser_' + data.openid;
        redis_cli.set(key, JSON.stringify(data));
        res.send({ code: 'SUCCESS' });
      }
    }
  ];
}

export function GetHandler(): RequestHandler[] {
  return [
    function (req: Request, res: Response) {
      let openid: string = req.query.openid;
      if (!openid) {
        res.send({ code: 'SUCCESS', msg: 'no openid' });
      } else if (openid === 'all') {
        redis_cli.keys('sunnyhouse_regiser_*', function (err, keys) {
          if (!keys) {
            res.send({ code: 'SUCCESS', msg: 'no keys' });
            return;
          }
          redis_cli.mget(keys, (err1, reply) => {
            if (reply) {
              let jsonList = [];
              reply.forEach(element => {
                jsonList.push(JSON.parse(element));
              });
              res.send({ code: 'SUCCESS', data: jsonList });
            }
            else {
              res.send({ code: 'SUCCESS', msg: 'no result' });
            }
          });
        });
      }
      else {
        let key = 'sunnyhouse_regiser_' + openid;
        redis_cli.get(key, (err, reply) => {
          res.send({ code: 'SUCCESS', data: JSON.parse(reply) });
        });
      }
    }
  ];
}

function CheckRegister(data: REGISTER_DATA): string {
  if (!data) {
    return 'no register data';
  } else {
    let lKey = ['openid', 'id', 'name', 'phone', 'code', 'room', 'idimgurl'];
    for (const k of lKey) {
      if (!data[k]) {
        return `no ${k} data`;
      }
    }
  }
}