var express = require('express');
var router = express.Router();
var { prisma } = require('../config/prisma');
var bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

// GET /users (with pagination)
router.get('/', async function (req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// POST /users
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      res.status(201).json({
        message: 'User created successfully',
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', async function (req, res, next) {
  const { id } = req.params;
  try {
    const deleteUser = await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(201).json({
      message: 'User delete successfully',
      data: {
        id: deleteUser.id,
        name: deleteUser.name,
        email: deleteUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
