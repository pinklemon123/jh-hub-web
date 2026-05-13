import { CheckCircle2, ShieldAlert } from "lucide-react";

export function AdminHeaderActions() {
  return (
    <>
      <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-bold">
        <CheckCircle2 size={16} />
        批量通过
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-neutral-950 px-3 text-sm font-bold text-white">
        <ShieldAlert size={16} />
        创建风控规则
      </button>
    </>
  );
}
