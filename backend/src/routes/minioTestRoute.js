// src/routes/minioTestRoute.js

import express from "express";
import { uploadTestFile } from "../config/minio.js";

const router = express.Router();

// GET /api/minio/test-upload
router.get("/test-upload", async (req, res) => {
  try {
    const result = await uploadTestFile();

    return res.status(200).json({
      success: true,
      message: "Test file uploaded to MinIO successfully.",
      bucket: result.bucket,
      objectName: result.objectName,
    });
  } catch (error) {
    console.error("Error in /api/minio/test-upload:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload test file to MinIO.",
      error: error.message,
    });
  }
});

export default router;
