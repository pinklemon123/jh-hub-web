import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export default function Page() {
  return <Suspense fallback={<p className="p-8" role="status">正在加载…</p>}><AuthForm register /></Suspense>;
}
