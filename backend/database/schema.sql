
-- KCA Room Management System Database Schema
CREATE DATABASE kca_room_management;
USE kca_room_management;
-- Drop existing tables if they exist

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'lecturer', 'maintenance') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    phone VARCHAR(20) NULL,
    bio TEXT NULL,
    avatar VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    building VARCHAR(50) NOT NULL,
    floor INT NOT NULL,
    resources JSON,
    description TEXT,
    status ENUM('available', 'maintenance', 'occupied') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_building_floor (building, floor),
    INDEX idx_capacity (capacity),
    INDEX idx_status (status)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    recurring BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_room_time (room_id, start_time, end_time),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
);

-- Maintenance requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    issue VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
    reported_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_room (room_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_table (table_name),
    INDEX idx_created_at (created_at)
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES 
('System Administrator', 'admin@kca.ac.ke', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2Q3jHtJrHK', 'admin');

-- Insert sample rooms
INSERT IGNORE INTO rooms (name, capacity, building, floor, resources, description) VALUES 
('Lecture Hall A', 150, 'Main Building', 1, '["projector", "microphone", "whiteboard"]', 'Large lecture hall with modern AV equipment'),
('Computer Lab 1', 40, 'IT Building', 2, '["computers", "projector", "air_conditioning"]', 'Computer laboratory with 40 workstations'),
('Conference Room', 20, 'Admin Block', 3, '["projector", "video_conferencing", "whiteboard"]', 'Executive conference room'),
('Tutorial Room 1', 25, 'Academic Block', 1, '["whiteboard", "chairs"]', 'Small tutorial room for group discussions'),
('Library Study Room', 12, 'Library', 2, '["whiteboard", "quiet_zone"]', 'Quiet study room in the library');
