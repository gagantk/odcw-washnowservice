const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HttpError = require('./http-error');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    validate(value) {
      if (value <= 0) {
        throw new HttpError('Age must be a positive number', 422);
      }
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new HttpError('Email is invalid', 422);
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true,
  },
  userType: {
    type: String,
    required: true,
    validate(value) {
      if (
        value.toLowerCase() !== 'customer' &&
        value.toLowerCase() !== 'washer'
      ) {
        throw new HttpError(
          'User can be either "customer" or "washer" only',
          422
        );
      }
    },
  },
  cars: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Car' }],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  orders: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order' },
  ],
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new HttpError('Invalid credentials, could not log you in.', 403);
  }
  const isValidPassword = await bcrypt.compare(password, existingUser.password);
  if (!isValidPassword) {
    throw new HttpError('Invalid credentials, could not log you in.', 403);
  }
  return existingUser;
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 12);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
