// backend/src/utils/formidableHelper.js
// Native ESM + Formidable multiple upload + MinIO integration

import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { minioClient, BUCKET_NAME } from "../config/minio.js";

/**
 * Parse multipart form using Formidable
 * @param {Request} req - Express request object
 * @returns {Promise<{ fields: object, files: object[] }>}
 */
export async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: true, // ✅ Allow multiple files
      keepExtensions: true,
      maxFileSize: 20 * 1024 * 1024, // 20MB per file
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("❌ Formidable parse error:", err);
        return reject(err);
      }

      // Normalize files into an array (even single uploads)
      let allFiles = [];
      for (const key in files) {
        const fileData = files[key];
        if (Array.isArray(fileData)) allFiles.push(...fileData);
        else allFiles.push(fileData);
      }

      resolve({ fields, files: allFiles });
    });
  });
}

/**
 * Upload a file from disk to MinIO
 * @param {string} filePath - Local temp path (Formidable saves here)
 * @param {string} originalName - Original filename
 * @param {string} bucketName - Target bucket
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export async function uploadToMinIO(filePath, originalName, bucketName = BUCKET_NAME) {
  try {
    const ext = path.extname(originalName) || "";
    const objectName = `${crypto.randomUUID()}${ext}`;

    // Upload to MinIO
    await minioClient.fPutObject(bucketName, objectName, filePath);

    console.log(`✅ Uploaded "${originalName}" as "${objectName}" to bucket "${bucketName}"`);

    // Remove local temp file
    fs.unlink(filePath, () => {});

    // Generate presigned URL (valid for 7 days) or use public URL if bucket is public
    // First try to get presigned URL
    try {
      const presignedUrl = await minioClient.presignedGetObject(bucketName, objectName, 7 * 24 * 60 * 60);
      return presignedUrl;
    } catch (presignError) {
      // Fallback to direct URL if presigned fails
      console.warn('⚠️  Could not generate presigned URL, using direct URL:', presignError.message);
      const baseURL =
        process.env.MINIO_PUBLIC_URL ||
        `${process.env.MINIO_USE_SSL === "true" ? "https" : "http"}://${
          process.env.MINIO_ENDPOINT || "localhost"
        }:${process.env.MINIO_PORT || 9000}`;

      return `${baseURL}/${bucketName}/${objectName}`;
    }
  } catch (err) {
    console.error("❌ uploadToMinIO error:", err.message);
    throw err;
  }
}

/**
 * Combined helper — parse form and upload all files
 * @param {Request} req - Express request object
 * @returns {Promise<{ fields: object, uploadedFiles: string[] }>}
 */
export async function handleUpload(req) {
  const { fields, files } = await parseForm(req);
  const uploadedFiles = [];

  for (const file of files) {
    const url = await uploadToMinIO(file.filepath, file.originalFilename);
    uploadedFiles.push(url);
  }

  return { fields, uploadedFiles };
}
