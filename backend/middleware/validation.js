
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
  body('roomId').isInt(),
  body('title').isLength({ min: 3 }).trim(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('description').optional().trim(),
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
