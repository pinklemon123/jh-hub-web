"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui";

const MAX_IMAGES = 4;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PreviewImage {
  id: string;
  file: File;
  url: string;
  remoteUrl?: string;
}

export function ImageUploader({ onUploadedChange }: { onUploadedChange?: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<PreviewImage[]>([]);
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [error, setError] = useState("");
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    imagesRef.current = images;
    onUploadedChange?.(images.flatMap((image) => (image.remoteUrl ? [image.remoteUrl] : [])));
  }, [images, onUploadedChange]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files) return;

    setError("");
    setCompressing(true);
    const incoming = Array.from(files);
    const next: PreviewImage[] = [];

    try {
      for (const file of incoming) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError("只支持 jpg、png、webp 图片。");
          continue;
        }

        if (file.size > MAX_SIZE) {
          setError("单张图片不能超过 5MB。");
          continue;
        }

        const compressedFile = await compressImage(file);
        const remoteUrl = await uploadImage(compressedFile);
        next.push({
          id: `${compressedFile.name}-${compressedFile.lastModified}-${crypto.randomUUID()}`,
          file: compressedFile,
          url: URL.createObjectURL(compressedFile),
          remoteUrl
        });
      }

      setImages((current) => {
        const merged = [...current, ...next].slice(0, MAX_IMAGES);
        if (current.length + next.length > MAX_IMAGES) {
          setError("第一版最多上传 4 张图片。");
        }
        return merged;
      });
    } catch {
      setError("图片处理失败，请换一张 jpg、png 或 webp。");
    } finally {
      setCompressing(false);
    }
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const next = current.filter((image) => image.id !== id);
      return next;
    });
  }

  return (
    <div className="rounded-lg border border-dashed border-line bg-paper p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-neutral-700">发帖图片</div>
          <p className="mt-1 text-sm text-neutral-500">0-4 张，支持 jpg、png、webp，单张不超过 5MB。</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={images.length >= MAX_IMAGES || compressing}>
          <ImagePlus size={16} />
          {compressing ? "压缩中" : "选择图片"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {error && <div className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">{error}</div>}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg border border-line bg-white">
              <img src={image.url} alt={image.file.name} className="aspect-[4/3] w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/65 text-white opacity-90"
                aria-label="移除图片"
              >
                <X size={15} />
              </button>
              <div className="truncate px-2 py-2 text-xs font-semibold text-neutral-500">{image.file.name}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs leading-5 text-neutral-500">
        前端会压缩为 webp 预览文件。后端接口建议：先 `POST /api/upload` 返回 `url`，再在 `POST /api/posts` 里提交 `images: string[]`。
      </div>
    </div>
  );
}

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.82);
  });

  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.webp`, {
    type: "image/webp",
    lastModified: Date.now()
  });
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("files", file);
  const response = await fetch("/api/uploads/images", {
    method: "POST",
    body: formData
  });
  if (!response.ok) throw new Error("upload_failed");
  const data = (await response.json()) as { urls?: string[] };
  return data.urls?.[0];
}
