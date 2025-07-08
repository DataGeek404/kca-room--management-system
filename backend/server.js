const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;