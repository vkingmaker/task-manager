/* eslint-disable no-console */
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

app.get('/users', (req, res) => {
  User.find({}).then((response) => {
    res.status(200).send(response);
  }).catch((e) => {
    res.status(500).send(e);
  });
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;

  User.findById(id).then((user) => {
    if (!user) return res.status(404).send();
    res.send(user);
  }).catch((e) => {
    res.status(500).send(e);
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

app.get('/tasks', (req, res) => {
  Task.find({}).then((tasks) => {
    if (!tasks) return res.status(404).send();

    res.send(tasks);
  }).catch((e) => {
    res.status(500).send();
  });
});

app.get('/tasks/:id', (req, res) => {
  const { id } = req.params;

  Task.findById(id).then((task) => {
    if (!task) return res.status(404).send();

    res.send(task);
  }).catcg((e) => {
    res.status(500).send(e);
  });
});

app.listen(PORT, () => {
  console.log(`server is up and running at ${PORT}`);
});
