
const express = require('express');
const pool = require('../config/database');
const { authorize, authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the department
 *         name:
 *           type: string
 *           description: Department name
 *         code:
 *           type: string
 *           description: Department code
 *         description:
 *           type: string
 *           description: Department description
 *         head_of_department:
 *           type: string
 *           description: Head of department name
 *         contact_email:
 *           type: string
 *           format: email
 *           description: Department contact email
 *         contact_phone:
 *           type: string
 *           description: Department contact phone
 *         building:
 *           type: string
 *           description: Building location
 *         floor:
 *           type: integer
 *           description: Floor number
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Department status
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
 *         description: List of all departments
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
      'SELECT * FROM departments ORDER BY name ASC'
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
 * /api/departments/{id}:
 *   get:
 *     summary: Get department by ID
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
 *         description: Department details
 *       404:
 *         description: Department not found
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [departments] = await pool.execute(
      'SELECT * FROM departments WHERE id = ?',
      [id]
    );

    if (departments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: departments[0]
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department'
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
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               head_of_department:
 *                 type: string
 *               contact_email:
 *                 type: string
 *                 format: email
 *               contact_phone:
 *                 type: string
 *               building:
 *                 type: string
 *               floor:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { 
      name, 
      code, 
      description, 
      head_of_department, 
      contact_email, 
      contact_phone, 
      building, 
      floor 
    } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required'
      });
    }

    // Check if code already exists
    const [existingDepartments] = await pool.execute(
      'SELECT id FROM departments WHERE code = ?',
      [code]
    );

    if (existingDepartments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Department code already exists'
      });
    }

    // Create department
    const [result] = await pool.execute(
      `INSERT INTO departments (name, code, description, head_of_department, contact_email, contact_phone, building, floor, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, code, description || null, head_of_department || null, contact_email || null, contact_phone || null, building || null, floor || null, 'active']
    );

    // Get the created department
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
 *     summary: Update department (Admin only)
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
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               head_of_department:
 *                 type: string
 *               contact_email:
 *                 type: string
 *                 format: email
 *               contact_phone:
 *                 type: string
 *               building:
 *                 type: string
 *               floor:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       404:
 *         description: Department not found
 */
router.put('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      code, 
      description, 
      head_of_department, 
      contact_email, 
      contact_phone, 
      building, 
      floor,
      status 
    } = req.body;

    // Check if department exists
    const [existingDepartments] = await pool.execute(
      'SELECT id FROM departments WHERE id = ?',
      [id]
    );

    if (existingDepartments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if code already exists for another department
    if (code) {
      const [duplicateCode] = await pool.execute(
        'SELECT id FROM departments WHERE code = ? AND id != ?',
        [code, id]
      );

      if (duplicateCode.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Department code already exists'
        });
      }
    }

    // Update department
    const [result] = await pool.execute(
      `UPDATE departments SET 
       name = COALESCE(?, name),
       code = COALESCE(?, code),
       description = ?,
       head_of_department = ?,
       contact_email = ?,
       contact_phone = ?,
       building = ?,
       floor = ?,
       status = COALESCE(?, status),
       updated_at = NOW()
       WHERE id = ?`,
      [name, code, description, head_of_department, contact_email, contact_phone, building, floor, status, id]
    );

    // Get updated department
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
 *     summary: Delete department (Admin only)
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
 *         description: Cannot delete department with associated rooms
 *       404:
 *         description: Department not found
 */
router.delete('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department has associated rooms
    const [rooms] = await pool.execute(
      'SELECT COUNT(*) as count FROM rooms WHERE department_id = ?',
      [id]
    );

    if (rooms[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with associated rooms'
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
