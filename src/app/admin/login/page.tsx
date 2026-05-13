import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f7f8] px-4">
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
