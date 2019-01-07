import { Router, Request, Response } from 'express';
import * as login from '@api/sunnyhouse/login';

export let router = Router();

router.get('/', function (req: Request, res: Response) {
  let handler = GetHandler(req);
  if (handler) {
    handler(req, res);
  } else {
    res.send('success');
  }
});

function GetHandler(req: Request): (req: Request, res: Response) => void {
  let func = login.handler;
  return func;
}