const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter'],
    required: [true, 'Please specify a role']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const mongooseModel = mongoose.model('User', UserSchema);
let mockModel;

const getModel = () => {
  return global.useMockDb
    ? (mockModel || (mockModel = require('../utils/mockDb').createMockModel('users')))
    : mongooseModel;
};

module.exports = new Proxy(mongooseModel, {
  get: function (target, name) {
    const activeModel = getModel();
    const val = activeModel[name];
    if (typeof val === 'function') {
      return val.bind(activeModel);
    }
    return val;
  },
  construct: function (target, args) {
    const activeModel = getModel();
    return new activeModel(...args);
  }
});
