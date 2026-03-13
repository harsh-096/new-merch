import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const productSlug = formData.get("productSlug") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/svg+xml",
      "application/postscript",
      "application/illustrator",
    ];

    const isAllowed =
      allowedTypes.includes(file.type) ||
      file.name.endsWith(".ai") ||
      file.name.endsWith(".eps") ||
      file.name.endsWith(".pdf");

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Invalid file type. Accepted: PDF, AI, EPS, PNG, JPG, SVG" },
        { status: 400 }
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB for artwork
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const folder = `artworks/${session.user.id}${productSlug ? `/${productSlug}` : ""}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, folder, "auto");

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      fileName: file.name,
    });
  } catch {
    return NextResponse.json({ error: "Artwork upload failed" }, { status: 500 });
  }
}
