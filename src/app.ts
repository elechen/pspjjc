import * as express from 'express';
import { router as authtoken } from './api/authtoken';

const app: express.Application = express();
app.use('/authtoken', authtoken);

app.listen(8000, function () {
  console.log('app is running on port 8000');
})