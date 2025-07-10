const express = require('express');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const WeeklyUpload = require('../models/WeeklyUpload');
const Project = require('../models/Project');
const { auth, authorize, checkProjectAccess } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/uploads/:projectId
// @desc    Get all uploads for a project
// @access  Private (Student/Faculty)
router.get('/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'student' && project.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'faculty' && project.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const uploads = await WeeklyUpload.find({ project: projectId })
      .sort({ week: 1 });

    res.json({
      success: true,
      uploads
    });

  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching uploads'
    });
  }
});

// @route   POST /api/uploads
// @desc    Create new weekly upload
// @access  Private (Student)
router.post('/', auth, authorize('student'), upload.array('files', 5), handleMulterError, [
  body('project').isMongoId().withMessage('Valid project ID is required'),
  body('week').isInt({ min: 1 }).withMessage('Week must be a positive integer'),
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { project, week, title, description } = req.body;

    // Verify project exists and belongs to student
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (projectDoc.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: not your project'
      });
    }

    // Check if upload for this week already exists
    const existingUpload = await WeeklyUpload.findOne({
      project: project,
      week: parseInt(week)
    });

    if (existingUpload) {
      return res.status(400).json({
        success: false,
        message: `Upload for week ${week} already exists`
      });
    }

    // Process uploaded files
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path
    })) : [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one file is required'
      });
    }

    // Create upload record
    const weeklyUpload = new WeeklyUpload({
      project,
      student: req.user._id,
      week: parseInt(week),
      title,
      description,
      files
    });

    await weeklyUpload.save();

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      upload: weeklyUpload
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
});

// @route   PUT /api/uploads/:id
// @desc    Update weekly upload
// @access  Private (Student/Faculty)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('feedback').optional().isLength({ max: 500 }).withMessage('Feedback cannot exceed 500 characters'),
  body('grade').optional().isIn(['Excellent', 'Good', 'Average', 'Below Average', 'Poor']).withMessage('Invalid grade'),
  body('status').optional().isIn(['pending', 'reviewed', 'approved', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const upload = await WeeklyUpload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Check permissions
    const project = await Project.findById(upload.project);
    if (req.user.role === 'student' && project.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'faculty' && project.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = { ...req.body };

    // Faculty can only update review-related fields
    if (req.user.role === 'faculty') {
      const allowedFields = ['feedback', 'grade', 'status'];
      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });
      updateData = filteredData;
      
      // Add review information
      if (Object.keys(updateData).length > 0) {
        updateData.reviewedBy = req.user._id;
        updateData.reviewedAt = new Date();
      }
    }

    // Students can only update title and description (before review)
    if (req.user.role === 'student') {
      if (upload.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update upload after review'
        });
      }
      
      const allowedFields = ['title', 'description'];
      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });
      updateData = filteredData;
    }

    const updatedUpload = await WeeklyUpload.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Upload updated successfully',
      upload: updatedUpload
    });

  } catch (error) {
    console.error('Update upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating upload'
    });
  }
});

// @route   DELETE /api/uploads/:id
// @desc    Delete weekly upload
// @access  Private (Student/Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const upload = await WeeklyUpload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Check permissions
    if (req.user.role === 'student') {
      const project = await Project.findById(upload.project);
      if (project.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Students can only delete pending uploads
      if (upload.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete reviewed uploads'
        });
      }
    }

    // Delete associated files
    upload.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    await WeeklyUpload.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Upload deleted successfully'
    });

  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting upload'
    });
  }
});

// @route   GET /api/uploads/download/:filename
// @desc    Download uploaded file
// @access  Private
router.get('/download/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Find upload containing this file
    const upload = await WeeklyUpload.findOne({
      'files.filename': filename
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check permissions
    const project = await Project.findById(upload.project);
    if (req.user.role === 'student' && project.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'faculty' && project.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the file in the upload
    const file = upload.files.find(f => f.filename === filename);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found in upload'
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set appropriate headers and send file
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.sendFile(path.resolve(file.path));

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during download'
    });
  }
});

module.exports = router;