import express from 'express';
import logger from 'morgan';
import './db/mongoose';
import User from './models/user';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger('dev'));

app.post('/users', (req, res) => {
  const user = new User(req.body);

  user.save().then(() => {
    res.send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.listen(PORT, () => {
  console.log(`server is up and running at ${PORT}`);
});
