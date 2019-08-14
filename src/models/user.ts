import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Task from './task';
import { NextFunction } from 'express';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true
    },
    age: {
      type: Number,
      default: 0
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    avatar: {
      type: Buffer
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
});

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};

export const generateAuthToken = async function(user: any) {
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET + ''
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

export const findByCredentials = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  console.log('MODEL');
  console.log(user);
  if (!user) {
    throw new Error('Unable to login');
  }
  console.log(user.toJSON().password);
  const isMatch = await bcrypt.compare(password, user.toJSON().password);

  console.log(isMatch);
  console.log('isMatch');

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next: NextFunction) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

export default User;
