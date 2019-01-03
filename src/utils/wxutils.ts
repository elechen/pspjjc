import * as wxdefine from '@define/wxdefine';
import * as request from "request";

export function GenXml(object: {}): string {
  let xml = '<xml>';
  for (const key in object) {
    const element = object[key];
    let line = `<${key}><![CDATA[${element}]]></${key}>`;
    xml += line;
  }
  xml += '</xml>';
  return xml;
}

let TokenInfo: { access_token: string, expires_time: number };
export function GetAccessToken(cb: (token: string) => void) {
  if (TokenInfo && TokenInfo.expires_time > Date.now()) {
    cb(TokenInfo.access_token);
  } else {
    let url = wxdefine.API_URL.token;
    request.get(url, null, (error: any, response: request.Response, body: any) => {
      let info = JSON.parse(body);
      console.log('info=>', info);
      if (info['errcode']) {
        //do nothing
      } else {
        TokenInfo = { expires_time: 0, access_token: '' };
        TokenInfo.expires_time = info['expires_in'] * 1000 + Date.now();
        TokenInfo.expires_time -= 60 * 1000; //提前60秒过期，重新申请
        TokenInfo.access_token = info['access_token'];
        cb(TokenInfo.access_token);
      }
    });
  }
}