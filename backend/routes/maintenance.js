
const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Get maintenance requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority } = req.query;
    
    // Test database connection first
    await pool.execute('SELECT 1');
    console.log('Database connection test successful for maintenance');
    
    let query = `
      SELECT m.*, r.name as room_name, r.location, u.name as reported_by_name
      FROM maintenance_requests m
      JOIN rooms r ON m.room_id = r.id
      JOIN users u ON m.reported_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND m.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND m.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY m.created_at DESC';

    const [requests] = await pool.execute(query, params);

    // Add mock building/floor data from location
    const processedRequests = requests.map(request => ({
      ...request,
      building: request.location ? request.location.split(',')[0] : 'Unknown',
      floor: request.location ? (request.location.includes('Floor') ? parseInt(request.location.match(/\d+/)?.[0] || '1') : 1) : 1
    }));

    res.json({
      success: true,
      data: processedRequests
    });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance requests'
    });
  }
});

// Create maintenance request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { roomId, issue, priority, description } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO maintenance_requests (room_id, issue, priority, description, reported_by, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [roomId, issue, priority || 'medium', description || null, req.user.id]
    );

    // Update room status to maintenance if high priority
    if (priority === 'high') {
      await pool.execute(
        'UPDATE rooms SET status = "maintenance" WHERE id = ?',
        [roomId]
      );
    }

    const [newRequest] = await pool.execute(
      `SELECT m.*, r.name as room_name, r.location, u.name as reported_by_name
       FROM maintenance_requests m
       JOIN rooms r ON m.room_id = r.id
       JOIN users u ON m.reported_by = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    // Add mock building/floor data from location
    const processedRequest = {
      ...newRequest[0],
      building: newRequest[0].location ? newRequest[0].location.split(',')[0] : 'Unknown',
      floor: newRequest[0].location ? (newRequest[0].location.includes('Floor') ? parseInt(newRequest[0].location.match(/\d+/)?.[0] || '1') : 1) : 1
    };

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: processedRequest
    });
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create maintenance request'
    });
  }
});

// Update maintenance request status (maintenance staff only)
router.put('/:id', authenticateToken, authorize('maintenance', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const [result] = await pool.execute(
      `UPDATE maintenance_requests 
       SET status = ?, notes = ?, 
           completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE completed_at END,
           updated_at = NOW()
       WHERE id = ?`,
      [status, notes || null, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    // Update room status if maintenance is completed
    if (status === 'completed') {
      const [request] = await pool.execute(
        'SELECT room_id FROM maintenance_requests WHERE id = ?',
        [id]
      );
      
      if (request.length > 0) {
        await pool.execute(
          'UPDATE rooms SET status = "available" WHERE id = ?',
          [request[0].room_id]
        );
      }
    }

    res.json({
      success: true,
      message: 'Maintenance request updated successfully'
    });
  } catch (error) {
    console.error('Update maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update maintenance request'
    });
  }
});

module.exports = router;
