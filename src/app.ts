import express from 'express';
import logger from 'morgan';
import userRouter from './routers/user';
import taskRouter from './routers/task';
import './db/mongoose';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger('dev'));

app.use(userRouter);
app.use(taskRouter);

console.log('running');

app.listen(PORT, () => {
  console.log(`server is up and running at ${PORT}`);
});
