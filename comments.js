// Create web server
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import Models
const Comment = require('../models/Comment');
const User = require('../models/User');

// Import Middleware
const auth = require('../middleware/auth');

// @route   GET api/comments
// @desc    Get all comments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ date: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: Get all comments failed');
  }
});

// @route   GET api/comments/:id
// @desc    Get comment by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: Get comment by ID failed');
  }
});

// @route   POST api/comments
// @desc    Create a comment
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('text', 'Text is required').not().isEmpty(),
      check('author', 'Author is required').not().isEmpty(),
      check('authorEmail', 'Author email is required').not().isEmpty(),
      check('authorEmail', 'Author email is invalid').isEmail(),
      check('authorId', 'Author ID is required').not().isEmpty(),
      check('postId', 'Post ID is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // Bad request
    }

    // Create comment object
    const {
      title,
      text,
      author,
      authorEmail,
      authorId,
      postId,
      date,
    } = req.body;
    const commentFields = {