import { S3Client } from "@aws-sdk/client-s3";

// When AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are absent, the SDK falls
// back to the default credential chain (IAM role on EC2 / Elastic Beanstalk,
// ~/.aws/credentials locally, etc). Don't hardcode credentials here.
export const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const BUCKET = process.env.S3_BUCKET_NAME;

if (!BUCKET) {
  console.warn(
    "[s3Client] S3_BUCKET_NAME is not set. Requests to the API will fail until it is configured."
  );
}
