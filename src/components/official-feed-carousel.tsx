"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { OfficialFeedItem } from "@/lib/discover-data";
import { cn } from "@/lib/utils";

export function OfficialFeedCarousel({ items }: { items: OfficialFeedItem[] }) {
  const slides = useMemo(() => (items.length > 0 ? items : []), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = slides[activeIndex];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!activeItem) {
    return (
      <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-line bg-paper text-sm font-semibold text-neutral-500">
        暂无学校官号推送
      </div>
    );
  }

  function move(offset: number) {
    setActiveIndex((current) => (current + offset + slides.length) % slides.length);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-neutral-950 text-white">
      <div className="relative min-h-[320px]">
        {activeItem.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={activeItem.imageUrl} alt={activeItem.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#6E1F28,#221113_70%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
        <div className="relative flex min-h-[320px] flex-col justify-end p-5 sm:p-6">
          <div className="mb-3 inline-flex w-fit rounded-md bg-white/90 px-2.5 py-1 text-xs font-black text-brand-800">
            {activeItem.type}
          </div>
          <h3 className="max-w-3xl text-2xl font-black leading-tight sm:text-3xl">{activeItem.title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/82 sm:text-base">{activeItem.body}</p>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-950 shadow-subtle hover:bg-white"
              aria-label="上一条推送"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-950 shadow-subtle hover:bg-white"
              aria-label="下一条推送"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center gap-2 border-t border-white/10 bg-black/35 px-5 py-3">
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn("h-1.5 flex-1 rounded-full bg-white/25 transition", index === activeIndex && "bg-white")}
              aria-label={`切换到 ${item.title}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
