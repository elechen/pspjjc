import { Router, Request, Response } from 'express';
import * as login from '@api/sunnyhouse/login';
import * as upload from '@api/sunnyhouse/upload';
import * as register from '@api/sunnyhouse/register';
import * as contract from '@api/sunnyhouse/contract';
import * as order from '@api/sunnyhouse/order';

export let router = Router();

router.get('/', function (req: Request, res: Response) {
  let handler = GetHandler(req);
  if (handler) {
    handler(req, res);
  } else {
    res.send('success');
  }
});

router.get('/auth2callback', function (req: Request, res: Response) {
  login.auth2callback(req, res);
});

router.get('/user', function (req: Request, res: Response) {
  login.user(req, res);
});

router.post('/upload', upload.PostHandler());

router.post('/register/state', register.PostStateHandler());
router.post('/register/contract', register.PostContractHandler());
router.delete('/register/contract', register.DelContractHandler());
router.post('/register/order', register.PostOrderHandler());
router.delete('/register/order', register.DelOrderHandler());
router.post('/register', register.PostHandler());
router.get('/register', register.GetHandler());
router.delete('/register', register.DelHandler());

router.post('/contract/new', contract.PostNewContractHandler());
router.get('/contract/new', contract.GetNewContractHandler());
router.delete('/contract/new', contract.DelNewContractHandler());
router.post('/contract/confirm', contract.PostConfirmContractHandler());
router.post('/contract', contract.PostHandler());
router.get('/contract', contract.GetHandler());
router.delete('/contract', contract.DelHandler());

router.post('/order', order.PostHandler());
router.get('/order', order.GetHandler());
router.delete('/order', order.DelHandler());

function GetHandler(req: Request): (req: Request, res: Response) => void {
  let func = login.handler;
  return func;
}
