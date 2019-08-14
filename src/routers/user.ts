import multer from 'multer';
import bcrypt from 'bcryptjs';
import express, { Request, Response } from 'express';
import sharp from 'sharp';
import { auth } from '../middleware/auth';
import User, {
  findByCredentials,
  generateAuthToken,
  preSave
} from '../models/user';
import { sendWelcomeEmail, sendCancelationEmail } from '../emails/account';

const router = express.Router();

interface RequestCustom extends Request {
  user?: {
    tokens: { token: string }[];
    _id: number;
    token?: string;
    name?: string;
    email?: string;
    password?: string;
    age?: number;
    avatar?: Buffer;
  };
  token?: string;
}

router.post('/users', async (req: Request, res: Response) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 8);
    const user = new User(req.body);
    await user.save();
    sendWelcomeEmail(user.toJSON().email, user.toJSON().name);
    const token = await generateAuthToken(user);
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/login', async (req: Request, res: Response) => {
  try {
    const user = await findByCredentials(req.body.email, req.body.password);
    const token = await generateAuthToken(user);
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post(
  '/users/logout',
  auth,
  async (req: RequestCustom, res: Response) => {
    if (req.user) {
      try {
        req.user.tokens = req.user.tokens.filter(
          token => token.token !== req.token
        );
        const newUser = new User(req.user);
        await newUser.save();

        res.send();
      } catch (e) {
        res.status(500).send();
      }
    }
  }
);

router.post(
  '/users/logoutAll',
  auth,
  async (req: RequestCustom, res: Response) => {
    if (req.user) {
      try {
        req.user.tokens = [];
        const newUser = new User(req.user);
        await newUser.save();
        res.send();
      } catch (e) {
        res.status(500).send();
      }
    }
  }
);

router.get('/users/me', auth, async (req: RequestCustom, res: Response) => {
  res.send(req.user);
});

router.patch('/users/me', auth, async (req: RequestCustom, res: Response) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/users/me', auth, async (req: RequestCustom, res: Response) => {
  if (req.user) {
    try {
      const currentUser = new User(req.user);
      await currentUser.remove();
      const { email } = req.user;
      const { name } = req.user;
      if (typeof email === 'string' && typeof name === 'string') {
        sendCancelationEmail(email, name);
      }
      res.send(req.user);
    } catch (e) {
      res.status(500).send();
    }
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'), false);
    }

    cb(null, true);
  }
});

router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req: RequestCustom, res: Response) => {
    const buffer = await sharp(req.file.buffer)
      .resize(null, null, { width: 250, height: 250 })
      .png()
      .toBuffer();
    if (req.user) {
      req.user.avatar = buffer;
      const updatedUser = new User(req.user);
      await updatedUser.save();
      res.send();
    }
  },
  (error: { message: string }, req: Request, res: Response) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete(
  '/users/me/avatar',
  auth,
  async (req: RequestCustom, res: Response) => {
    if (req.user) {
      req.user.avatar = undefined;
      const currentUser = new User(req.user);
      await currentUser.save();
      res.send();
    }
  }
);

router.get('/users/:id/avatar', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !JSON.parse(user.toString()).avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(JSON.parse(user.toString()).avatar);
  } catch (e) {
    res.status(404).send();
  }
});

export default router;
