import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { minioClient, BUCKET_NAME, getPresignedUrl } from '../config/minio.js';

const router = express.Router();

// Custom auth middleware that accepts token from query params (for image tags)
const protectOptional = async (req, res, next) => {
  let token;
  
  // Check Authorization header first
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback to query parameter (for image tags)
  else if (req.query.token) {
    token = req.query.token;
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource',
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

// Get presigned URL for a file (allows temporary access)
// @route   GET /api/files/presigned/:filename
// @access  Private
router.get('/presigned/:filename', protectOptional, async (req, res, next) => {
  try {
    let { filename } = req.params;
    filename = decodeURIComponent(filename);
    
    // Extract object name from URL if full URL is provided
    let objectName = filename;
    if (filename.includes('/ecobin/')) {
      objectName = filename.split('/ecobin/')[1];
    } else if (filename.includes('/')) {
      objectName = filename.split('/').pop();
    }
    
    // Remove query parameters if any
    objectName = objectName.split('?')[0];
    
    const url = await getPresignedUrl(objectName);
    res.status(200).json({
      success: true,
      data: { url },
    });
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }
    next(error);
  }
});

// Proxy endpoint to serve files through backend (alternative to presigned URLs)
// @route   GET /api/files/:filename
// @access  Private (token can be in query param for image tags)
router.get('/:filename', protectOptional, async (req, res, next) => {
  try {
    let { filename } = req.params;
    filename = decodeURIComponent(filename);
    
    // Extract object name from URL if full URL is provided
    let objectName = filename;
    if (filename.includes('/ecobin/')) {
      objectName = filename.split('/ecobin/')[1];
    } else if (filename.includes('/')) {
      objectName = filename.split('/').pop();
    }
    
    // Remove query parameters if any
    objectName = objectName.split('?')[0];
    
    // Get file stream from MinIO
    const stream = await minioClient.getObject(BUCKET_NAME, objectName);
    
    // Detect content type from file extension
    const ext = objectName.split('.').pop()?.toLowerCase();
    const contentTypeMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
    };
    const contentType = contentTypeMap[ext] || 'image/jpeg';
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS
    
    // Pipe the stream to response
    stream.pipe(res);
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }
    next(error);
  }
});

export default router;

