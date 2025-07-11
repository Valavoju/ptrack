const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const { auth, authorize, checkProjectAccess } = require('../middleware/auth');

const router = express.Router();

// Verify roll number route
router.get('/verify-roll/:roll', auth, async (req, res) => {
  try {
    const roll = req.params.roll;
    const student = await User.findOne({ rollNumber: roll, role: 'student' });

    if (student) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Roll verification error:', error);
    res.status(500).json({ exists: false });
  }
});

// @route   GET /api/projects
// @desc    Get all projects (admin only)
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.branch) query.branch = req.query.branch;
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects'
    });
  }
});

// @route   GET /api/projects/student
// @desc    Get student's projects
// @access  Private (Student)
router.get('/student', auth, authorize('student'), async (req, res) => {
  try {
    const projects = await Project.find({ student: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects
    });

  } catch (error) {
    console.error('Get student projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student projects'
    });
  }
});

// @route   GET /api/projects/faculty
// @desc    Get faculty's mentored projects
// @access  Private (Faculty)
router.get('/faculty', auth, authorize('faculty'), async (req, res) => {
  try {
    const projects = await Project.find({ mentor: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects
    });

  } catch (error) {
    console.error('Get faculty projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty projects'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', auth, checkProjectAccess, async (req, res) => {
  try {
    res.json({
      success: true,
      project: req.project
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project'
    });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Student)
router.post('/', auth, authorize('student'), [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('abstract').trim().isLength({ min: 50, max: 1000 }).withMessage('Abstract must be between 50 and 1000 characters'),
  body('type').isIn(['RTP', 'Mini', 'Major']).withMessage('Type must be RTP, Mini, or Major'),
  body('mentor').isMongoId().withMessage('Valid mentor ID is required'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('technologies').optional().isArray().withMessage('Technologies must be an array'),
  body('objectives').optional().isArray().withMessage('Objectives must be an array')
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

    const { title, abstract, type, mentor, description, technologies, objectives, githubUrl, deploymentUrl } = req.body;

    const mentorUser = await User.findById(mentor);
    if (!mentorUser) {
      return res.status(400).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    if (mentorUser.role !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'Selected mentor is not a faculty member'
      });
    }

    if (mentorUser.branch !== req.user.branch) {
      return res.status(400).json({
        success: false,
        message: 'Mentor must be from the same branch'
      });
    }

    const existingProject = await Project.findOne({
      student: req.user._id,
      type: type,
      status: { $in: ['active', 'completed'] }
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${type} project`
      });
    }

    const project = new Project({
      title,
      abstract,
      type,
      student: req.user._id,
      mentor,
      branch: req.user.branch,
      description,
      technologies,
      objectives,
      githubUrl,
      deploymentUrl
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating project'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Student/Faculty)
router.put('/:id', auth, checkProjectAccess, [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('abstract').optional().trim().isLength({ min: 50, max: 1000 }).withMessage('Abstract must be between 50 and 1000 characters'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status').optional().isIn(['active', 'completed', 'paused', 'cancelled']).withMessage('Invalid status')
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

    let updateData = { ...req.body };

    delete updateData.student;
    delete updateData.mentor;
    delete updateData.type;
    delete updateData.branch;

    if (req.user.role === 'faculty') {
      const allowedFields = ['feedback', 'grade', 'status'];
      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });
      updateData = filteredData;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating project'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Student/Admin)
router.delete('/:id', auth, checkProjectAccess, async (req, res) => {
  try {
    if (req.user.role === 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Faculty cannot delete projects'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting project'
    });
  }
});

module.exports = router;
