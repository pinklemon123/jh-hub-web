import type { PostImage } from "@/types";
import { cn } from "@/lib/utils";

export function PostImageGrid({
  images,
  mode = "detail"
}: {
  images: PostImage[];
  mode?: "cover" | "detail";
}) {
  if (images.length === 0) return null;

  if (mode === "cover") {
    const cover = images[0];
    return (
      <div className="mt-3 overflow-hidden rounded-lg border border-line bg-paper">
        <img src={cover.url} alt={cover.alt} className="aspect-[16/9] max-h-56 w-full object-cover" loading="lazy" />
      </div>
    );
  }

  const visibleImages = images.slice(0, 4);

  return (
    <div className={cn("mt-5 grid gap-3", visibleImages.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
      {visibleImages.map((image, index) => (
        <figure key={image.id} className="overflow-hidden rounded-lg border border-line bg-paper">
          <img
            src={image.url}
            alt={image.alt}
            className={cn("w-full object-cover", visibleImages.length === 1 ? "aspect-[16/9]" : "aspect-[4/3]")}
            loading={index === 0 ? "eager" : "lazy"}
          />
          <figcaption className="border-t border-line bg-white px-3 py-2 text-xs font-semibold text-neutral-500">
            {image.alt}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
