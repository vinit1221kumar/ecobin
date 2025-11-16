import express from 'express';
import axios from 'axios';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Trigger Jenkins deployment
// @route   POST /api/admin/deploy
// @access  Private/Admin
router.post('/deploy', protect, authorize('admin'), async (req, res) => {
  try {
    const JENKINS_URL = process.env.JENKINS_URL || 'http://localhost:8080';
    const JENKINS_JOB = process.env.JENKINS_JOB || 'ecobin-pipeline';
    const JENKINS_TOKEN = process.env.JENKINS_TOKEN;
    const JENKINS_USER = process.env.JENKINS_USER;
    const JENKINS_BUILD_TOKEN = process.env.JENKINS_BUILD_TOKEN || 'ecobin-build-token';

    // Build Jenkins API URL with token parameter
    const jenkinsApiUrl = `${JENKINS_URL}/job/${JENKINS_JOB}/build?token=${JENKINS_BUILD_TOKEN}`;

    console.log('🚀 Triggering Jenkins build...');
    console.log('Jenkins URL:', jenkinsApiUrl);
    console.log('Jenkins Job:', JENKINS_JOB);
    console.log('Build Token:', JENKINS_BUILD_TOKEN);

    // Prepare authentication headers
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
    };

    // Add basic auth if credentials are provided
    const auth = JENKINS_USER && JENKINS_TOKEN
      ? {
          username: JENKINS_USER,
          password: JENKINS_TOKEN,
        }
      : undefined;

    console.log('Auth configured:', auth ? 'Yes' : 'No');

    // Trigger Jenkins build using axios
    const response = await axios.post(jenkinsApiUrl, {}, {
      headers,
      auth,
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      maxRedirects: 5,
    });

    console.log('✅ Jenkins response status:', response.status);

    if (response.status === 200 || response.status === 201) {
      res.status(200).json({
        success: true,
        message: 'Jenkins build started successfully',
        jenkinsUrl: JENKINS_URL,
        jobName: JENKINS_JOB,
        buildUrl: `${JENKINS_URL}/job/${JENKINS_JOB}`,
      });
    } else {
      res.status(response.status).json({
        success: false,
        message: `Jenkins API error: ${response.statusText}`,
        details: response.data,
      });
    }
  } catch (error) {
    console.error('❌ Deploy error:', error.message);
    
    if (error.response) {
      // Jenkins returned an error response
      res.status(error.response.status).json({
        success: false,
        message: 'Failed to trigger Jenkins build',
        error: error.response.data || error.message,
      });
    } else if (error.request) {
      // Request was made but no response received
      res.status(503).json({
        success: false,
        message: 'Cannot connect to Jenkins server',
        error: 'Jenkins server is not reachable',
      });
    } else {
      // Something else happened
      res.status(500).json({
        success: false,
        message: 'Failed to trigger deployment',
        error: error.message,
      });
    }
  }
});

// @desc    Test Jenkins connection (no auth required for testing)
// @route   GET /api/admin/test-jenkins
// @access  Private/Admin
router.get('/test-jenkins', protect, authorize('admin'), async (req, res) => {
  try {
    const JENKINS_URL = process.env.JENKINS_URL || 'http://localhost:8080';
    const JENKINS_JOB = process.env.JENKINS_JOB || 'ecobin-pipeline';

    // Test if Jenkins is accessible
    const testUrl = `${JENKINS_URL}/api/json`;
    
    console.log('🔍 Testing Jenkins connection...');
    console.log('Test URL:', testUrl);

    const response = await axios.get(testUrl, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    res.status(200).json({
      success: true,
      message: 'Jenkins is accessible',
      jenkinsUrl: JENKINS_URL,
      jobName: JENKINS_JOB,
      status: response.status,
      data: response.data,
    });
  } catch (error) {
    console.error('❌ Jenkins test error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Cannot connect to Jenkins',
      error: error.message,
      jenkinsUrl: process.env.JENKINS_URL,
    });
  }
});

export default router;
