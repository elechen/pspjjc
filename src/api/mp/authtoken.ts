import { Request, Response } from "express";
import * as crypto from "crypto";

export function handler(req: Request, res: Response) {
  let token = process.env.WX_TOKEN;
  let args = [req.query.nonce, req.query.timestamp, token];
  args.sort();
  let argsSignature = sha1(args.join(''));
  console.log('args->', req.query);
  console.log('argsSignature->', argsSignature);
  let echostr = req.query.echostr;
  if (req.query.signature === argsSignature) {
    res.send(echostr);
    console.log('verify token success');
  } else {
    res.send('fail');
    console.log('verify token failed');
  }
}

function sha1(argsStr: string): string {
  let hash = crypto.createHash('sha1');
  return hash.update(argsStr, 'utf8').digest('hex');
}