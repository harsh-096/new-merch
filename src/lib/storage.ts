/**
 * Abstract storage layer.
 *
 * Switch between Cloudinary and S3 by setting STORAGE_PROVIDER in .env.
 * All upload/delete/URL logic goes through here so the rest of the app
 * never talks to a specific provider directly.
 *
 * S3 support is lazy-loaded only when STORAGE_PROVIDER=s3 and
 * @aws-sdk/client-s3 is installed. No S3 dependency at build time.
 */

import { serverConfig } from "./config";

export interface UploadResult {
  url: string;
  key: string; // publicId (Cloudinary) or S3 key
}

export interface StorageUploadOptions {
  folder?: string;
  fileName?: string;
  resourceType?: "image" | "raw" | "auto";
  overwrite?: boolean;
}

const ROOT_FOLDER = serverConfig.storage.folder;

/* ── Public API ── */

export async function uploadFile(
  buffer: Buffer,
  options: StorageUploadOptions = {}
): Promise<UploadResult> {
  if (serverConfig.storage.provider === "s3") {
    return uploadToS3(buffer, options);
  }
  return uploadToCloudinaryProvider(buffer, options);
}

export async function deleteFile(key: string): Promise<void> {
  if (serverConfig.storage.provider === "s3") {
    return deleteFromS3(key);
  }
  return deleteFromCloudinaryProvider(key);
}

export function buildFileUrl(path: string): string {
  if (serverConfig.storage.provider === "s3") {
    return buildS3Url(path);
  }
  return buildCloudinaryProviderUrl(path);
}

export function getRootFolder(): string {
  return ROOT_FOLDER;
}

/* ── Cloudinary implementation ── */

async function uploadToCloudinaryProvider(
  buffer: Buffer,
  options: StorageUploadOptions
): Promise<UploadResult> {
  const { v2: cloudinary } = await import("cloudinary");

  const cfg = serverConfig.storage.cloudinary;
  cloudinary.config({
    cloud_name: cfg.cloudName,
    api_key: cfg.apiKey,
    api_secret: cfg.apiSecret,
  });

  const uploadOpts: Record<string, unknown> = {
    resource_type: options.resourceType || "auto",
    overwrite: options.overwrite ?? true,
  };

  if (options.fileName && options.folder) {
    uploadOpts.public_id = `${ROOT_FOLDER}/${options.folder}/${options.fileName}`;
    uploadOpts.use_filename = false;
    uploadOpts.unique_filename = false;
  } else if (options.fileName) {
    uploadOpts.public_id = `${ROOT_FOLDER}/${options.fileName}`;
    uploadOpts.use_filename = false;
    uploadOpts.unique_filename = false;
  } else if (options.folder) {
    uploadOpts.folder = `${ROOT_FOLDER}/${options.folder}`;
  } else {
    uploadOpts.folder = ROOT_FOLDER;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOpts,
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, key: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

async function deleteFromCloudinaryProvider(publicId: string): Promise<void> {
  const { v2: cloudinary } = await import("cloudinary");
  const cfg = serverConfig.storage.cloudinary;
  cloudinary.config({
    cloud_name: cfg.cloudName,
    api_key: cfg.apiKey,
    api_secret: cfg.apiSecret,
  });
  await cloudinary.uploader.destroy(publicId);
}

function buildCloudinaryProviderUrl(path: string): string {
  const cloud = serverConfig.storage.cloudinary.cloudName;
  const encoded = path
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `https://res.cloudinary.com/${cloud}/image/upload/${ROOT_FOLDER}/${encoded}`;
}

/* ── S3 implementation (lazy-loaded, no build-time dependency) ──
 *
 * Uses eval("require") to prevent webpack from statically analyzing the
 * @aws-sdk/client-s3 import. The package is only loaded at runtime when
 * STORAGE_PROVIDER=s3. Install it when you need S3: npm i @aws-sdk/client-s3
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadS3SDK(): any {
  try {
    // Prevent webpack from bundling this -- resolved at runtime only
    return eval('require("@aws-sdk/client-s3")');
  } catch {
    throw new Error(
      "STORAGE_PROVIDER is set to 's3' but @aws-sdk/client-s3 is not installed. " +
        "Run: npm install @aws-sdk/client-s3"
    );
  }
}

async function uploadToS3(
  buffer: Buffer,
  options: StorageUploadOptions
): Promise<UploadResult> {
  const cfg = serverConfig.storage.s3;
  const sdk = loadS3SDK();
  const client = new sdk.S3Client({
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  let key = ROOT_FOLDER;
  if (options.folder) key += `/${options.folder}`;
  if (options.fileName) key += `/${options.fileName}`;
  else key += `/${Date.now()}`;

  const contentType =
    options.resourceType === "image" ? "image/png" : "application/octet-stream";

  await client.send(
    new sdk.PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    })
  );

  const url = `https://${cfg.bucket}.s3.${cfg.region}.amazonaws.com/${key}`;
  return { url, key };
}

async function deleteFromS3(key: string): Promise<void> {
  const cfg = serverConfig.storage.s3;
  const sdk = loadS3SDK();
  const client = new sdk.S3Client({
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  await client.send(
    new sdk.DeleteObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
    })
  );
}

function buildS3Url(path: string): string {
  const cfg = serverConfig.storage.s3;
  return `https://${cfg.bucket}.s3.${cfg.region}.amazonaws.com/${ROOT_FOLDER}/${path}`;
}
