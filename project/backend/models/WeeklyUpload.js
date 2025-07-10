const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  }
});

const weeklyUploadSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  week: {
    type: Number,
    required: [true, 'Week number is required'],
    min: [1, 'Week must be at least 1']
  },
  title: {
    type: String,
    required: [true, 'Upload title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  files: [fileSchema],
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected'],
    default: 'pending'
  },
  feedback: {
    type: String,
    maxlength: [500, 'Feedback cannot exceed 500 characters']
  },
  grade: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor', '']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
weeklyUploadSchema.index({ project: 1, week: 1 });
weeklyUploadSchema.index({ student: 1 });
weeklyUploadSchema.index({ status: 1 });

// Compound index to ensure one upload per week per project
weeklyUploadSchema.index({ project: 1, week: 1 }, { unique: true });

// Populate project and student information
weeklyUploadSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'project',
    select: 'title type'
  }).populate({
    path: 'student',
    select: 'name email studentId'
  }).populate({
    path: 'reviewedBy',
    select: 'name email'
  });
  next();
});

module.exports = mongoose.model('WeeklyUpload', weeklyUploadSchema);