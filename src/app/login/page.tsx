import Image from "next/image";
import { Button, Card } from "@/components/ui";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center gap-3">
          <Image src="/jinghu-logo.png" alt="镜湖 Hub" width={44} height={44} className="rounded-lg" />
          <div>
            <h1 className="text-xl font-black">登录镜湖 Hub</h1>
            <p className="text-sm text-neutral-500">使用校园账号进入社区</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <input className="h-11 w-full rounded-lg border border-line bg-paper px-4 text-sm outline-none focus:border-brand-500" placeholder="学号或邮箱" />
          <input className="h-11 w-full rounded-lg border border-line bg-paper px-4 text-sm outline-none focus:border-brand-500" placeholder="密码" type="password" />
          <Button className="w-full">登录</Button>
          <Button className="w-full" variant="secondary">CAS 统一认证</Button>
        </div>
      </Card>
    </main>
  );
}
