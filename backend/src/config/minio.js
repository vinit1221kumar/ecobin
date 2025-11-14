import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin123',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'ecobin';

// Initialize bucket if it doesn't exist and set public read policy
const initMinIO = async () => {
  try {
    // Test connection first
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ MinIO bucket '${BUCKET_NAME}' created successfully`);
    } else {
      console.log(`✅ MinIO bucket '${BUCKET_NAME}' already exists`);
    }

    // Set bucket policy to allow public read access
    try {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log(`✅ MinIO bucket '${BUCKET_NAME}' set to public read access`);
    } catch (policyError) {
      console.warn(`⚠️  Could not set bucket policy (this is okay if policy already exists): ${policyError.message}`);
    }
  } catch (error) {
    console.error('❌ MinIO initialization error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      console.error('💡 Tip: Make sure MinIO is running and accessible');
      console.error(`   Expected at: ${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}`);
    }
    // MinIO is required for file uploads, so throw error to prevent server startup
    throw new Error(`MinIO initialization failed: ${error.message}. File uploads will not work without MinIO.`);
  }
};

// Generate presigned URL for accessing files (valid for 7 days)
export const getPresignedUrl = async (objectName, expiresInSeconds = 7 * 24 * 60 * 60) => {
  try {
    const url = await minioClient.presignedGetObject(BUCKET_NAME, objectName, expiresInSeconds);
    return url;
  } catch (error) {
    console.error('❌ Error generating presigned URL:', error.message);
    throw error;
  }
};

const uploadTestFile = async () => {
  const objectName = `test-${Date.now()}.txt`;
  const content = "Test upload from EcoBin backend using MinIO.";

  await minioClient.putObject(
    BUCKET_NAME,
    objectName,
    Buffer.from(content, "utf-8")
  );

  return { bucket: BUCKET_NAME, objectName };
};

export { minioClient, BUCKET_NAME, initMinIO, uploadTestFile };

