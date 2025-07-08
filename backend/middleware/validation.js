
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors occurred:', errors.array());
    console.log('Request body:', req.body);
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  handleValidationErrors
];

const validateRegister = [
  body('name').isLength({ min: 2 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'lecturer', 'maintenance']),
  handleValidationErrors
];

const validateBooking = [
  body('roomId')
    .isInt({ min: 1 })
    .withMessage('Room ID must be a positive integer'),
  body('title')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long')
    .trim(),
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 datetime')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid start time format');
      }
      return true;
    }),
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 datetime')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startTime);
      const endDate = new Date(value);
      
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end time format');
      }
      
      if (endDate <= startDate) {
        throw new Error('End time must be after start time');
      }
      
      return true;
    }),
  body('recurring')
    .optional()
    .isBoolean()
    .withMessage('Recurring must be a boolean value'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  handleValidationErrors
];

const validateRoom = [
  body('name').isLength({ min: 2 }).trim(),
  body('capacity').isInt({ min: 1 }),
  body('building').isLength({ min: 1 }).trim(),
  body('floor').isInt({ min: 0 }),
  body('resources').optional().isArray(),
  handleValidationErrors
];

const validateMaintenanceRequest = [
  body('roomId').isInt(),
  body('issue').isLength({ min: 5 }).trim(),
  body('priority').isIn(['low', 'medium', 'high']),
  body('description').optional().trim(),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validateBooking,
  validateRoom,
  validateMaintenanceRequest,
  handleValidationErrors
};
