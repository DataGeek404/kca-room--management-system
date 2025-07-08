
const express = require('express');
const pool = require('../config/database');
const { authorize } = require('../middleware/auth');

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
 *     summary: Get room utilization report (Admin only)
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
router.get('/room-utilization', authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [data] = await pool.execute(
      `SELECT 
         r.id, r.name, r.building, r.floor, r.capacity,
         COUNT(b.id) as total_bookings,
         COALESCE(SUM(TIMESTAMPDIFF(HOUR, b.start_time, b.end_time)), 0) as total_hours,
         COALESCE(AVG(TIMESTAMPDIFF(HOUR, b.start_time, b.end_time)), 0) as avg_booking_duration
       FROM rooms r
       LEFT JOIN bookings b ON r.id = b.room_id 
         AND b.status = 'confirmed'
         AND b.start_time >= ? 
         AND b.end_time <= ?
       GROUP BY r.id
       ORDER BY total_bookings DESC`,
      [startDate || '2024-01-01', endDate || '2024-12-31']
    );

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
 *     summary: Get booking statistics (Admin only)
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
router.get('/booking-stats', authorize('admin'), async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN start_time > NOW() THEN 1 END) as upcoming_bookings
      FROM bookings
    `);

    const [monthlyStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as bookings_count
      FROM bookings
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

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
 *     summary: Get user activity report (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activity data
 */
router.get('/user-activity', authorize('admin'), async (req, res) => {
  try {
    const [data] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.role,
        COUNT(b.id) as total_bookings,
        COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
        MAX(b.created_at) as last_booking_date
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      GROUP BY u.id
      ORDER BY total_bookings DESC
    `);

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
