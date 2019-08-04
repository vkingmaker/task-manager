import express from 'express';
import logger from 'morgan';
import User from './models/user';
import Task from './models/task';
import './db/mongoose';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger('dev'));

app.post('/users', (req, res) => {
  const user = new User(req.body);

  user.save().then(() => {
    res.status(201).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.post('/tasks', (req, res) => {
  const task = new Task(req.body);

  task.save().then(() => {
    res.status(201).send(task);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server is up and running at ${PORT}`);
});
