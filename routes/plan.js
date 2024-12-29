var express = require('express');
var router = express.Router();
var { prisma } = require('../config/prisma');
const { body, validationResult } = require('express-validator');

// GET /plans (with pagination)
router.get('/', async function (req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const plans = await prisma.plan.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true,
        duration: true,
        price: true,
        note: true,
        application: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json(plans);
  } catch (error) {
    next(error);
  }
});

// POST /plans
router.post(
  '/',
  [
    body('duration').notEmpty().withMessage('Duration is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be a positive number'),
    body('note').optional().isString().withMessage('Note must be a string'),
    body('applicationId')
      .isInt()
      .withMessage('Application ID is required and must be an integer'),
  ],
  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { duration, price, note, applicationId } = req.body;

      const newPlan = await prisma.plan.create({
        data: {
          duration,
          price: parseFloat(price),
          note,
          applicationId: parseInt(applicationId),
        },
      });

      res.status(201).json({
        message: 'Plan created successfully',
        data: newPlan,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /plans/:id
router.delete('/:id', async function (req, res, next) {
  const { id } = req.params;
  try {
    const deletePlan = await prisma.plan.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: 'Plan deleted successfully',
      data: deletePlan,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
