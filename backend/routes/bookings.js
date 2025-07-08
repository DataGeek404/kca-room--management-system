
const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - roomId
 *         - title
 *         - startTime
 *         - endTime
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the booking
 *           example: 1
 *         room_id:
 *           type: integer
 *           description: ID of the booked room
 *           example: 5
 *         room_name:
 *           type: string
 *           description: Name of the booked room
 *           example: "Conference Room A"
 *         building:
 *           type: string
 *           description: Building name
 *           example: "Main Building"
 *         floor:
 *           type: integer
 *           description: Floor number
 *           example: 2
 *         user_id:
 *           type: integer
 *           description: ID of the user who made the booking
 *           example: 10
 *         user_name:
 *           type: string
 *           description: Name of the user who made the booking
 *           example: "John Doe"
 *         title:
 *           type: string
 *           description: Booking title/purpose
 *           example: "Team Meeting"
 *         description:
 *           type: string
 *           description: Booking description
 *           example: "Weekly team sync meeting"
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: Booking start time
 *           example: "2024-01-15T09:00:00.000Z"
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: Booking end time
 *           example: "2024-01-15T10:00:00.000Z"
 *         recurring:
 *           type: boolean
 *           description: Whether this is a recurring booking
 *           example: false
 *         status:
 *           type: string
 *           enum: [confirmed, pending, cancelled, completed]
 *           description: Booking status
 *           example: "confirmed"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the booking was created
 *           example: "2024-01-10T08:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the booking was last updated
 *           example: "2024-01-10T08:30:00.000Z"
 *     CreateBookingRequest:
 *       type: object
 *       required:
 *         - roomId
 *         - title
 *         - startTime
 *         - endTime
 *       properties:
 *         roomId:
 *           type: integer
 *           description: ID of the room to book
 *           example: 5
 *         title:
 *           type: string
 *           minLength: 3
 *           description: Booking title/purpose
 *           example: "Team Meeting"
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Booking start time in ISO 8601 format
 *           example: "2024-01-15T09:00:00.000Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Booking end time in ISO 8601 format
 *           example: "2024-01-15T10:00:00.000Z"
 *         recurring:
 *           type: boolean
 *           description: Whether this is a recurring booking
 *           example: false
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Optional booking description
 *           example: "Weekly team sync meeting"
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the request was successful
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: object
 *           description: Response data
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               param:
 *                 type: string
 *                 example: "roomId"
 *               msg:
 *                 type: string
 *                 example: "Room ID must be a positive integer"
 *               value:
 *                 type: string
 *                 example: "invalid"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Helper function to clean up expired bookings
