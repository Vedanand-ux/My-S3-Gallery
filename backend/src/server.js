import "dotenv/config";
import express from "express";
import cors from "cors";
import imagesRouter from "./routes/images.js";

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", bucket: process.env.S3_BUCKET_NAME || null });
});

app.use("/api", imagesRouter);

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Gallery API listening on port ${PORT}`);
});
