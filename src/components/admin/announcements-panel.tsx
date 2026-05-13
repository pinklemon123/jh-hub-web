"use client";

import { ImagePlus, Megaphone, Plus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  slot: "首页公告" | "活动轮播" | "系统通知";
  status: "展示中" | "草稿" | "已下线";
  imageUrl?: string;
}

const initialAnnouncements: AnnouncementItem[] = [
  {
    id: "ann_001",
    title: "挑战杯校内互助周开放",
    body: "本周开放挑战杯项目互助、队友招募和路演材料互评。",
    slot: "首页公告",
    status: "展示中"
  },
  {
    id: "ann_002",
    title: "软件学院项目路演征集",
    body: "欢迎提交项目 Demo、海报和展示页，优秀项目会进入首页推荐。",
    slot: "活动轮播",
    status: "展示中"
  },
  {
    id: "ann_003",
    title: "新生工具共创计划招募",
    body: "面向新生工具、校园地图、课程资料整理等方向招募成员。",
    slot: "系统通知",
    status: "草稿"
  }
];

export function AnnouncementsPanel() {
  const [items, setItems] = useState(initialAnnouncements);
  const [selectedId, setSelectedId] = useState(initialAnnouncements[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0], [items, selectedId]);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/announcements")
      .then((response) => response.json())
      .then((data: { items?: Array<AnnouncementItem & { imageUrl?: string }> }) => {
        if (!alive || !data.items?.length) return;
        const nextItems = data.items.map((item) => ({
          ...item,
          slot: normalizeSlot(item.slot),
          status: normalizeStatus(item.status)
        }));
        setItems(nextItems);
        setSelectedId(nextItems[0].id);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  function updateSelected(patch: Partial<AnnouncementItem>) {
    if (!selected) return;
    setItems((current) => current.map((item) => (item.id === selected.id ? { ...item, ...patch } : item)));
  }

  function createAnnouncement() {
    const next: AnnouncementItem = {
      id: `ann_${Date.now()}`,
      title: "新的公告",
      body: "填写公告内容",
      slot: "首页公告",
      status: "草稿"
    };
    setItems((current) => [next, ...current]);
    setSelectedId(next.id);
  }

  function handleImage(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateSelected({ imageUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }

  async function saveSelected() {
    if (!selected) return;
    setSaving(true);
    const payload = {
      ...selected,
      slot: slotToApi(selected.slot),
      status: statusToApi(selected.status)
    };
    const isLocalDraft = selected.id.startsWith("ann_");
    const response = await fetch(isLocalDraft ? "/api/admin/announcements" : `/api/admin/announcements/${selected.id}`, {
      method: isLocalDraft ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { item?: AnnouncementItem };
    if (data.item) {
      const saved = {
        ...data.item,
        slot: normalizeSlot(data.item.slot),
        status: normalizeStatus(data.item.status)
      };
      setItems((current) => current.map((item) => (item.id === selected.id ? saved : item)));
      setSelectedId(saved.id);
    }
    setSaving(false);
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="rounded-lg border border-line bg-white p-4 shadow-subtle">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-brand-600" />
            <h2 className="font-black">公告列表</h2>
          </div>
          <button onClick={createAnnouncement} className="inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-950 px-3 text-sm font-bold text-white">
            <Plus size={16} />
            新建
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`w-full rounded-lg border p-3 text-left ${
                item.id === selected?.id ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:bg-paper"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-black">{item.title}</div>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">{item.status}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{item.body}</p>
              <div className="mt-2 text-xs font-bold text-neutral-400">{item.slot}</div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="rounded-lg border border-line bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black">编辑公告</h2>
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
              <span className="text-xs font-black text-neutral-500">标题</span>
              <input
                value={selected.title}
                onChange={(event) => updateSelected({ title: event.target.value })}
                className="h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-500"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black text-neutral-500">内容</span>
              <textarea
                value={selected.body}
                onChange={(event) => updateSelected({ body: event.target.value })}
                className="min-h-28 resize-y rounded-lg border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-brand-500"
              />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-black text-neutral-500">展示位置</span>
                <select
                  value={selected.slot}
                  onChange={(event) => updateSelected({ slot: event.target.value as AnnouncementItem["slot"] })}
                  className="h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-500"
                >
                  <option>首页公告</option>
                  <option>活动轮播</option>
                  <option>系统通知</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black text-neutral-500">状态</span>
                <select
                  value={selected.status}
                  onChange={(event) => updateSelected({ status: event.target.value as AnnouncementItem["status"] })}
                  className="h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-500"
                >
                  <option>展示中</option>
                  <option>草稿</option>
                  <option>已下线</option>
                </select>
              </label>
            </div>

            <div>
              <div className="text-xs font-black text-neutral-500">公告图片</div>
              <label className="mt-2 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-paper p-4 text-center hover:border-brand-500">
                {selected.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.imageUrl} alt={selected.title} className="max-h-64 rounded-lg object-contain" />
                ) : (
                  <>
                    <ImagePlus size={28} className="text-neutral-400" />
                    <div className="mt-2 text-sm font-bold">上传公告图 / 轮播图</div>
                    <div className="mt-1 text-xs text-neutral-500">支持活动海报、Banner、通知配图</div>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImage(event.target.files?.[0])} />
              </label>
            </div>

            <div className="rounded-lg border border-line bg-paper p-4">
              <div className="text-xs font-black text-neutral-500">前台预览</div>
              <div className="mt-3 rounded-lg border border-line bg-white p-4">
                {selected.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.imageUrl} alt={selected.title} className="mb-3 aspect-[16/7] w-full rounded-lg object-cover" />
                )}
                <div className="font-black">{selected.title}</div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{selected.body}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function normalizeSlot(value: string): AnnouncementItem["slot"] {
  if (value === "carousel" || value === "活动轮播") return "活动轮播";
  if (value === "system" || value === "系统通知") return "系统通知";
  return "首页公告";
}

function normalizeStatus(value: string): AnnouncementItem["status"] {
  if (value === "published" || value === "展示中") return "展示中";
  if (value === "offline" || value === "已下线") return "已下线";
  return "草稿";
}

function slotToApi(value: AnnouncementItem["slot"]) {
  if (value === "活动轮播") return "carousel";
  if (value === "系统通知") return "system";
  return "home";
}

function statusToApi(value: AnnouncementItem["status"]) {
  if (value === "展示中") return "published";
  if (value === "已下线") return "offline";
  return "draft";
}
