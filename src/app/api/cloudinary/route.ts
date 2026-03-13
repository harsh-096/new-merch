import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { serverConfig } from "@/lib/config";

interface CloudinaryFolder {
  name: string;
  path: string;
  children: CloudinaryFolder[];
  images: { publicId: string; url: string; format: string }[];
}

const ROOT = serverConfig.storage.folder;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rootPath = searchParams.get("root") || ROOT;

    const tree = await buildTree(rootPath);

    return NextResponse.json(tree);
  } catch (err) {
    console.error("Cloudinary API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Cloudinary structure" },
      { status: 500 }
    );
  }
}

async function buildTree(rootPath: string): Promise<CloudinaryFolder> {
  const name = rootPath.split("/").pop() || rootPath;

  let subfolders: { name: string; path: string }[] = [];
  try {
    const result = await cloudinary.api.sub_folders(rootPath);
    subfolders = result.folders;
  } catch {
    // no subfolders
  }

  const images = await listImages(rootPath);

  const children: CloudinaryFolder[] = [];
  for (const sf of subfolders) {
    const child = await buildTree(sf.path);
    children.push(child);
  }

  return { name, path: rootPath, children, images };
}

async function listImages(
  prefix: string
): Promise<{ publicId: string; url: string; format: string }[]> {
  const images: { publicId: string; url: string; format: string }[] = [];

  try {
    const cloud = serverConfig.storage.cloudinary.cloudName;
    const res = await cloudinary.api.resources({
      type: "upload",
      prefix: prefix + "/",
      max_results: 100,
      resource_type: "image",
    });

    for (const r of res.resources) {
      const parts = r.public_id.split("/");
      const folderPath = parts.slice(0, -1).join("/");
      if (folderPath === prefix) {
        images.push({
          publicId: r.public_id,
          url: `https://res.cloudinary.com/${cloud}/image/upload/${r.public_id}.${r.format}`,
          format: r.format,
        });
      }
    }
  } catch {
    // no images
  }

  return images;
}
