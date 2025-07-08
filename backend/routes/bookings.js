
const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

const router = express.Router();

// Get user bookings
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

// Create new booking
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

// Cancel booking
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
