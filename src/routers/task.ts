import express, { Request, Response } from 'express';
import Task from '../models/task';
import { auth } from '../middleware/auth';
import User from '../models/user';
import { MongooseDocument } from 'mongoose';

const router = express.Router();

interface RequestCustom extends Request {
  user?: {
    tokens: { token: string }[];
    _id: number;
    name?: string;
    email?: string;
    password?: string;
    age?: number;
    avatar?: Buffer;
    tasks?: Document;
  };
  token?: string;
}

router.post('/tasks', auth, async (req: RequestCustom, res: Response) => {
  if (req.user) {
    const task = new Task({
      ...req.body,
      owner: req.user._id
    });

    try {
      await task.save();
      res.status(201).send(task);
    } catch (e) {
      res.status(400).send(e);
    }
  }
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req: RequestCustom, res: Response) => {
  const match: { completed?: boolean } = {};
  const sort: { [keys: string]: number } = {};

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }
  if (req.user) {
    try {
      const currentUser = new User(req.user);
      await currentUser
        .populate({
          path: 'tasks',
          match,
          options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
          }
        })
        .execPopulate();
      res.send(req.user.tasks);
    } catch (e) {
      res.status(500).send();
    }
  }
});

router.get('/tasks/:id', auth, async (req: RequestCustom, res: Response) => {
  const _id = req.params.id;
  if (req.user) {
    try {
      const task = await Task.findOne({ _id, owner: req.user._id });

      if (!task) {
        return res.status(404).send();
      }

      return res.send(task);
    } catch (e) {
      return res.status(500).send();
    }
  }
});

router.patch('/tasks/:id', auth, async (req: RequestCustom, res: Response) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }
  if (req.user) {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        owner: req.user._id
      });

      if (!task) {
        return res.status(404).send();
      }
      await task.remove();

      req.body._id = req.params.id;
      req.body.owner = req.params.owner;

      const updatedTask = new Task(req.body);

      await updatedTask.save();
      return res.send(updatedTask);
    } catch (e) {
      return res.status(400).send(e);
    }
  }
});

router.delete('/tasks/:id', auth, async (req: RequestCustom, res: Response) => {
  if (req.user) {
    try {
      const task = await Task.findOneAndDelete({
        _id: req.params.id,
        owner: req.user._id
      });

      if (!task) {
        res.status(404).send();
      }

      res.send(task);
    } catch (e) {
      res.status(500).send();
    }
  }
});

export default router;
