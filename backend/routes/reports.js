
const express = require('express');
const pool = require('../config/database');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Get room utilization report
router.get('/room-utilization', authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [data] = await pool.execute(
      `SELECT 
         r.id, r.name, r.building, r.floor, r.capacity,
         COUNT(b.id) as total_bookings,
         SUM(TIMESTAMPDIFF(HOUR, b.start_time, b.end_time)) as total_hours,
         AVG(TIMESTAMPDIFF(HOUR, b.start_time, b.end_time)) as avg_booking_duration
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

// Get booking statistics
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

module.exports = router;
