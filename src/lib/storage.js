import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;
const B2_ENDPOINT = process.env.B2_ENDPOINT;

if (!B2_KEY_ID || !B2_APPLICATION_KEY || !B2_BUCKET_NAME || !B2_ENDPOINT) {
  console.error(
    "FATAL: Backblaze B2 environment variables are not fully set. " +
      "Required: B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, B2_ENDPOINT.",
  );
}

// Backblaze's endpoint (e.g. s3.eu-central-003.backblazeb2.com) encodes the
// region as its second dot-separated segment.
const B2_REGION = B2_ENDPOINT ? B2_ENDPOINT.split(".")[1] : "eu-central-003";

const s3Client = new S3Client({
  region: B2_REGION,
  endpoint: `https://${B2_ENDPOINT}`,
  credentials: {
    accessKeyId: B2_KEY_ID,
    secretAccessKey: B2_APPLICATION_KEY,
  },
  forcePathStyle: true, // required for B2's S3-compatible layer
});

// Upload a payment receipt to the private bucket.
// `fileBuffer` is the raw file bytes, `originalFileName` and `contentType`
// come from the uploaded File object. Returns the storage key (not a URL —
// the bucket is private, so viewing always goes through getReceiptSignedUrl).
export async function uploadReceiptFile(
  fileBuffer,
  originalFileName,
  contentType,
) {
  const safeName = (originalFileName || "receipt")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-100); // keep it short and filesystem-safe
  const key = `receipts/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${safeName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType || "application/octet-stream",
    }),
  );

  return key;
}

// Generate a short-lived signed URL so admin can view a private receipt.
// Defaults to 5 minutes — long enough to open and view, short enough that a
// copied/shared link stops working quickly.
export async function getReceiptSignedUrl(key, expiresInSeconds = 300) {
  if (!key) return null;
  const command = new GetObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}