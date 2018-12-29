require('module-alias/register');
import * as express from 'express';

import { router as mp } from '@api/mp/mp';

const app: express.Application = express();
app.use('/mp', mp);

app.listen(8000, function () {
  console.log('app is running on port:8000');
});