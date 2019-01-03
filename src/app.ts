require('module-alias/register');
import * as express from 'express';

import { router as wx } from '@api/wx/wx';

const app: express.Application = express();
app.use('/wx', wx);

app.listen(8000, function () {
  console.log('app is running on port:8000');
});