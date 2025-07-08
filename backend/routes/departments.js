
const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the department
 *         name:
 *           type: string
 *           description: Department name
 *         description:
 *           type: string
 *           description: Department description
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of departments
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
 *                     $ref: '#/components/schemas/Department'
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [departments] = await pool.execute(
      'SELECT * FROM departments ORDER BY name'
    );

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments'
    });
  }
});

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a new department (Admin only)
 *     tags: [Departments]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created successfully
 */
router.post('/', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name.trim(), description || null]
    );

    const [newDepartment] = await pool.execute(
      'SELECT * FROM departments WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: newDepartment[0]
    });
  } catch (error) {
    console.error('Create department error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Department name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create department'
    });
  }
});

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update a department (Admin only)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Department updated successfully
 */
router.put('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required'
      });
    }

    const [result] = await pool.execute(
      'UPDATE departments SET name = ?, description = ?, updated_at = NOW() WHERE id = ?',
      [name.trim(), description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const [updatedDepartment] = await pool.execute(
      'SELECT * FROM departments WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment[0]
    });
  } catch (error) {
    console.error('Update department error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Department name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update department'
    });
  }
});

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete a department (Admin only)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       400:
 *         description: Cannot delete department with users
 *       404:
 *         description: Department not found
 */
router.delete('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check for existing users in this department
    const [users] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE department_id = ?',
      [id]
    );

    if (users[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with existing users'
      });
    }

    const [result] = await pool.execute('DELETE FROM departments WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete department'
    });
  }
});

module.exports = router;
