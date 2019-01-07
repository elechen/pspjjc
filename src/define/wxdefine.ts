const APPID = process.env.APPID;
const APPSECRET = process.env.APPSECRET;

export const API_URL = {
  'token': `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`,
  'message_template': `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=$ACCESS_TOKEN`,
  'oauth2_code': `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APPID}&redirect_uri=$REDIREC_URI&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`,
  'oauth2_accesstoken': ` https://api.weixin.qq.com/sns/oauth2/access_token?appid=${APPID}&secret=${APPSECRET}&code=$CODE&grant_type=authorization_code`,
  'oauth2_refreshtoken': `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${APPID}&grant_type=refresh_token&refresh_token=$REFRESH_TOKEN`,
  'userinfo': `https://api.weixin.qq.com/sns/userinfo?access_token=$ACCESS_TOKEN&openid=$OPENID&lang=zh_CN`
};

export const TRADE_TYPE = {
  JSAPI: 'JSAPI', //JSAPI支付或小程序支付(微信内浏览器支付)
  NATIVE: 'NATIVE', //Native支付
  APP: 'APP', //app支付
  MWEB: 'MWEB', //H5支付(微信外浏览器支付)
  MICROPAY: 'MICROPAY' //付款码支付(付款码支付有单独的支付接口)
};