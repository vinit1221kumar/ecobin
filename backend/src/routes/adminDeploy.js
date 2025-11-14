import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Trigger Jenkins deployment
// @route   POST /api/admin/deploy
// @access  Private/Admin
router.post('/deploy', protect, authorize('admin'), async (req, res) => {
  try {
    const JENKINS_URL = process.env.JENKINS_URL || 'http://localhost:8080';
    const JENKINS_JOB = process.env.JENKINS_JOB || 'ecobin-deploy';
    const JENKINS_USER = process.env.JENKINS_USER;
    const JENKINS_TOKEN = process.env.JENKINS_TOKEN;

    // Build Jenkins API URL
    const jenkinsApiUrl = `${JENKINS_URL}/job/${JENKINS_JOB}/build`;

    // Prepare authentication
    const auth = JENKINS_USER && JENKINS_TOKEN
      ? `Basic ${Buffer.from(`${JENKINS_USER}:${JENKINS_TOKEN}`).toString('base64')}`
      : null;

    // Trigger Jenkins build
    const response = await fetch(jenkinsApiUrl, {
      method: 'POST',
      headers: {
        ...(auth && { 'Authorization': auth }),
        'Content-Type': 'application/json',
      },
    });

    if (response.ok || response.status === 201) {
      res.status(200).json({
        success: true,
        message: 'Jenkins deployment triggered successfully',
        jenkinsUrl: JENKINS_URL,
        jobName: JENKINS_JOB,
      });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        success: false,
        message: `Jenkins API error: ${response.statusText}`,
        details: errorText,
      });
    }
  } catch (error) {
    console.error('Deploy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger deployment',
      error: error.message,
    });
  }
});

export default router;
