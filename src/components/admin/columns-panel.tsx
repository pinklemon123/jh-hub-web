"use client";

import { ImagePlus, Newspaper, Plus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface EditorialColumn {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverUrl?: string | null;
  status: string;
  sortOrder: number;
}

export function ColumnsPanel() {
  const [items, setItems] = useState<EditorialColumn[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0], [items, selectedId]);

  useEffect(() => {
    fetch("/api/admin/columns")
      .then((response) => response.json())
      .then((data: { items?: EditorialColumn[] }) => {
        const next = data.items ?? [];
        setItems(next);
        setSelectedId(next[0]?.id ?? "");
      })
      .catch(() => setItems([]));
  }, []);

  function updateSelected(patch: Partial<EditorialColumn>) {
    if (!selected) return;
    setItems((current) => current.map((item) => (item.id === selected.id ? { ...item, ...patch } : item)));
  }

  function createColumn() {
    const next: EditorialColumn = {
      id: `local_${Date.now()}`,
      title: "新的运营专栏",
      summary: "填写专栏摘要，用于首页推荐和推送。",
      content: "",
      status: "draft",
      sortOrder: items.length + 1
    };
    setItems((current) => [next, ...current]);
    setSelectedId(next.id);
  }

  async function saveSelected() {
    if (!selected) return;
    setSaving(true);
    const isLocal = selected.id.startsWith("local_");
    const response = await fetch(isLocal ? "/api/admin/columns" : `/api/admin/columns/${selected.id}`, {
      method: isLocal ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected)
    });
    const data = (await response.json()) as { item?: EditorialColumn };
    if (data.item) {
      setItems((current) => current.map((item) => (item.id === selected.id ? data.item! : item)));
      setSelectedId(data.item.id);
    }
    setSaving(false);
  }

  async function uploadCover(file: File | undefined) {
    if (!file) return;
    const formData = new FormData();
    formData.append("files", file);
    const response = await fetch("/api/uploads/images", { method: "POST", body: formData });
    const data = (await response.json()) as { urls?: string[] };
    if (data.urls?.[0]) updateSelected({ coverUrl: data.urls[0] });
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="rounded-lg border border-line bg-white p-4 shadow-subtle">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Newspaper size={18} className="text-brand-600" />
            <h2 className="font-black">专栏列表</h2>
          </div>
          <button onClick={createColumn} className="inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-950 px-3 text-sm font-bold text-white">
            <Plus size={16} />
            新建
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {items.length === 0 ? (
            <p className="rounded-lg border border-line p-4 text-sm text-neutral-500">暂无专栏，点击新建开始。</p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-lg border p-3 text-left ${
                  item.id === selected?.id ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:bg-paper"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black">{item.title}</div>
                  <span className="rounded-md bg-paper px-2 py-1 text-xs font-black text-neutral-600">{item.status}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{item.summary}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {selected && (
        <div className="rounded-lg border border-line bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black">编辑专栏</h2>
            <button
              onClick={saveSelected}
              disabled={saving}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm font-bold disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "保存中" : "保存"}
            </button>
          </div>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-black text-neutral-500">专栏标题</span>
              <input
                value={selected.title}
                onChange={(event) => updateSelected({ title: event.target.value })}
                className="h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-500"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-black text-neutral-500">摘要</span>
              <textarea
                value={selected.summary}
                onChange={(event) => updateSelected({ summary: event.target.value })}
                className="min-h-24 resize-y rounded-lg border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-brand-500"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-black text-neutral-500">正文/运营说明</span>
              <textarea
                value={selected.content}
                onChange={(event) => updateSelected({ content: event.target.value })}
                className="min-h-40 resize-y rounded-lg border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-brand-500"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-black text-neutral-500">状态</span>
                <select
                  value={selected.status}
                  onChange={(event) => updateSelected({ status: event.target.value })}
                  className="h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-500"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="offline">已下线</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black text-neutral-500">排序</span>
                <input
                  type="number"
                  value={selected.sortOrder}
                  onChange={(event) => updateSelected({ sortOrder: Number(event.target.value) })}
                  className="h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-500"
                />
              </label>
            </div>
            <div>
              <div className="text-xs font-black text-neutral-500">封面图</div>
              <label className="mt-2 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-paper p-4 text-center hover:border-brand-500">
                {selected.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.coverUrl} alt={selected.title} className="max-h-64 rounded-lg object-contain" />
                ) : (
                  <>
                    <ImagePlus size={28} className="text-neutral-400" />
                    <div className="mt-2 text-sm font-bold">上传专栏封面</div>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadCover(event.target.files?.[0])} />
              </label>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
