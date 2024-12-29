var express = require('express');
var router = express.Router();
var { prisma } = require('../config/prisma');
const { body, validationResult } = require('express-validator');

// GET /applications (with pagination)
router.get('/', async function (req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const applications = await prisma.application.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
});

// POST /applications
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
  ],
  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description } = req.body;

      const existingApplication = await prisma.application.findUnique({
        where: { name },
      });
      if (existingApplication) {
        return res
          .status(400)
          .json({ message: 'Application name already exists' });
      }

      const newApplication = await prisma.application.create({
        data: { name, description },
      });

      res.status(201).json({
        message: 'Application created successfully',
        data: newApplication,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /applications/:id
// DELETE /applications/:id
router.delete('/:id', async function (req, res, next) {
  const { id } = req.params;

  try {
    await prisma.plan.deleteMany({
      where: { applicationId: parseInt(id) },
    });

    const deleteApplication = await prisma.application.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: 'Application and related Plans deleted successfully',
      data: deleteApplication,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
