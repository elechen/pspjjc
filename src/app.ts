require('module-alias/register');
import * as express from 'express';
import * as session from 'express-session';
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

app.use('/wx', wx);
app.use('/sunnyhouse/?*', sunnyhouse);
// app.use('/', sunnyhouse);

app.listen(8000, function () {
  console.log('app is running on port:8000');
});