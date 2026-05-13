"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { adminRules } from "@/data/admin";
import type { AdminRule } from "@/types/admin";

export function RulesPanel({ limit }: { limit?: number }) {
  const [rules, setRules] = useState<AdminRule[]>(adminRules);

  useEffect(() => {
    fetch("/api/admin/rules", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { items?: AdminRule[] }) => setRules(data.items ?? []))
      .catch(() => undefined);
  }, []);

  const visibleRules = typeof limit === "number" ? rules.slice(0, limit) : rules;

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-subtle">
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-brand-600" />
        <h2 className="font-black">风控规则中心</h2>
      </div>
      <div className="mt-4 space-y-2">
        {visibleRules.map((rule) => (
          <article key={rule.id} className="rounded-lg border border-line p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-black">{rule.name}</div>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                {rule.enabled ? "启用" : "停用"}
              </span>
            </div>
            <div className="mt-2 text-xs leading-5 text-neutral-500">
              {rule.trigger} · {rule.action}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
