
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'lecturer', 'maintenance'])
    .withMessage('Invalid role specified'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateRoom = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Room name is required and must be less than 100 characters'),
  body('capacity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be between 1 and 1000'),
  body('building')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Building is required'),
  body('floor')
    .isInt({ min: 0, max: 50 })
    .withMessage('Floor must be between 0 and 50'),
  handleValidationErrors
];

const validateBooking = [
  body('roomId')
    .isInt({ min: 1 })
    .withMessage('Valid room ID is required'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('startTime')
    .isISO8601()
    .withMessage('Valid start time is required'),
  body('endTime')
    .isISO8601()
    .withMessage('Valid end time is required'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateRoom,
  validateBooking,
  handleValidationErrors
};
