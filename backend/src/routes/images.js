import { Router } from "express";
import { v4 as uuid } from "uuid";
import {
  ListObjectsV2Command,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, BUCKET } from "../s3Client.js";

const router = Router();
const EXPIRY = Number(process.env.PRESIGN_EXPIRY_SECONDS || 300);
const PREFIX = "uploads/";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

/**
 * POST /api/upload-url
 * Body: { filename: string, contentType: string }
 * Returns a presigned PUT URL the browser can upload directly to S3 with,
 * plus the object key the frontend should remember for display/delete.
 */
router.post("/upload-url", async (req, res) => {
  try {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({ error: "filename and contentType are required" });
    }
    if (!ALLOWED_TYPES.has(contentType)) {
      return res.status(400).json({ error: `Unsupported content type: ${contentType}` });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `${PREFIX}${uuid()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: EXPIRY });

    res.json({ uploadUrl, key });
  } catch (err) {
    console.error("Failed to create upload URL:", err);
    res.status(500).json({ error: "Could not create upload URL" });
  }
});

/**
 * GET /api/images
 * Lists everything under uploads/ and returns a short-lived viewing URL
 * for each object so the bucket itself never needs to be public.
 */
router.get("/images", async (_req, res) => {
  try {
    const list = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: PREFIX })
    );

    const objects = list.Contents || [];

    const images = await Promise.all(
      objects
        .filter((obj) => obj.Size > 0)
        .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
        .map(async (obj) => {
          const url = await getSignedUrl(
            s3,
            new GetObjectCommand({ Bucket: BUCKET, Key: obj.Key }),
            { expiresIn: EXPIRY }
          );
          return {
            key: obj.Key,
            url,
            size: obj.Size,
            lastModified: obj.LastModified,
          };
        })
    );

    res.json({ images });
  } catch (err) {
    console.error("Failed to list images:", err);
    res.status(500).json({ error: "Could not list images" });
  }
});

/**
 * DELETE /api/images/:key
 * :key is URL-encoded since it contains the "uploads/" prefix and slashes.
 */
router.delete("/images/*", async (req, res) => {
  try {
    const key = req.params[0];

    if (!key.startsWith(PREFIX)) {
      return res.status(400).json({ error: "Invalid key" });
    }

    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    res.json({ deleted: key });
  } catch (err) {
    console.error("Failed to delete image:", err);
    res.status(500).json({ error: "Could not delete image" });
  }
});

export default router;
