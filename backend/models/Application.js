const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'],
    default: 'Applied'
  },
  stage: {
    type: String,
    enum: ['Applied', 'Screened', 'Interviewed', 'Offered', 'Hired'],
    default: 'Applied'
  },
  matchScore: {
    type: Number,
    default: 0
  },
  matchedSkills: [{
    type: String
  }],
  missingSkills: [{
    type: String
  }],
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a candidate can only apply to a job once
ApplicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

const mongooseModel = mongoose.model('Application', ApplicationSchema);
let mockModel;

const getModel = () => {
  return global.useMockDb
    ? (mockModel || (mockModel = require('../utils/mockDb').createMockModel('applications')))
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
