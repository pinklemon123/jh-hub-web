"use client";

import { Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, Button, Card } from "@/components/ui";
import { conversations, messages, notifications, users } from "@/data/mock";
import type { Message } from "@/types";

export function MessageCenter() {
  const [activeId, setActiveId] = useState("c_system");
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);

  const activeConversation = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];
  const activeMessages = localMessages.filter((message) => message.conversationId === activeConversation.id);
  const directConversations = conversations.filter((conversation) => conversation.kind === "direct");
  const systemConversation = conversations.find((conversation) => conversation.kind === "system");

  const systemItems = useMemo(
    () => [
      ...notifications.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        time: item.time,
        unread: item.unread
      })),
      ...localMessages
        .filter((message) => message.conversationId === "c_system")
        .map((message) => ({
          id: message.id,
          title: "镜湖Hub助手",
          body: message.content,
          time: message.time,
          unread: false
        }))
    ],
    [localMessages]
  );

  function sendMessage() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setLocalMessages((current) => [
      ...current,
      {
        id: `local_${Date.now()}`,
        conversationId: activeConversation.id,
        senderId: "u_001",
        content: trimmed,
        time: "刚刚"
      }
    ]);
    setDraft("");
  }

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[340px_1fr]">
      <Card className="overflow-hidden">
        <div className="border-b border-line p-4">
          <h1 className="text-xl font-black">消息中心</h1>
          <p className="mt-1 text-sm text-neutral-500">系统通知、评论提醒、组队通知和私信放在同一个入口。</p>
        </div>

        <div className="border-b border-line p-3">
          {systemConversation && (
            <button
              onClick={() => setActiveId(systemConversation.id)}
              className={`flex w-full gap-3 rounded-lg p-3 text-left ${
                activeId === systemConversation.id ? "bg-brand-50" : "hover:bg-paper"
              }`}
            >
              <Avatar label={systemConversation.target.avatar} className="size-9" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate text-sm font-black">{systemConversation.target.name}</div>
                  <div className="text-xs text-neutral-500">{systemConversation.time}</div>
                </div>
                <div className="mt-1 truncate text-sm text-neutral-500">{systemConversation.lastMessage}</div>
              </div>
            </button>
          )}
        </div>

        <div className="p-3">
          <div className="mb-2 px-1 text-xs font-black text-neutral-500">项目私信</div>
          <div className="space-y-1">
            {directConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveId(conversation.id)}
                className={`flex w-full gap-3 rounded-lg p-3 text-left ${
                  activeId === conversation.id ? "bg-brand-50" : "hover:bg-paper"
                }`}
              >
                <Avatar label={conversation.target.avatar} className="size-9" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-black">{conversation.target.name}</div>
                    <div className="text-xs text-neutral-500">{conversation.time}</div>
                  </div>
                  <div className="mt-1 truncate text-xs font-semibold text-brand-700">{conversation.project}</div>
                  <div className="mt-1 truncate text-sm text-neutral-500">{conversation.lastMessage}</div>
                </div>
                {conversation.unread > 0 && (
                  <span className="mt-1 grid size-5 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {conversation.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <Avatar label={activeConversation.target.avatar} />
          <div>
            <div className="font-black">{activeConversation.target.name}</div>
            <div className="text-xs text-neutral-500">{activeConversation.project}</div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-paper p-4">
          {activeConversation.kind === "system" ? (
            systemItems.map((item) => (
              <article key={item.id} className="rounded-lg border border-line bg-white p-4">
                <div className="flex items-center gap-2">
                  {item.unread && <span className="size-2 rounded-full bg-brand-600" />}
                  <h2 className="text-sm font-black">{item.title}</h2>
                  <span className="ml-auto text-xs text-neutral-500">{item.time}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{item.body}</p>
              </article>
            ))
          ) : (
            activeMessages.map((message) => {
              const mine = message.senderId === "u_001";
              const sender = users.find((user) => user.id === message.senderId);
              return (
                <div key={message.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine && sender && <Avatar label={sender.avatar} className="size-8" />}
                  <div
                    className={`max-w-[78%] rounded-lg px-4 py-3 text-sm leading-6 ${
                      mine ? "bg-brand-600 text-white" : "bg-white text-neutral-700"
                    }`}
                  >
                    {message.content}
                    <div className={`mt-1 text-xs ${mine ? "text-white/70" : "text-neutral-400"}`}>{message.time}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activeConversation.kind === "direct" && (
          <div className="flex gap-3 border-t border-line p-4">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="h-11 flex-1 rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-brand-500"
              placeholder="围绕项目沟通下一步"
            />
            <Button size="icon" aria-label="发送消息" onClick={sendMessage}>
              <Send size={17} />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
