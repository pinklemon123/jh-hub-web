"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { colleges, getCollegeKeyByName } from "@/data/colleges";
import type { User } from "@/types";
import { Button, Card } from "./ui";

export default function ProfileEditForm({ initialUser }: { initialUser: User }) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name);
  const [college, setCollege] = useState(getCollegeKeyByName(initialUser.college) ?? "");
  const [bio, setBio] = useState(initialUser.bio);
  const [contact, setContact] = useState(initialUser.contact);
  const [skills, setSkills] = useState(initialUser.skills.join(", "));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setError("");
    try {
    const response = await fetch(`/api/users/${initialUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        college: colleges.find((item) => item.key === college)?.label ?? initialUser.college,
        bio,
        contact,
        skills: splitList(skills)
      })
    });
    if (!response.ok) { const data = await response.json(); setError(data.message ?? "保存失败。"); return; }
    router.push(`/profile/${initialUser.id}`);
    router.refresh();
    } catch { setError("网络连接失败，请重试。"); }
    finally { setSaving(false); }
  }

  return (
    <Card>
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-600">昵称</label>
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-600">学院</label>
          <select value={college} onChange={(event) => setCollege(event.target.value)} className="mt-1 w-full rounded border px-3 py-2">
            <option value="">请选择学院</option>
            {colleges.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-600">简介</label>
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-600">联系方式</label>
          <input value={contact} onChange={(event) => setContact(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-600">技能，逗号分隔</label>
          <input value={skills} onChange={(event) => setSkills(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "保存中" : "保存"}
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>
            取消
          </Button>
        </div>
      </div>
    </Card>
  );
}

function splitList(value: string) {
  return value
    .split(/[,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
