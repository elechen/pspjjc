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
  if (req.query.code) {
    auth2callback(req, res);
  } else {
    let uid = req.session.uid;
    if (!uid) {
      wxlogin(req, res);
    } else {
      uidlogin(uid, req, res);
    }
  }

}

function wxlogin(req: Request, res: Response) {
  let callback = encodeURIComponent('http://pspjjc.chenxiaofeng.vip');
  let outh2uri = wxdefine.API_URL.oauth2_code.replace('$REDIREC_URI', callback);
  res.redirect(outh2uri);
}

function auth2callback(req: Request, res: Response) {
  if (req.query.code) {
    let url = wxdefine.API_URL.oauth2_accesstoken.replace('$CODE', req.query.code);
    Axios.get(url).then(function (response: AxiosResponse) {
      console.log('AxiosResponse', response);
      let data: ACCESS_TOKEN = response.data;
      console.log(data);
      req.session.uid = data.openid;
      SaveAccessToken(data);
      GetAccessToken(data.openid, (data: ACCESS_TOKEN) => {
        GetUserInfo(req, res);
        _GetUserInfo(data.openid, (data: USER_INFO) => {
          res.send('_GetUserInfo:' + JSON.stringify(data));
        });
      });
    }).catch(function (error) {
      console.log(error);
    });
    res.send('success');
  }
}

function SaveAccessToken(data: ACCESS_TOKEN) {
  let uid = data.openid;
  let key = 'accesstoken_' + uid;
  redis_cli.set(key, JSON.stringify(data));
}

function GetAccessToken(uid: string, cb: (data: ACCESS_TOKEN) => void) {
  let key = 'accesstoken_' + uid;
  redis_cli.get(key, (error?: any, reply?: string) => {
    cb(JSON.parse(reply));
  });
}

export function RefreshAceessToken(req: Request, res: Response) {
  let refresh_token = '';
  let url = wxdefine.API_URL.oauth2_refreshtoken.replace('$REFRESH_TOKEN', refresh_token);
  Axios.get(url).then(function (response: AxiosResponse) {
    console.log('AxiosResponse', response);
    let data: ACCESS_TOKEN = response.data;
    console.log(data);
    req.session.uid = data.openid;
    SaveAccessToken(data);
  }).catch(function (error) {
    console.log(error);
  });
}

export function GetUserInfo(req: Request, res: Response) {
  let openid = '';
  let access_token = '';
  let url = wxdefine.API_URL.userinfo.replace('$ACCESS_TOKEN', access_token);
  url = url.replace('$OPENID', openid);
  Axios.get(url).then(function (response: AxiosResponse) {
    console.log('AxiosResponse', response);
    let data: USER_INFO = response.data;
    console.log(data);
    SaveUserInfo(data);
  }).catch(function (error) {
    console.log(error);
  });
}

function SaveUserInfo(data: USER_INFO) {
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
    res.send('sucess');
  } else {
    wxlogin(req, res);
  }
}

function isvalid(ui: string): boolean {
  return true;
}