const cleanupExpiredBookings = async () => {
  try {
    await pool.execute(
      `UPDATE bookings 
       SET status = 'completed', updated_at = NOW() 
       WHERE status = 'confirmed' AND end_time < NOW()`
    );
  } catch (error) {
    console.error('Error cleaning up expired bookings:', error);
  }
};

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get current user's bookings
 *     description: Retrieve all bookings created by the authenticated user (excluding completed bookings)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized - Token required or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    // Clean up expired bookings first
    await cleanupExpiredBookings();
    
    const [bookings] = await pool.execute(
      `SELECT b.*, r.name as room_name, r.building, r.floor 
       FROM bookings b 
       JOIN rooms r ON b.room_id = r.id 
       WHERE b.user_id = ? AND b.status != 'completed'
       ORDER BY b.start_time DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     description: Retrieve all bookings in the system with optional filtering. Only accessible by admin users.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmed, pending, cancelled, completed]
 *         description: Filter bookings by status
 *         example: confirmed
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: integer
 *         description: Filter bookings by room ID
 *         example: 5
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter bookings by user ID
 *         example: 10
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter bookings starting from this date (YYYY-MM-DD)
 *         example: "2024-01-15"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter bookings ending before this date (YYYY-MM-DD)
 *         example: "2024-01-20"
 *     responses:
 *       200:
 *         description: List of all bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized - Token required or invalid
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    // Clean up expired bookings first
    await cleanupExpiredBookings();
    
    const { status, room_id, user_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT b.*, r.name as room_name, r.building, r.floor, u.name as user_name 
      FROM bookings b 
      JOIN rooms r ON b.room_id = r.id 
      JOIN users u ON b.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    if (room_id) {
      query += ' AND b.room_id = ?';
      params.push(room_id);
    }
    if (user_id) {
      query += ' AND b.user_id = ?';
      params.push(user_id);
    }
    if (start_date) {
      query += ' AND DATE(b.start_time) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND DATE(b.end_time) <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY b.start_time DESC';

    const [bookings] = await pool.execute(query, params);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a specific booking by ID
 *     description: Retrieve details of a specific booking. Users can only access their own bookings, admins can access any booking.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized - Token required or invalid
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await pool.execute(
      `SELECT b.*, r.name as room_name, r.building, r.floor, u.name as user_name 
       FROM bookings b 
       JOIN rooms r ON b.room_id = r.id 
       JOIN users u ON b.user_id = u.id 
       WHERE b.id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    // Check permissions: users can only see their own bookings, admins can see all
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Create a new room booking. All authenticated users can create bookings.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *           examples:
 *             basic_booking:
 *               summary: Basic booking example
 *               value:
 *                 roomId: 5
 *                 title: "Team Meeting"
 *                 startTime: "2024-01-15T09:00:00.000Z"
 *                 endTime: "2024-01-15T10:00:00.000Z"
 *                 recurring: false
 *             detailed_booking:
 *               summary: Detailed booking with description
 *               value:
 *                 roomId: 3
 *                 title: "Project Planning Session"
 *                 startTime: "2024-01-16T14:00:00.000Z"
 *                 endTime: "2024-01-16T16:00:00.000Z"
 *                 recurring: true
 *                 description: "Monthly project planning and review session"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Booking created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request - Validation failed or room not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - param: "roomId"
 *                       msg: "Room ID must be a positive integer"
 *                       value: "invalid"
 *               room_unavailable:
 *                 summary: Room not available
 *                 value:
 *                   success: false
 *                   message: "Room is not available during the selected time"
 *       401:
 *         description: Unauthorized - Token required or invalid
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, validateBooking, async (req, res) => {
  try {
    const { roomId, title, startTime, endTime, recurring, description } = req.body;

    // Clean up expired bookings first
    await cleanupExpiredBookings();

    // Check room availability (exclude completed and cancelled bookings)
    const [conflicts] = await pool.execute(
      `SELECT id FROM bookings 
       WHERE room_id = ? AND status IN ('confirmed', 'pending') 
       AND NOT (end_time <= ? OR start_time >= ?)`,
      [roomId, startTime, endTime]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available during the selected time'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO bookings (room_id, user_id, title, start_time, end_time, recurring, description, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [roomId, req.user.id, title, startTime, endTime, recurring || false, description || null]
    );

    const [newBooking] = await pool.execute(
      `SELECT b.*, r.name as room_name, r.building, r.floor, u.name as user_name 
       FROM bookings b 
       JOIN rooms r ON b.room_id = r.id 
       JOIN users u ON b.user_id = u.id 
       WHERE b.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking[0]
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Update a booking
 *     description: Update an existing booking. Users can only update their own bookings, admins can update any booking.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *           examples:
 *             update_booking:
 *               summary: Update booking example
 *               value:
 *                 roomId: 5
 *                 title: "Updated Team Meeting"
 *                 startTime: "2024-01-15T10:00:00.000Z"
 *                 endTime: "2024-01-15T11:30:00.000Z"
 *                 recurring: false
 *                 description: "Updated meeting description"
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Booking updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request - Validation failed or room not available
 *       401:
 *         description: Unauthorized - Token required or invalid
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { roomId, title, startTime, endTime, recurring, description } = req.body;

    // Check if user owns the booking or is admin
    const [existingBookings] = await pool.execute(
      'SELECT user_id FROM bookings WHERE id = ?',
      [id]
    );

    if (existingBookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (existingBookings[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Clean up expired bookings first
    await cleanupExpiredBookings();

    // Check room availability (excluding current booking and completed/cancelled bookings)
    const [conflicts] = await pool.execute(
      `SELECT id FROM bookings 
       WHERE room_id = ? AND status IN ('confirmed', 'pending') AND id != ?
       AND NOT (end_time <= ? OR start_time >= ?)`,
      [roomId, id, startTime, endTime]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available during the selected time'
      });
    }

    const [result] = await pool.execute(
      `UPDATE bookings SET room_id = ?, title = ?, start_time = ?, end_time = ?, 
       recurring = ?, description = ?, updated_at = NOW() WHERE id = ?`,
      [roomId, title, startTime, endTime, recurring || false, description || null, id]
    );

    const [updatedBooking] = await pool.execute(
      `SELECT b.*, r.name as room_name, r.building, r.floor, u.name as user_name 
       FROM bookings b 
       JOIN rooms r ON b.room_id = r.id 
       JOIN users u ON b.user_id = u.id 
       WHERE b.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking[0]
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
    });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete/Cancel a booking
 *     description: Cancel or delete a booking. Users can only cancel their own bookings, admins can cancel any booking. This sets the booking status to 'cancelled' rather than permanently deleting it.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Booking cancelled successfully"
 *       401:
 *         description: Unauthorized - Token required or invalid
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the booking or is admin
    const [bookings] = await pool.execute(
      'SELECT user_id FROM bookings WHERE id = ?',
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (bookings[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    await pool.execute(
      'UPDATE bookings SET status = "cancelled", updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

/**
 * @swagger
 * /api/bookings/admin/hard-delete/{id}:
 *   delete:
 *     summary: Permanently delete a booking (Admin only)
 *     description: Permanently remove a booking from the database. This action cannot be undone. Only available to admin users.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking permanently deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Booking permanently deleted successfully"
 *       401:
 *         description: Unauthorized - Token required or invalid
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.delete('/admin/hard-delete/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking exists
    const [bookings] = await pool.execute(
      'SELECT id FROM bookings WHERE id = ?',
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Permanently delete the booking
    await pool.execute(
      'DELETE FROM bookings WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Booking permanently deleted successfully'
    });
  } catch (error) {
    console.error('Hard delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete booking'
    });
  }
});

/**
 * @swagger
 * /api/bookings/admin/bulk-update:
 *   patch:
 *     summary: Bulk update booking status (Admin only)
 *     description: Update the status of multiple bookings at once. Only available to admin users.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingIds
 *               - status
 *             properties:
 *               bookingIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of booking IDs to update
 *                 example: [1, 2, 3]
 *               status:
 *                 type: string
 *                 enum: [confirmed, pending, cancelled, completed]
 *                 description: New status for the bookings
 *                 example: "cancelled"
 *           examples:
 *             bulk_cancel:
 *               summary: Bulk cancel bookings
 *               value:
 *                 bookingIds: [1, 2, 3]
 *                 status: "cancelled"
 *     responses:
 *       200:
 *         description: Bookings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "3 bookings updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCount:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Token required or invalid
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Internal server error
 */
router.patch('/admin/bulk-update', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { bookingIds, status } = req.body;

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'bookingIds must be a non-empty array'
      });
    }

    if (!['confirmed', 'pending', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Create placeholders for the IN clause
    const placeholders = bookingIds.map(() => '?').join(',');
    
    const [result] = await pool.execute(
      `UPDATE bookings SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [status, ...bookingIds]
    );

    res.json({
      success: true,
      message: `${result.affectedRows} bookings updated successfully`,
      data: {
        updatedCount: result.affectedRows
      }
    });
  } catch (error) {
    console.error('Bulk update bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bookings'
    });
  }
});

module.exports = router;
