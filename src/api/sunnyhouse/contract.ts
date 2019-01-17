import { Request, Response, RequestHandler } from 'express';
import * as redis from 'redis';
const redis_cli = redis.createClient();
import * as  bodyParser from 'body-parser';
import * as uuid from 'uuid/v1';
import * as register from '@api/sunnyhouse/register';

interface CONTRACT_DATA {
  contractid?: string;
  openid?: string;
  rent: number;
  watercnt: number;
  electricitycnt: number;
  fromdate: string;
  todate: string;
  confirm?: number;
}

export function PostHandler(): RequestHandler[] {
  return [
    bodyParser.json(),
    function (req: Request, res: Response) {
      let data: CONTRACT_DATA = req.body;
      let err = CheckContract(data);
      if (err) {
        res.send({ code: 'SUCCESS', msg: err });
      } else {
        if (!data.contractid) {
          data.contractid = uuid();
          addToNewList(data.contractid);
          register.addContractToRegister(data.openid, data.contractid);
        }
        let contractid = data.contractid;
        let key = 'sunnyhouse_contract_' + data.contractid;
        redis_cli.set(key, JSON.stringify(data));
        res.send({ code: 'SUCCESS', data: { contractid } });
      }
    }
  ];
}

function addToNewList(contractid: string) {
  let key1 = 'sunnyhouse_contract_newlist';
  redis_cli.get(key1, (err, reply) => {
    if (reply) {
      let lst = JSON.parse(reply) as string[];
      const idx = lst.indexOf(contractid);
      if (idx === -1) {
        lst.push(contractid);
        redis_cli.set(key1, JSON.stringify(lst));
      }
    }
  });
}

export function GetHandler(): RequestHandler[] {
  return [
    function (req: Request, res: Response) {
      let contractid: string = req.query.contractid;
      if (!contractid) {
        res.send({ code: 'SUCCESS', msg: 'no contractid' });
      } else if (contractid === 'all') {
        redis_cli.keys('sunnyhouse_contract_*', function (err, keys) {
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
        let key = 'sunnyhouse_contract_' + contractid;
        redis_cli.get(key, (err, reply) => {
          res.send({ code: 'SUCCESS', data: JSON.parse(reply) });
        });
      }
    }
  ];
}

export function DelHandler(): RequestHandler[] {
  return [
    function (req: Request, res: Response) {
      let data: { contractid: string } = req.query;
      if (!data.contractid) {
        res.send({ code: 'SUCCESS', msg: 'no contractid' });
        return;
      }
      delFromNewList(data.contractid);
      let key = 'sunnyhouse_contract_' + data.contractid;
      redis_cli.get(key, (err, reply) => {
        let c = JSON.parse(reply) as CONTRACT_DATA;
        if (c) {
          register.delContractFromRegister(c.openid, data.contractid);
          redis_cli.del(key, (num) => {
            if (num) {
              res.send({ code: 'SUCCESS' });
            } else {
              res.send({ code: 'SUCCESS', msg: 'not find contractid' });
            }
          });
        } else {
          res.send({ code: 'SUCCESS', msg: 'not find contractid' });
        }
      });
    }
  ];
}

function CheckContract(data: CONTRACT_DATA): string {
  if (!data) {
    return 'no register data';
  } else {
    let lKey = ['openid', 'rent', 'watercnt', 'electricitycnt', 'fromdate', 'todate'];
    for (const k of lKey) {
      if (!data[k]) {
        return `no ${k} data`;
      }
    }
  }
}

export function PostNewContractHandler(): RequestHandler[] {
  return [
    bodyParser.json(),
    function (req: Request, res: Response) {
      let data: CONTRACT_DATA = req.body;
      console.log('PostNewContractHandler', data);
      if (!data.contractid) {
        res.send({ code: 'SUCCESS', msg: 'no contractid' });
      } else {
        let key = 'sunnyhouse_contract_newlist';
        redis_cli.get(key, (err, reply) => {
          if (reply) {
            let lst = JSON.parse(reply) as string[];
            if (lst.indexOf(data.contractid) !== -1) {
              lst.push(data.contractid);
              redis_cli.set(key, JSON.stringify(lst));
            }
          } else {
            redis_cli.set(key, JSON.stringify([data.contractid]));
          }
          res.send({ code: 'SUCCESS' });
        });
      }
    }
  ];
}

export function DelNewContractHandler(): RequestHandler[] {
  return [
    function (req: Request, res: Response) {
      let data: CONTRACT_DATA = req.query;
      if (!data.contractid) {
        res.send({ code: 'SUCCESS', msg: 'no contractid' });
      } else {
        let key = 'sunnyhouse_contract_newlist';
        redis_cli.get(key, (err, reply) => {
          if (reply) {
            let lst = JSON.parse(reply) as string[];
            const idx = lst.indexOf(data.contractid);
            if (idx !== -1) {
              lst.splice(idx);
              redis_cli.set(key, JSON.stringify(lst));
              res.send({ code: 'SUCCESS' });
            } else {
              res.send({ code: 'SUCCESS', msg: 'not in newlist' });
            }
          } else {
            res.send({ code: 'SUCCESS', msg: 'no data' });
          }
        });
      }
    }
  ];
}

export function GetNewContractHandler(): RequestHandler[] {
  return [
    function (req: Request, res: Response) {
      let key = 'sunnyhouse_contract_newlist';
      redis_cli.get(key, (err, reply) => {
        let idList = JSON.parse(reply) as string[];
        if (req.query.detail && idList) {
          const keys = idList.map((x) => { return 'sunnyhouse_contract_' + x; });
          redis_cli.mget(keys, (err1, reply1) => {
            if (reply1) {
              let jsonList = reply1.map((x) => { return JSON.parse(x); });
              res.send({ code: 'SUCCESS', data: jsonList });
            }
            else {
              res.send({ code: 'SUCCESS', msg: 'no result' });
            }
          });
        } else {
          res.send({ code: 'SUCCESS', data: JSON.parse(reply) });
        }
      });
    }
  ];
}

export function PostConfirmContractHandler(): RequestHandler[] {
  return [
    bodyParser.json(),
    function (req: Request, res: Response) {
      let data: CONTRACT_DATA = req.body;
      console.log('PostNewContractHandler', data);
      if (!data.contractid) {
        res.send({ code: 'SUCCESS', msg: 'no contractid' });
      } else {
        let key = 'sunnyhouse_contract_' + data.contractid;
        redis_cli.get(key, (err, reply) => {
          if (reply) {
            let jsonObj = JSON.parse(reply) as CONTRACT_DATA;
            if (!jsonObj.confirm) {
              jsonObj.confirm = Date.now();
              redis_cli.set(key, JSON.stringify(jsonObj));
              res.send({ code: 'SUCCESS', data: { confirm: jsonObj.confirm } });
            } else {
              res.send({ code: 'SUCCESS', msg: 'already confirmed' });
            }
            delFromNewList(data.contractid);
          }
        });
      }
    }
  ];
}

function delFromNewList(contractid: string) {
  let key = 'sunnyhouse_contract_newlist';
  redis_cli.get(key, (err, reply) => {
    if (reply) {
      let lst = JSON.parse(reply) as string[];
      const idx = lst.indexOf(contractid);
      if (idx !== -1) {
        lst.splice(idx);
        redis_cli.set(key, JSON.stringify(lst));
      }
    }
  });
}
