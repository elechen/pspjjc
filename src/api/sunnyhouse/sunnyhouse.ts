import { Router, Request, Response } from 'express';
import * as login from '@api/sunnyhouse/login';
import * as upload from '@api/sunnyhouse/upload';
import * as register from '@api/sunnyhouse/register';

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

router.post('/register', register.PostHandler());
router.get('/register', register.GetHandler());

function GetHandler(req: Request): (req: Request, res: Response) => void {
  let func = login.handler;
  return func;
}