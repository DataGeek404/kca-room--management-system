
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS room_management_system;
USE room_management_system;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'lecturer', 'maintenance') NOT NULL DEFAULT 'lecturer',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  phone VARCHAR(20),
  bio TEXT,
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  head_of_department VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  building VARCHAR(100),
  floor INT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('lecture', 'lab', 'meeting', 'auditorium', 'other') NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(255),
  department_id INT,
  equipment TEXT,
  status ENUM('available', 'occupied', 'maintenance', 'inactive') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  purpose TEXT,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  user_id INT NOT NULL,
  issue VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  status ENUM('pending', 'in-progress', 'completed') NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (name, email, password_hash, role, status) VALUES 
('Admin User', 'admin@kcauniversity.ac.ke', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1L/WGZ.KIK', 'admin', 'active');

-- Insert sample departments
INSERT IGNORE INTO departments (name, code, description, head_of_department, contact_email, building, floor) VALUES 
('Computer Science', 'CS', 'Department of Computer Science and Information Technology', 'Dr. John Smith', 'cs@kcauniversity.ac.ke', 'ICT Block', 2),
('Engineering', 'ENG', 'Department of Engineering and Applied Sciences', 'Prof. Jane Doe', 'eng@kcauniversity.ac.ke', 'Engineering Block', 1),
('Business', 'BUS', 'School of Business and Economics', 'Dr. Michael Johnson', 'business@kcauniversity.ac.ke', 'Business Block', 3);

-- Insert sample rooms
INSERT IGNORE INTO rooms (name, type, capacity, location, department_id, equipment, status) VALUES 
('CS Lab 1', 'lab', 30, 'ICT Block, Room 201', 1, 'Computers, Projector, Whiteboard', 'available'),
('Lecture Hall A', 'lecture', 100, 'Main Block, Ground Floor', 1, 'Projector, Sound System, Whiteboard', 'available'),
('Engineering Workshop', 'lab', 25, 'Engineering Block, Room 101', 2, 'Workshop Tools, Safety Equipment', 'available');
