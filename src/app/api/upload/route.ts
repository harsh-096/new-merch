import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile, getRootFolder } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const folder = (formData.get("folder") as string) || "general";
    const useCleanNames = formData.get("cleanNames") === "true";

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const maxSize = 25 * 1024 * 1024;
    const results: { url: string; publicId: string; fileName: string }[] = [];
    const errors: { fileName: string; error: string }[] = [];

    for (const file of files) {
      if (file.size > maxSize) {
        errors.push({ fileName: file.name, error: "File too large (max 25MB)" });
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

      try {
        const result = await uploadFile(buffer, {
          folder: useCleanNames ? folder : folder,
          fileName: useCleanNames ? nameWithoutExt : undefined,
          resourceType: "image",
          overwrite: true,
        });

        results.push({
          url: result.url,
          publicId: result.key,
          fileName: file.name,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        errors.push({ fileName: file.name, error: msg });
      }
    }

    if (files.length === 1 && results.length === 1) {
      return NextResponse.json(results[0]);
    }

    return NextResponse.json({ results, errors, total: files.length });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
