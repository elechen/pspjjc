const APPID = 'YOUR_APPID';
const APPSECRET = 'YOUR_APPSECRET';
const APIHOST = 'https://api.weixin.qq.com/cgi-bin';

export const API_URL = {
  'token': `${APIHOST}/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`,
  'message_template': `${APIHOST}/message/template/send?access_token=$ACCESS_TOKEN`
};