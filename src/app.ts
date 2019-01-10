require('module-alias/register');
import * as express from 'express';
import * as session from 'express-session';
import * as cors from 'cors';
import * as connectRedis from 'connect-redis';
const RedisStore = connectRedis(session);

import { router as wx } from '@api/wx/wx';
import { router as sunnyhouse } from '@api/sunnyhouse/sunnyhouse';

const options = {
  host: 'localhost',
  port: 6379,
  logErrors: error => console.warn('redis log', error),
};
const app: express.Application = express();
const expires = 10 * 60 * 1000;
app.use(session({
  name: 'pspjjc',
  secret: 'gdufs',
  resave: false,
  saveUninitialized: false,
  store: new RedisStore(options),
  cookie: { expires: new Date(Date.now() + expires), maxAge: expires }
}));

// 跨域调用
let whitelist = ['http://localhost:8001', 'http://sunnyhouse.chenxiaofeng.vip'];
let corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS' + origin));
    }
  }
};
app.use(cors(corsOptions));
// app.use(cors());

app.use('/wx', wx);
app.use('/sunnyhouse', sunnyhouse);

app.listen(8000, function () {
  console.log('app is running on port:8000');
});