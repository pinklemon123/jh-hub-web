"use client";

import { MessageSquareWarning, Search, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@/types";

interface SentWarning {
  id: string;
  scope: "all" | "user";
  targetName: string;
  title: string;
  body: string;
  createdAt: string;
}

const warningTemplates = [
  {
    title: "内容违规警告",
    body: "你近期发布或发送的内容存在违规风险，请遵守社区规范。再次违规可能会被限制发帖或私信。"
  },
  {
    title: "私信行为提醒",
    body: "系统检测到你的私信行为存在异常，请勿重复发送、骚扰他人或引导站外联系。"
  },
  {
    title: "举报处理通知",
    body: "你被用户举报的内容已进入管理员处理流程，请及时自查并遵守平台规则。"
  }
];

export function WarningMessagePanel() {
  const [members, setMembers] = useState<User[]>([]);
  const [scope, setScope] = useState<"all" | "user">("user");
  const [keyword, setKeyword] = useState("");
  const [target, setTarget] = useState<User | null>(null);
  const [title, setTitle] = useState(warningTemplates[0].title);
  const [body, setBody] = useState(warningTemplates[0].body);
  const [sentWarnings, setSentWarnings] = useState<SentWarning[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data: { items?: User[] }) => {
        const users = (data.items ?? []).filter((user) => user.id !== "system");
        setMembers(users);
        setTarget(users[0] ?? null);
      })
      .catch(() => setMembers([]));
  }, []);

  const matchedUsers = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    if (!value) return members.slice(0, 8);
    return members
      .filter((user) => `${user.name} ${user.realName} ${user.college} ${user.direction}`.toLowerCase().includes(value))
      .slice(0, 12);
  }, [keyword, members]);

  const targetName = scope === "all" ? `全体用户（${members.length}人）` : target?.name ?? "未选择用户";

  function applyTemplate(index: number) {
    setTitle(warningTemplates[index].title);
    setBody(warningTemplates[index].body);
  }

  async function sendWarning() {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody || (scope === "user" && !target)) return;

    setSending(true);
    await fetch("/api/admin/system-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope,
        targetUserId: scope === "user" ? target?.id : null,
        targetName,
        title: trimmedTitle,
        body: trimmedBody,
        messageType: "warning"
      })
    });

    setSentWarnings((current) => [
      {
        id: `warn_${Date.now()}`,
        scope,
        targetName,
        title: trimmedTitle,
        body: trimmedBody,
        createdAt: "刚刚"
      },
      ...current
    ]);
    setSending(false);
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="rounded-lg border border-line bg-white p-4 shadow-subtle">
        <div className="flex items-center gap-2">
          <MessageSquareWarning size={18} className="text-brand-600" />
          <h2 className="font-black">发送管理私信</h2>
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <div className="text-xs font-black text-neutral-500">发送范围</div>
            <div className="mt-2 flex rounded-lg border border-line bg-paper p-1">
              <button
                onClick={() => setScope("user")}
                className={`h-9 flex-1 rounded-md text-sm font-bold ${scope === "user" ? "bg-white text-brand-700 shadow-sm" : "text-neutral-500"}`}
              >
                搜索用户
              </button>
              <button
                onClick={() => setScope("all")}
                className={`h-9 flex-1 rounded-md text-sm font-bold ${scope === "all" ? "bg-white text-brand-700 shadow-sm" : "text-neutral-500"}`}
              >
                全体通知
              </button>
            </div>
          </div>

          {scope === "user" ? (
            <div>
              <div className="text-xs font-black text-neutral-500">按用户名、实名、学院或方向搜索</div>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-line px-3">
                <Search size={16} className="text-neutral-400" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="min-w-0 flex-1 text-sm outline-none"
                  placeholder="例如：镜湖、陈洲、软件学院"
                />
              </div>
              <div className="mt-2 max-h-56 space-y-2 overflow-y-auto">
                {matchedUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setTarget(user)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left ${
                      target?.id === user.id ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:bg-paper"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-black">{user.name}</div>
                      <div className="mt-1 text-xs text-neutral-500">
                        {user.realName} / {user.college} / {user.direction}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-700">{user.id}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              全体通知会作为系统私信写入后台消息表，前台私信中心后续读取 `system_messages` 后会统一展示。
            </div>
          )}

          <div>
            <div className="text-xs font-black text-neutral-500">快速模板</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {warningTemplates.map((template, index) => (
                <button key={template.title} onClick={() => applyTemplate(index)} className="rounded-lg border border-line px-3 py-2 text-sm font-bold">
                  {template.title}
                </button>
              ))}
            </div>
          </div>

          <label className="grid gap-2">
            <span className="text-xs font-black text-neutral-500">私信标题</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-500"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black text-neutral-500">私信内容</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="min-h-36 resize-y rounded-lg border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-brand-500"
            />
          </label>

          <button
            onClick={sendWarning}
            disabled={sending || (scope === "user" && !target)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-bold text-white disabled:opacity-60"
          >
            <Send size={16} />
            {sending ? "发送中" : "发送管理私信"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <section className="rounded-lg border border-line bg-white p-4 shadow-subtle">
          <h2 className="font-black">发送预览</h2>
          <div className="mt-4 rounded-lg border border-line bg-paper p-4">
            <div className="text-xs font-black text-neutral-500">收件人</div>
            <div className="mt-1 font-black">{targetName}</div>
            <div className="mt-4 text-xs font-black text-neutral-500">标题</div>
            <div className="mt-1 font-black">{title}</div>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{body}</p>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-subtle">
          <h2 className="font-black">本页发送记录</h2>
          <div className="mt-4 space-y-3">
            {sentWarnings.length === 0 ? (
              <p className="text-sm text-neutral-500">暂无发送记录。</p>
            ) : (
              sentWarnings.map((warning) => (
                <article key={warning.id} className="rounded-lg border border-line p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-black">{warning.title}</div>
                    <span className="text-xs text-neutral-400">{warning.createdAt}</span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-brand-700">{warning.targetName}</div>
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{warning.body}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
