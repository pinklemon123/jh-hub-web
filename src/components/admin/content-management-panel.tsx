import { adminQueue } from "@/data/admin";
import { cn } from "@/lib/utils";
import { contentTypeLabel, levelClass, levelLabel } from "./admin-labels";

export function ContentManagementPanel() {
  return (
    <section className="rounded-lg border border-line bg-white shadow-subtle">
      <div className="border-b border-line p-4">
        <h2 className="font-black">内容管理</h2>
        <p className="mt-1 text-sm text-neutral-500">统一查看帖子、评论、私信和图片内容状态。</p>
      </div>
      <div className="divide-y divide-line">
        {adminQueue.map((item) => (
          <article key={`${item.type}-${item.id}`} className="grid gap-3 p-4 md:grid-cols-[120px_1fr_160px] md:items-center">
            <div>
              <span className="rounded-md bg-paper px-2 py-1 text-xs font-bold">{contentTypeLabel(item.type)}</span>
            </div>
            <div className="min-w-0">
              <div className="truncate font-black">{item.title}</div>
              <p className="mt-1 line-clamp-1 text-sm text-neutral-500">{item.content}</p>
            </div>
            <div className="flex items-center gap-2 md:justify-end">
              <span className={cn("rounded-md border px-2 py-1 text-xs font-black", levelClass(item.moderation.level))}>
                {levelLabel(item.moderation.level)}
              </span>
              <button className="rounded-md border border-line px-2 py-1 text-xs font-bold">管理</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
