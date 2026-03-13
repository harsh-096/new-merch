"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface ArtworkUploaderProps {
  productSlug: string;
  onUpload: (url: string, fileName: string) => void;
  currentUrl?: string;
  currentFileName?: string;
}

export default function ArtworkUploader({
  productSlug,
  onUpload,
  currentUrl,
  currentFileName,
}: ArtworkUploaderProps) {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!session) {
        toast.error("Please sign in to upload artwork");
        return;
      }

      setUploading(true);
      setProgress(10);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("productSlug", productSlug);

      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 85));
      }, 300);

      try {
        const res = await fetch("/api/artwork", { method: "POST", body: fd });
        clearInterval(interval);

        if (res.ok) {
          const data = await res.json();
          setProgress(100);
          onUpload(data.url, file.name);
          toast.success("Artwork uploaded successfully");
        } else {
          const data = await res.json();
          toast.error(data.error || "Upload failed");
        }
      } catch {
        clearInterval(interval);
        toast.error("Upload failed");
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [productSlug, session, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/svg+xml": [".svg"],
      "application/postscript": [".ai", ".eps"],
    },
  });

  if (currentUrl && currentFileName) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Artwork uploaded
              </p>
              <p className="text-xs text-green-600">{currentFileName}</p>
            </div>
          </div>
          <button
            onClick={() => onUpload("", "")}
            className="p-1 text-green-600 hover:text-red-500 transition"
            title="Remove artwork"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-primary-400 bg-primary-50"
            : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        {uploading ? (
          <div>
            <p className="text-sm text-gray-600">Uploading artwork...</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-sm text-primary-600 font-medium">
            Drop your file here
          </p>
        ) : (
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-primary-600">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, AI, EPS, PNG, JPG, SVG (max 50MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
