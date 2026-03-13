import { v2 as cloudinary } from "cloudinary";
import { serverConfig } from "./config";

const cfg = serverConfig.storage.cloudinary;

cloudinary.config({
  cloud_name: cfg.cloudName,
  api_key: cfg.apiKey,
  api_secret: cfg.apiSecret,
});

export default cloudinary;

export { uploadFile, deleteFile, buildFileUrl, getRootFolder } from "./storage";
