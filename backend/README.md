
# KCA Room Management System - Backend API

A comprehensive backend API for managing university room bookings, maintenance requests, and user management.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Room Management**: CRUD operations for rooms with filtering and search capabilities
- **Booking System**: Real-time booking management with conflict detection
- **Maintenance Requests**: Track and manage room maintenance with priority levels
- **Reporting**: Generate utilization reports and booking statistics
- **Security**: Helmet, rate limiting, input validation, and audit logging
- **API Documentation**: Swagger/OpenAPI documentation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with connection pooling
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate limiting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=kca_room_management
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE kca_room_management;"
   
   # Run schema
   mysql -u root -p kca_room_management < database/schema.sql
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Rooms
- `GET /api/rooms` - Get all rooms with filters
- `POST /api/rooms` - Create room (Admin only)
- `PUT /api/rooms/:id` - Update room (Admin only)
- `DELETE /api/rooms/:id` - Delete room (Admin only)

### Bookings
- `GET /api/bookings/my-bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `DELETE /api/bookings/:id` - Cancel booking

### Maintenance
- `GET /api/maintenance` - Get maintenance requests
- `POST /api/maintenance` - Create maintenance request
- `PUT /api/maintenance/:id` - Update request status (Maintenance staff)

### Users
- `GET /api/users` - Get all users (Admin only)
- `PUT /api/users/:id/status` - Update user status (Admin only)

### Reports
- `GET /api/reports/room-utilization` - Room utilization report (Admin only)
- `GET /api/reports/booking-stats` - Booking statistics (Admin only)

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## Database Schema

The system uses the following main tables:
- `users` - User accounts and roles
- `rooms` - Room information and resources
- `bookings` - Room reservations
- `maintenance_requests` - Maintenance tracking
- `audit_logs` - System audit trail

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: API request throttling
- **CORS**: Cross-origin resource sharing configuration
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Express-validator for request validation
- **Password Hashing**: bcrypt for secure password storage
- **Audit Logging**: Track all system activities

## Default Accounts

**Admin Account**:
- Email: `admin@kca.ac.ke`
- Password: `admin123`
- Role: `admin`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `kca_room_management` |
| `DB_USER` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## Development

```bash
# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Enable HTTPS
5. Configure reverse proxy (nginx)
6. Set up process manager (PM2)

## License

MIT License - see LICENSE file for details.
