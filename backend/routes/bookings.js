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
 *         room_id:
 *           type: integer
 *           description: ID of the booked room
 *         room_name:
 *           type: string
 *           description: Name of the booked room
 *         building:
 *           type: string
 *           description: Building name
 *         floor:
 *           type: integer
 *           description: Floor number
 *         user_id:
 *           type: integer
 *           description: ID of the user who made the booking
 *         user_name:
 *           type: string
 *           description: Name of the user who made the booking
 *         title:
 *           type: string
 *           description: Booking title/purpose
 *         description:
 *           type: string
 *           description: Booking description
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: Booking start time
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: Booking end time
 *         recurring:
 *           type: boolean
 *           description: Whether this is a recurring booking
 *         status:
 *           type: string
 *           enum: [confirmed, pending, cancelled]
 *           description: Booking status
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 */
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const [bookings] = await pool.execute(
      `SELECT b.*, r.name as room_name, r.building, r.floor 
       FROM bookings b 
       JOIN rooms r ON b.room_id = r.id 
       WHERE b.user_id = ? 
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
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmed, pending, cancelled]
 *         description: Filter by booking status
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: integer
 *         description: Filter by room ID
 *     responses:
 *       200:
 *         description: List of all bookings
 */
router.get('/', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { status, room_id } = req.query;
    
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
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
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
 *               - roomId
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               roomId:
 *                 type: integer
 *               title:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               recurring:
 *                 type: boolean
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Room is not available during the selected time
 */
router.post('/', authenticateToken, validateBooking, async (req, res) => {
  try {
    const { roomId, title, startTime, endTime, recurring, description } = req.body;

    // Check room availability
    const [conflicts] = await pool.execute(
      `SELECT id FROM bookings 
       WHERE room_id = ? AND status = 'confirmed' 
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               roomId:
 *                 type: integer
 *               title:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               recurring:
 *                 type: boolean
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Room is not available during the selected time
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Booking not found
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

    // Check room availability (excluding current booking)
    const [conflicts] = await pool.execute(
      `SELECT id FROM bookings 
       WHERE room_id = ? AND status = 'confirmed' AND id != ?
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
 *     summary: Cancel a booking
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
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Booking not found
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

module.exports = router;
