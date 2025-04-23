const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://cdn.tailwindcss.com', // Allow Tailwind CDN
        ],
        imgSrc: [
          "'self'",
          'https://i.ibb.co',
          'https://i.ytimg.com',
          'https://img.youtube.com',
          'data:',
        ],
        styleSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          "'unsafe-inline'", // Consider removing 'unsafe-inline' for production
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
        ],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(morgan('dev'));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request bodies

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', require('./routes'));

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global Error:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    body: (() => {
      try {
        return req.body;
      } catch {
        return undefined;
      }
    })(),
    params: req.params,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
