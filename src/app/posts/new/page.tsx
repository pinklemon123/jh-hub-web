import { AppShell } from "@/components/app-shell";
import { ImageUploader } from "@/components/image-uploader";
import { Button, Card, Tag } from "@/components/ui";

export default function NewPostPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl">
        <Card className="p-5">
          <h1 className="text-2xl font-black">发布内容</h1>
          <p className="mt-2 text-sm text-neutral-500">第一版围绕技术贴、组队贴和活动互助，图片只做轻量项目展示。</p>
          <div className="mt-5 space-y-4">
            <input className="h-11 w-full rounded-lg border border-line bg-paper px-4 text-sm outline-none focus:border-brand-500" placeholder="标题" />
            <div className="flex flex-wrap gap-2">
              {["技术贴", "组队", "活动", "求建议"].map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
            <textarea
              className="min-h-44 w-full resize-y rounded-lg border border-line bg-paper px-4 py-3 text-sm leading-6 outline-none focus:border-brand-500"
              placeholder="说清楚你在做什么、需要什么、当前进度如何。"
            />
            <ImageUploader />
            <input className="h-11 w-full rounded-lg border border-line bg-paper px-4 text-sm outline-none focus:border-brand-500" placeholder="标签，例如 Flutter、后端、数学建模" />
            <input className="h-11 w-full rounded-lg border border-line bg-paper px-4 text-sm outline-none focus:border-brand-500" placeholder="缺少角色，例如 UI、后端、PPT" />
            <div className="rounded-lg bg-paper px-3 py-2 text-xs leading-5 text-neutral-500">
              图片文件不进数据库；后端只保存 `image_url`。学校服务器第一版可以映射 `/uploads/posts/xxx.webp`。
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary">存草稿</Button>
              <Button>发布</Button>
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
