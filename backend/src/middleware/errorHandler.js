export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  if (res.statusCode === 404 || error.statusCode === 404) {
    console.warn(`[404] ${req.method} ${req.originalUrl} -> ${error.message}`);
  } else {
    console.error(err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
// src/middleware/errorHandler.js (ya jaha bhi hai)
if (err.code === 11000) {
  console.error("DUPLICATE KEY ERROR:", err.keyValue); // 🔥 ADD THIS

  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  const message = `Duplicate value for field "${field}": ${value}`;
  return res.status(400).json({
    success: false,
    message,
  });
}


  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  const statusCode = error.statusCode || res.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error',
  });
};

// Not found middleware
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

