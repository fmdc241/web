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
          "'unsafe-inline'",             // Allow inline scripts (for development)
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
          "'unsafe-inline'",
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

app.use((err, req, res, next) => {
  console.error('Global Error:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    body: req.body,
    params: req.params
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', require('./routes'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

module.exports = app;
