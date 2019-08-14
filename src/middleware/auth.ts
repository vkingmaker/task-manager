import jwt from 'jsonwebtoken';
import User from '../models/user';
import { NextFunction, Request, Response } from 'express';

interface RequestCustom extends Request {
  user?: {
    tokens?: { token: string }[];
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

export const auth = async (
  req: RequestCustom,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string = '' + req.header('Authorization');
    if (token && typeof token === 'string') {
      token = token.replace('Bearer ', '');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET + '');
    const _id = decoded;
    if (typeof _id === 'string') {
      const user = await User.findOne({
        _id,
        'tokens.token': token
      });

      if (!user) {
        throw new Error();
      }

      console.log(user);

      req.token = token;
      req.user = user;
      next();
    }
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};
