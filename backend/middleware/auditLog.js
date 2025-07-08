
const pool = require('../config/database');

const auditLog = (action, tableName) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAudit(req, action, tableName, data);
      }
      originalSend.call(this, data);
    };
    
    next();
  };
};

const logAudit = async (req, action, tableName, responseData) => {
  try {
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    let recordId = null;
    let newValues = null;
    
    // Extract record ID and new values from response
    if (responseData && typeof responseData === 'string') {
      try {
        const parsed = JSON.parse(responseData);
        if (parsed.data && parsed.data.id) {
          recordId = parsed.data.id;
          newValues = JSON.stringify(parsed.data);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    await pool.execute(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, action, tableName, recordId, newValues, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

module.exports = { auditLog };
