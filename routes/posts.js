const express = require('express');
const router = express.Router();
const { prisma } = require('../config/prisma');
const { body, validationResult } = require('express-validator');

// Middleware untuk validasi ID
router.param('id', (req, res, next, id) => {
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }
  next();
});

// GET /posts (with pagination)
router.get('/', async function (req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const posts = await prisma.post.findMany({
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

// POST /posts
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('authorId').isInt().withMessage('Author ID must be an integer'),
  ],
  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content, authorId } = req.body;

      const newPost = await prisma.post.create({
        data: { title, content, authorId: parseInt(authorId) },
      });

      res.status(201).json({
        message: 'Post created successfully',
        data: newPost,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /posts/:id
router.put(
  '/:id',
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('content')
      .optional()
      .notEmpty()
      .withMessage('Content cannot be empty'),
    body('published')
      .optional()
      .isBoolean()
      .withMessage('Published must be a boolean'),
  ],
  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { title, content, published } = req.body;

      const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const updatedPost = await prisma.post.update({
        where: { id: parseInt(id) },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(published !== undefined && { published }),
        },
      });

      res.status(200).json({
        message: 'Post updated successfully',
        data: updatedPost,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /posts/:id
router.delete('/:id', async function (req, res, next) {
  const { id } = req.params;
  try {
    const deletePost = await prisma.post.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({
      message: 'Post deleted successfully',
      data: deletePost,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
