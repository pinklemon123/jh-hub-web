import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"]
]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);
  const uploadDir = path.join(process.cwd(), "public", "uploads", "posts");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];
  for (const file of files.slice(0, 4)) {
    const ext = allowedTypes.get(file.type);
    if (!ext) continue;
    if (file.size > 5 * 1024 * 1024) continue;
    const bytes = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    await writeFile(path.join(uploadDir, filename), bytes);
    const url = `/uploads/posts/${filename}`;
    await prisma.uploadedAsset.create({
      data: {
        url,
        mimeType: file.type,
        size: file.size,
        scope: "post"
      }
    });
    urls.push(url);
  }

  return NextResponse.json({ ok: true, urls });
}
