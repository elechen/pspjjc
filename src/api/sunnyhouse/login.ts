import { Request, Response } from 'express';
import * as wxdefine from '@define/wxdefine';
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
      _GetAccessToken(data.openid, (data: ACCESS_TOKEN) => {
        GetUserInfo(req, res, data);
      });
    }).catch(function (error) {
      console.log(error);
      res.send('success');
    });
  }
}

//todo sid to user
export function user(req: Request, res: Response) {
  let sid = req.query.sid;
  if (sid) {
    _GetUserInfo(sid, (user) => {
      res.send({ code: 'SUCCESS', data: user });
    });
  } else {
    res.send({ msg: "no user" });
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
    _GetUserInfo(data.openid, (data: USER_INFO) => {
      // res.send('_GetUserInfo:' + JSON.stringify(data));
      let user = { sid: data.openid };
      let queryString = GenQueryString(user);
      res.redirect('http://sunnyhouse.chenxiaofeng.vip?' + queryString);
    });
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
        // res.send('uidlogin_GetUserInfo:' + JSON.stringify(data));
        let user = { sid: uid }; //后面处理为有效期sid可映射uid
        let queryString = GenQueryString(user);
        res.redirect('http://sunnyhouse.chenxiaofeng.vip?' + queryString);
      } else {
        wxlogin(req, res);
      }
    });
  } else {
    wxlogin(req, res);
  }
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