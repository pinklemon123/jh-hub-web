"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { Card } from "./ui";

export default function ProfileEditForm({ initialUser }: { initialUser: User }) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name);
  const [bio, setBio] = useState(initialUser.bio);
  const [contact, setContact] = useState(initialUser.contact);
  const [skills, setSkills] = useState(initialUser.skills.join(", "));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const editedRaw = localStorage.getItem("editedUsers");
    if (editedRaw) {
      try {
        const map = JSON.parse(editedRaw || "{}");
        const u = map[initialUser.id];
        if (u) {
          setName(u.name ?? name);
          setBio(u.bio ?? bio);
          setContact(u.contact ?? contact);
          setSkills((u.skills && u.skills.join(", ")) ?? skills);
        }
      } catch (e) {
        // ignore
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function save() {
    const updated: User = {
      ...initialUser,
      name,
      bio,
      contact,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const key = "editedUsers";
    const existing = JSON.parse(localStorage.getItem(key) || "{}");
    existing[initialUser.id] = updated;
    localStorage.setItem(key, JSON.stringify(existing));
    router.push(`/profile/${initialUser.id}`);
  }

  return (
    <Card>
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-600">名称</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-600">简介</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-600">联系方式</label>
          <input value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-600">技能（逗号分隔）</label>
          <input value={skills} onChange={(e) => setSkills(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="rounded bg-black px-4 py-2 text-white">保存</button>
          <button onClick={() => router.back()} className="rounded border px-4 py-2">取消</button>
        </div>
      </div>
    </Card>
  );
}
