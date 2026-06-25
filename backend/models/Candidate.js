const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  from: { type: Date, required: true },
  to: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String }
});

const ExperienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  from: { type: Date, required: true },
  to: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String }
});

const CandidateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  bio: {
    type: String
  },
  linkedin: {
    type: String
  },
  gmail: {
    type: String
  },
  website: {
    type: String
  },
  github: {
    type: String
  },
  skills: [{
    type: String
  }],
  education: [EducationSchema],
  experience: [ExperienceSchema],
  resume: {
    filename: { type: String },
    filepath: { type: String },
    uploadedAt: { type: Date },
    parsedText: { type: String }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const mongooseModel = mongoose.model('Candidate', CandidateSchema);
let mockModel;

const getModel = () => {
  return global.useMockDb
    ? (mockModel || (mockModel = require('../utils/mockDb').createMockModel('candidates')))
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
