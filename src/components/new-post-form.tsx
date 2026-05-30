"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { Button, Card, Tag } from "@/components/ui";

const postTypes = [
  { label: "技术帖", value: "TECH" },
  { label: "组队帖", value: "TEAM_UP" },
  { label: "活动帖", value: "EVENT" }
];

export function NewPostForm() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("TECH");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(status = "已发布") {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        type,
        content,
        summary: content.slice(0, 120),
        tags: splitList(tags),
        requiredSkills: splitList(requiredSkills),
        images: imageUrls,
        status
      })
    });
    const data = (await response.json()) as { item?: { id: string }; error?: string; message?: string; moderation?: { message: string } };
    setSaving(false);
    if (!response.ok) {
      setMessage(data.message ?? data.moderation?.message ?? "发布失败，请检查内容或数据库连接。");
      return;
    }
    if (data.item?.id) {
      setMessage("已提交审核，管理员通过后会在内容流展示。");
      setTitle("");
      setContent("");
      setTags("");
      setRequiredSkills("");
      setImageUrls([]);
    }
  }

  return (
    <Card className="p-5">
      <h1 className="text-2xl font-black">发布内容</h1>
      <p className="mt-2 text-sm text-neutral-500">发帖会写入本机 PostgreSQL，图片会保存到 public/uploads/posts。</p>
      <div className="mt-5 space-y-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-11 w-full rounded-lg border border-line bg-paper px-4 text-sm outline-none focus:border-brand-500"
          placeholder="标题"
        />
        <div className="flex flex-wrap gap-2">
          {postTypes.map((item) => (
            <button key={item.value} type="button" onClick={() => setType(item.value)}>
              <Tag className={type === item.value ? "border-brand-100 bg-brand-50 text-brand-700" : ""}>{item.label}</Tag>
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-44 w-full resize-y rounded-lg border border-line bg-paper px-4 py-3 text-sm leading-6 outline-none focus:border-brand-500"
          placeholder="详细说明你的项目、问题、需求或活动信息"
        />
        <ImageUploader onUploadedChange={setImageUrls} />
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          className="h-11 w-full rounded-lg border border-line bg-paper px-4 text-sm outline-none focus:border-brand-500"
          placeholder="标签，例如 Flutter, 后端, 数学建模"
        />
        <input
          value={requiredSkills}
          onChange={(event) => setRequiredSkills(event.target.value)}
          className="h-11 w-full rounded-lg border border-line bg-paper px-4 text-sm outline-none focus:border-brand-500"
          placeholder="缺少技能，例如 UI, 后端, PPT"
        />
        {message && <div className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">{message}</div>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" disabled={saving} onClick={() => submit("草稿")}>
            保存草稿
          </Button>
          <Button type="button" disabled={saving} onClick={() => submit("已发布")}>
            {saving ? "发布中" : "发布"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function splitList(value: string) {
  return value
    .split(/[,，、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
