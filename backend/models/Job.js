const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a job title']
  },
  company: {
    type: String,
    required: [true, 'Please add a company name']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  experience: {
    type: String,
    required: [true, 'Please add experience requirements']
  },
  employmentType: {
    type: String,
    required: [true, 'Please add employment type'],
    enum: ['Full-Time', 'Intern', 'Freelancer'],
    default: 'Full-Time'
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  requiredSkills: [{
    type: String,
    required: [true, 'Please add at least one required skill']
  }],
  applicationDeadline: {
    type: Date,
    required: [true, 'Please add an application deadline']
  },
  salaryRange: {
    type: String,
    required: [true, 'Please add a salary range']
  },
  preferredQualifications: {
    type: String,
    required: [true, 'Please add preferred qualifications']
  },
  requiredQualifications: {
    type: String,
    required: [true, 'Please add required qualifications']
  },
  responsibilities: {
    type: String,
    required: [true, 'Please add responsibilities']
  },
  hiringName: {
    type: String,
    required: [true, 'Please add hiring manager name']
  },
  hiringEmail: {
    type: String,
    required: [true, 'Please add hiring manager email']
  },
  hiringLinkedin: {
    type: String,
    required: [true, 'Please add hiring manager LinkedIn URL']
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const mongooseModel = mongoose.model('Job', JobSchema);
let mockModel;

const getModel = () => {
  return global.useMockDb
    ? (mockModel || (mockModel = require('../utils/mockDb').createMockModel('jobs')))
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
