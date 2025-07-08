
const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateRoom } = require('../middleware/validation');

const router = express.Router();

// Get all rooms with optional filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { building, floor, capacity, status, search } = req.query;
    
    let query = `
      SELECT r.*, 
             COUNT(CASE WHEN b.status = 'confirmed' AND b.start_time > NOW() THEN 1 END) as upcoming_bookings
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id
      WHERE 1=1
    `;
    const params = [];

    if (building) {
      query += ' AND r.building = ?';
      params.push(building);
    }
    if (floor) {
      query += ' AND r.floor = ?';
      params.push(floor);
    }
    if (capacity) {
      query += ' AND r.capacity >= ?';
      params.push(capacity);
    }
    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (r.name LIKE ? OR r.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY r.id ORDER BY r.building, r.floor, r.name';

    const [rooms] = await pool.execute(query, params);

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms'
    });
  }
});

// Create new room (admin only)
router.post('/', authenticateToken, authorize('admin'), validateRoom, async (req, res) => {
  try {
    const { name, capacity, building, floor, resources, description } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO rooms (name, capacity, building, floor, resources, description, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [name, capacity, building, floor, JSON.stringify(resources || []), description || null]
    );

    const [newRoom] = await pool.execute(
      'SELECT * FROM rooms WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: newRoom[0]
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room'
    });
  }
});

// Update room (admin only)
router.put('/:id', authenticateToken, authorize('admin'), validateRoom, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, building, floor, resources, description, status } = req.body;

    const [result] = await pool.execute(
      `UPDATE rooms SET name = ?, capacity = ?, building = ?, floor = ?, 
       resources = ?, description = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, capacity, building, floor, JSON.stringify(resources || []), description, status || 'available', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const [updatedRoom] = await pool.execute(
      'SELECT * FROM rooms WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom[0]
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room'
    });
  }
});

// Delete room (admin only)
router.delete('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check for existing bookings
    const [bookings] = await pool.execute(
      'SELECT COUNT(*) as count FROM bookings WHERE room_id = ? AND status = "confirmed" AND start_time > NOW()',
      [id]
    );

    if (bookings[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active bookings'
      });
    }

    const [result] = await pool.execute('DELETE FROM rooms WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room'
    });
  }
});

module.exports = router;
