
const express = require('express');
const pool = require('../config/database');
const { authorize, authorizeWithFiltering } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RoomUtilization:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         building:
 *           type: string
 *         floor:
 *           type: integer
 *         capacity:
 *           type: integer
 *         total_bookings:
 *           type: integer
 *         total_hours:
 *           type: number
 *         avg_booking_duration:
 *           type: number
 *     BookingStats:
 *       type: object
 *       properties:
 *         overview:
 *           type: object
 *           properties:
 *             total_bookings:
 *               type: integer
 *             confirmed_bookings:
 *               type: integer
 *             cancelled_bookings:
 *               type: integer
 *             upcoming_bookings:
 *               type: integer
 *         monthly:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *               bookings_count:
 *                 type: integer
 */

/**
 * @swagger
 * /api/reports/room-utilization:
 *   get:
 *     summary: Get room utilization report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report (defaults to 2024-01-01)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report (defaults to 2024-12-31)
 *     responses:
 *       200:
 *         description: Room utilization data
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
 *                     $ref: '#/components/schemas/RoomUtilization'
 */
router.get('/room-utilization', authorizeWithFiltering('admin', 'lecturer', 'maintenance'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { role, userId } = req.userContext;

    // Test database connection first
    await pool.execute('SELECT 1');
    console.log('Database connection test successful for reports');
    
    let query = `
      SELECT 
        r.id, r.name, COALESCE(r.building, 'N/A') as building, COALESCE(r.floor, 0) as floor, r.capacity,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(TIMESTAMPDIFF(HOUR, b.start_time, b.end_time)), 0) as total_hours,
        COALESCE(AVG(TIMESTAMPDIFF(HOUR, b.start_time, b.end_time)), 0) as avg_booking_duration
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id 
        AND b.status = 'confirmed'
        AND b.start_time >= ? 
        AND b.end_time <= ?
    `;

    let params = [startDate || '2024-01-01', endDate || '2024-12-31'];

    // Filter data based on user role
    if (role === 'lecturer') {
      query += ` AND (b.user_id = ? OR b.user_id IS NULL)`;
      params.push(userId);
    } else if (role === 'maintenance') {
      // Maintenance can see all room data for their work
      // No additional filtering needed
    }

    query += ` GROUP BY r.id ORDER BY total_bookings DESC`;

    const [data] = await pool.execute(query, params);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Room utilization report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
});

/**
 * @swagger
 * /api/reports/booking-stats:
 *   get:
 *     summary: Get booking statistics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BookingStats'
 */
router.get('/booking-stats', authorizeWithFiltering('admin', 'lecturer', 'maintenance'), async (req, res) => {
  try {
    const { role, userId } = req.userContext;
    
    let whereClause = '';
    let params = [];
    
    // Filter based on user role
    if (role === 'lecturer') {
      whereClause = 'WHERE user_id = ?';
      params = [userId];
    } else if (role === 'maintenance') {
      // Maintenance sees all bookings (they need full system view)
      whereClause = '';
      params = [];
    }

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN start_time > NOW() THEN 1 END) as upcoming_bookings
      FROM bookings
      ${whereClause}
    `, params);

    const [monthlyStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as bookings_count
      FROM bookings
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      ${whereClause ? (whereClause.includes('WHERE') ? 'AND user_id = ?' : 'WHERE user_id = ?') : ''}
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `, role === 'lecturer' ? [userId] : []);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        monthly: monthlyStats
      }
    });
  } catch (error) {
    console.error('Booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate statistics'
    });
  }
});

/**
 * @swagger
 * /api/reports/user-activity:
 *   get:
 *     summary: Get user activity report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activity data
 */
router.get('/user-activity', authorizeWithFiltering('admin', 'lecturer', 'maintenance'), async (req, res) => {
  try {
    const { role, userId } = req.userContext;
    
    let query = `
      SELECT 
        u.id, u.name, u.email, u.role,
        COUNT(b.id) as total_bookings,
        COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
        MAX(b.created_at) as last_booking_date
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
    `;

    let params = [];

    // Filter based on user role
    if (role === 'lecturer') {
      query += ` WHERE u.id = ?`;
      params = [userId];
    } else if (role === 'maintenance') {
      // Maintenance can see all users for system maintenance purposes
      // No additional filtering needed
    }

    query += ` GROUP BY u.id ORDER BY total_bookings DESC`;

    const [data] = await pool.execute(query, params);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('User activity report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate user activity report'
    });
  }
});

module.exports = router;
