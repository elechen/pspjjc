import { Request, Response, RequestHandler } from 'express';
import * as redis from 'redis';
const redis_cli = redis.createClient();
import * as  bodyParser from 'body-parser';

interface REGISTER_DATA {
  openid?: string;
  contractid?: string[];
  orderid?: string[];
  id?: string;
  name?: string;
  phone?: string;
  code?: string;
  idimgurl?: string[];
  state?: number;
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
        delete data.code;
        let key = 'sunnyhouse_register_' + data.openid;
        redis_cli.set(key, JSON.stringify(data));
        res.send({ code: 'SUCCESS' });
      }
    }
  ];
}

export function DelHandler(): RequestHandler[] {
  return [
    function (req: Request, res: Response) {
      let data: { openid: string } = req.query;
      if (!data.openid) {
        res.send({ code: 'SUCCESS', msg: 'no openid' });
        return;
      }
      let key = 'sunnyhouse_register_' + data.openid;
      redis_cli.del(key, (num) => {
        if (num) {
          res.send({ code: 'SUCCESS' });
        } else {
          res.send({ code: 'SUCCESS', msg: 'not find openid' });
        }
      });
    }
  ];
}

export function PostStateHandler(): RequestHandler[] {
  return [
    bodyParser.json(),
    function (req: Request, res: Response) {
      let data: { openid: string, state: number } = req.body;
      let key = 'sunnyhouse_register_' + data.openid;
      redis_cli.get(key, (err, reply) => {
        if (reply) {
          let info: REGISTER_DATA = JSON.parse(reply);
          if (info) {
            info.state = data.state;
            redis_cli.set(key, JSON.stringify(info));
            res.send({ code: 'SUCCESS' });
          } else {
            res.send({ code: 'SUCCESS', msg: 'parse error' });
          }
        } else {
          res.send({ code: 'SUCCESS', msg: 'no data' });
        }
      });
    }
  ];
}

export function PostContractHandler(): RequestHandler[] {
  return [
    bodyParser.json(),
    function (req: Request, res: Response) {
      let data: { openid: string, contractid: string } = req.body;
      let key = 'sunnyhouse_register_' + data.openid;
      redis_cli.get(key, (err, reply) => {
        if (reply) {
          let info: REGISTER_DATA = JSON.parse(reply);
          if (!info.contractid) {
            info.contractid = [data.contractid];
          } else if (info.contractid.indexOf(data.contractid) === -1) {
            info.contractid.push(data.contractid);
          }
          redis_cli.set(key, JSON.stringify(info));
          res.send({ code: 'SUCCESS' });
        } else {
          res.send({ code: 'SUCCESS', msg: 'no data' });
        }
      });
    }
  ];
}

export function DelContractHandler(): RequestHandler[] {
  return [
    function (req: Request, res: Response) {
      let data: { openid: string, contractid: string } = req.query;
      if (!data.openid) {
        res.send({ code: 'SUCCESS', msg: 'no openid' });
        return;
      }
      if (!data.contractid) {
        res.send({ code: 'SUCCESS', msg: 'no contractid' });
        return;
      }
      let key = 'sunnyhouse_register_' + data.openid;
      redis_cli.get(key, (err, reply) => {
        if (reply) {
          let info: REGISTER_DATA = JSON.parse(reply);
          if (!info.contractid) {
            res.send({ code: 'SUCCESS', msg: 'no find contractid' });
            return;
          }
          let idx = info.contractid.indexOf(data.contractid);
          if (idx !== -1) {
            info.contractid.splice(idx);
            redis_cli.set(key, JSON.stringify(info));
            res.send({ code: 'SUCCESS' });
          } else {
            res.send({ code: 'SUCCESS', msg: 'not find contractid' });
          }
        } else {
          res.send({ code: 'SUCCESS', msg: 'no data' });
        }
      });
    }
  ];
}

export function PostOrderHandler(): RequestHandler[] {
  return [
    bodyParser.json(),
    function (req: Request, res: Response) {
      let data: { openid: string, orderid: string } = req.body;
      let key = 'sunnyhouse_register_' + data.openid;
      redis_cli.get(key, (err, reply) => {
        if (reply) {
          let info: REGISTER_DATA = JSON.parse(reply);
          if (!info.orderid) {
            info.orderid = [data.orderid];
          } else if (info.orderid.indexOf(data.orderid) !== -1) {
            info.orderid.push(data.orderid);
          }
          redis_cli.set(key, JSON.stringify(info));
          res.send({ code: 'SUCCESS' });
        } else {
          res.send({ code: 'SUCCESS', msg: 'no data' });
        }
      });
    }
  ];
}

export function DelOrderHandler(): RequestHandler[] {
  return [
    bodyParser.json(),
    function (req: Request, res: Response) {
      let data: { openid: string, orderid: string } = req.body;
      if (!data.openid) {
        res.send({ code: 'SUCCESS', msg: 'no openid' });
        return;
      }
      if (!data.orderid) {
        res.send({ code: 'SUCCESS', msg: 'no orderid' });
        return;
      }
      let key = 'sunnyhouse_register_' + data.openid;
      redis_cli.get(key, (err, reply) => {
        if (reply) {
          let info: REGISTER_DATA = JSON.parse(reply);
          if (!info.orderid) {
            res.send({ code: 'SUCCESS', msg: 'no find orderid' });
            return;
          }
          let idx = info.orderid.indexOf(data.orderid);
          if (idx !== -1) {
            info.orderid.splice(idx);
            redis_cli.set(key, JSON.stringify(info));
            res.send({ code: 'SUCCESS' });
          } else {
            res.send({ code: 'SUCCESS', msg: 'not find orderid' });
          }
        } else {
          res.send({ code: 'SUCCESS', msg: 'no data' });
        }
      });
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
        redis_cli.keys('sunnyhouse_register_*', function (err, keys) {
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
      }
      else {
        let key = 'sunnyhouse_register_' + openid;
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
    let lKey = ['openid', 'headimgurl', 'id', 'name', 'phone', 'code', 'idimgurl'];
    for (const k of lKey) {
      if (!data[k]) {
        return `no ${k} data`;
      }
    }
  }
}

export function addContractToRegister(openid: string, contractid: string) {
  let key = 'sunnyhouse_register_' + openid;
  redis_cli.get(key, (err, reply) => {
    if (reply) {
      let info = JSON.parse(reply) as REGISTER_DATA;
      if (!info.contractid) {
        info.contractid = [contractid];
      } else if (info.contractid.indexOf(contractid) === -1) {
        info.contractid.push(contractid);
      }
      redis_cli.set(key, JSON.stringify(info));
    }
  });
}

export function delContractFromRegister(openid: string, contractid: string) {
  let key = 'sunnyhouse_register_' + openid;
  redis_cli.get(key, (err, reply) => {
    if (reply) {
      let info = JSON.parse(reply) as REGISTER_DATA;
      if (info && info.contractid) {
        let idx = info.contractid.indexOf(contractid);
        if (idx !== -1) {
          info.contractid.splice(idx);
          redis_cli.set(key, JSON.stringify(info));
        }
      }
    }
  });
}
