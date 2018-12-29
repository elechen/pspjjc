require('module-alias/register');
import * as express from 'express';

import { router as authtoken } from '@api/authtoken';
import { router as textmsg } from '@api/textmsg';

const app: express.Application = express();
if(process.env.WX_TOKEN){
  app.use('/wechat', authtoken);
}else{
  app.use('/wechat', textmsg);
}

app.listen(8000, function () {
  console.log('app is running on port 8000', process.env.WX_TOKEN);
})