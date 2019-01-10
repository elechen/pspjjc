import { Request, Response } from 'express';
import * as crypto from 'crypto';
import * as wxdefine from '@define/wxdefine';
import * as redisdefine from '@define/redisdefine';
import Axios, { AxiosResponse } from 'axios';
import * as redis from 'redis';
const redis_cli = redis.createClient();

interface ACCESS_TOKEN {
  "access_token": string;
  "expires_in": number;
  "refresh_token": string;
  "openid": string;
  "scope": string;
}

interface USER_INFO {
  "openid": string;
  "nickname": string;
  "sex": string;
  "province": string;
  "city": string;
  "country": string;
  "headimgurl": string;
  "privilege": string[];
  "unionid"?: string;
}

export function handler(req: Request, res: Response) {
  console.log('login-req.query:', JSON.stringify(req.query));
  let uid = req.session.uid;
  if (!uid) {
    wxlogin(req, res);
  } else {
    uidlogin(uid, req, res);
  }
}

function wxlogin(req: Request, res: Response) {
  let callback = encodeURIComponent('http://pspjjc.chenxiaofeng.vip/sunnyhouse/auth2callback');
  let outh2uri = wxdefine.API_URL.oauth2_code.replace('$REDIREC_URI', callback);
  res.redirect(outh2uri);
}

export function auth2callback(req: Request, res: Response) {
  if (req.query.code) {
    let url = wxdefine.API_URL.oauth2_accesstoken.replace('$CODE', req.query.code);
    Axios.get(url).then(function (response: AxiosResponse) {
      console.log('auth2callback-AxiosResponse:', response.data);
      let data: ACCESS_TOKEN = response.data;
      req.session.uid = data.openid;
      _SaveAccessToken(data);
      GetUserInfo(req, res, data);
    }).catch(function (error) {
      console.log(error);
      res.send('success');
    });
  }
}

export function user(req: Request, res: Response) {
  let sid = req.query.sid;
  if (sid) {
    GetUidBySid(sid, (uid) => {
      if (uid) {
        _GetUserInfo(uid, (user) => {
          if (user) {
            res.send({ code: 'SUCCESS', data: user });
          } else {
            res.send({ code: 'SUCCESS', msg: "no user(user not found)" });
          }
        });
      } else {
        res.send({ code: 'SUCCESS', msg: "no user(uid not found)" });
      }
    });
  } else {
    res.send({ code: 'SUCCESS', msg: "no user(sid not found)" });
  }
}

function _SaveAccessToken(data: ACCESS_TOKEN) {
  let uid = data.openid;
  let key = 'accesstoken_' + uid;
  redis_cli.set(key, JSON.stringify(data));
}

function _GetAccessToken(uid: string, cb: (data: ACCESS_TOKEN) => void) {
  let key = 'accesstoken_' + uid;
  redis_cli.get(key, (error?: any, reply?: string) => {
    cb(JSON.parse(reply));
  });
}

export function RefreshAceessToken(req: Request, res: Response) {
  let refresh_token = '';
  let url = wxdefine.API_URL.oauth2_refreshtoken.replace('$REFRESH_TOKEN', refresh_token);
  Axios.get(url).then(function (response: AxiosResponse) {
    console.log('RefreshAceessToken-AxiosResponse', response.data);
    let data: ACCESS_TOKEN = response.data;
    req.session.uid = data.openid;
    _SaveAccessToken(data);
  }).catch(function (error) {
    console.log(error);
  });
}

export function GetUserInfo(req: Request, res: Response, data: ACCESS_TOKEN) {
  let openid = data.openid;
  let access_token = data.access_token;
  let url = wxdefine.API_URL.userinfo.replace('$ACCESS_TOKEN', access_token);
  url = url.replace('$OPENID', openid);
  Axios.get(url).then(function (response: AxiosResponse) {
    console.log('GetUserInfoAxiosResponse', response.data);
    let data: USER_INFO = response.data;
    _SaveUserInfo(data);
    let sid = GenUniqueSid();
    UpdateSid2Uid(sid, data.openid);
    RedirectToSunnyHouse({ sid: sid }, req, res);
  }).catch(function (error) {
    console.log(error);
  });
}

function _SaveUserInfo(data: USER_INFO) {
  let uid = data.openid;
  let key = 'userinfo_' + uid;
  redis_cli.set(key, JSON.stringify(data));
}

function _GetUserInfo(uid: string, cb: (data: USER_INFO) => void) {
  let key = 'userinfo_' + uid;
  redis_cli.get(key, (error?: any, reply?: string) => {
    cb(JSON.parse(reply));
  });
}

function uidlogin(uid: string, req: Request, res: Response) {
  if (isvalid(uid)) {
    _GetUserInfo(uid, (data: USER_INFO) => {
      if (data && data.openid === uid) {
        let sid = GenUniqueSid();
        UpdateSid2Uid(sid, uid);
        RedirectToSunnyHouse({ sid: sid }, req, res);
      } else {
        wxlogin(req, res);
      }
    });
  } else {
    wxlogin(req, res);
  }
}

function RedirectToSunnyHouse(query: {}, req: Request, res: Response) {
  let queryString = GenQueryString(query);
  res.redirect('http://sunnyhouse.chenxiaofeng.vip/?' + queryString);
}

function GenUniqueSid(): string {
  return crypto.randomBytes(16).toString('hex');
}

function GetUidBySid(sid: string, cb: (uid: string) => void): void {
  const key = 'sid2uid_' + sid;
  redis_cli.get(key, (error?: any, reply?: string) => {
    cb(reply);
    if (reply) {
      UpdateSid2Uid(sid, reply);
    }
  });
}

function UpdateSid2Uid(sid: string, uid: string) {
  const duration = 10; // sid有效期为10分钟
  const key = 'sid2uid_' + sid;
  redis_cli.set(key, uid, redisdefine.SET_MODE.EX, duration);
}

function GenQueryString(obj: {}): string {
  let queryString = Object.keys(obj).map((key) => {
    return key + '=' + encodeURIComponent(obj[key]);
  }).join('&');
  return queryString;
}

function isvalid(ui: string): boolean {
  return true;
}