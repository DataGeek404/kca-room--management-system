
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  multipleStatements: true
};

console.log('Database Configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  // Don't log password for security
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully to:', dbConfig.database);
    
    // Test if users table exists and has required columns
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('⚠️ Users table does not exist. Please run the schema.sql file.');
    } else {
      const [columns] = await connection.execute("DESCRIBE users");
      const columnNames = columns.map(col => col.Field);
      const requiredColumns = ['id', 'name', 'email', 'role', 'status', 'phone', 'bio', 'avatar', 'created_at', 'last_login'];
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('⚠️ Missing columns in users table:', missingColumns);
        console.log('Please update your database schema.');
      } else {
        console.log('✅ Users table schema is correct');
      }
    }
    
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your database configuration and ensure MySQL is running.');
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist. Please create it first or run the schema.sql file.');
    }
    process.exit(1);
  }
};

// Initialize database connection
testConnection();

module.exports = pool;
