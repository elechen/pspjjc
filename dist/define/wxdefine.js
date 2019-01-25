"use strict";
exports.__esModule = true;
exports.APPID = process.env.APPID;
exports.APPSECRET = process.env.APPSECRET;
exports.MCHID = process.env.MCHID;
exports.MCHKEY = process.env.MCHKEY;
exports.API_URL = {
    'token': "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + exports.APPID + "&secret=" + exports.APPSECRET,
    'message_template': "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=$ACCESS_TOKEN",
    'oauth2_code': "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + exports.APPID + "&redirect_uri=$REDIREC_URI&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect",
    'oauth2_accesstoken': "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + exports.APPID + "&secret=" + exports.APPSECRET + "&code=$CODE&grant_type=authorization_code",
    'oauth2_refreshtoken': "https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=" + exports.APPID + "&grant_type=refresh_token&refresh_token=$REFRESH_TOKEN",
    'userinfo': "https://api.weixin.qq.com/sns/userinfo?access_token=$ACCESS_TOKEN&openid=$OPENID&lang=zh_CN",
    'unifiedorder': 'https://api.mch.weixin.qq.com/pay/unifiedorder'
};
exports.TRADE_TYPE = {
    JSAPI: 'JSAPI',
    NATIVE: 'NATIVE',
    APP: 'APP',
    MWEB: 'MWEB',
    MICROPAY: 'MICROPAY' //付款码支付(付款码支付有单独的支付接口)
};
