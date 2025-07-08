
const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateRoom } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       required:
 *         - name
 *         - capacity
 *         - building
 *         - floor
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the room
 *         name:
 *           type: string
 *           description: The room name/number
 *         capacity:
 *           type: integer
 *           description: Maximum number of people
 *         building:
 *           type: string
 *           description: Building name
 *         floor:
 *           type: integer
 *           description: Floor number
 *         resources:
 *           type: array
 *           items:
 *             type: string
 *           description: Available resources in the room
 *         description:
 *           type: string
 *           description: Room description
 *         status:
 *           type: string
 *           enum: [available, maintenance, occupied]
 *           description: Current room status
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all rooms with optional filters
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: building
 *         schema:
 *           type: string
 *         description: Filter by building
 *       - in: query
 *         name: floor
 *         schema:
 *           type: integer
 *         description: Filter by floor
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: integer
 *         description: Minimum capacity required
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, maintenance, occupied]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in room name or description
 *     responses:
 *       200:
 *         description: List of rooms
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
 *                     $ref: '#/components/schemas/Room'
 */
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

    // Parse resources JSON
    const parsedRooms = rooms.map(room => ({
      ...room,
      resources: room.resources ? JSON.parse(room.resources) : []
    }));

    res.json({
      success: true,
      data: parsedRooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms'
    });
  }
});

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Create a new room (Admin only)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacity
 *               - building
 *               - floor
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               building:
 *                 type: string
 *               floor:
 *                 type: integer
 *               resources:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 */
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

    // Parse resources JSON
    const room = {
      ...newRoom[0],
      resources: newRoom[0].resources ? JSON.parse(newRoom[0].resources) : []
    };

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room'
    });
  }
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Update a room (Admin only)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               building:
 *                 type: string
 *               floor:
 *                 type: integer
 *               resources:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, maintenance, occupied]
 *     responses:
 *       200:
 *         description: Room updated successfully
 */
router.put('/:id', authenticateToken, authorize('admin'), async (req, res) => {
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

    // Parse resources JSON
    const room = {
      ...updatedRoom[0],
      resources: updatedRoom[0].resources ? JSON.parse(updatedRoom[0].resources) : []
    };

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room'
    });
  }
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Delete a room (Admin only)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       400:
 *         description: Cannot delete room with active bookings
 *       404:
 *         description: Room not found
 */
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
