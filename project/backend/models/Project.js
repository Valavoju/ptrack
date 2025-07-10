const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  abstract: {
    type: String,
    required: [true, 'Project abstract is required'],
    trim: true,
    maxlength: [1000, 'Abstract cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Project type is required'],
    enum: ['RTP', 'Mini', 'Major']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Mentor is required']
  },
  branch: {
    type: String,
    required: [true, 'Branch is required']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  technologies: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  objectives: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    trim: true
  },
  deploymentUrl: {
    type: String,
    trim: true
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', '']
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ student: 1 });
projectSchema.index({ mentor: 1 });
projectSchema.index({ branch: 1, type: 1 });
projectSchema.index({ status: 1 });

// Populate student and mentor information
projectSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'student',
    select: 'name email studentId year'
  }).populate({
    path: 'mentor',
    select: 'name email'
  });
  next();
});

module.exports = mongoose.model('Project', projectSchema);