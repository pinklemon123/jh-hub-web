# 镜湖 Hub Web

镜湖 Hub Web 是一个面向校园技术协作的社区主站，不是企业官网或后台模板。当前版本已经接入 PostgreSQL + Prisma，包含内容流、帖子详情、评论、组队、私信、发现页运营、图片上传、审核后台和规则推荐接口。

## 技术栈

- Next.js App Router
- React 19
- Tailwind CSS
- Prisma 7
- PostgreSQL
- React Query
- Zustand
- lucide-react

## 当前功能

- 首页内容流：帖子、图片缩略图、右侧在线同学、热门标签、最近组队和校园公告。
- 帖子系统：发帖、图片上传、帖子详情、评论、作者主页、相关推荐。
- 组队系统：项目缺口、所需技能、当前技能、推荐补位同学。
- 私信系统：用于项目联系和交换联系方式；手机号、微信、QQ 不拦截，辱骂和违法风险仍拦截。
- 发现页：学校官号、校园公告、活动图轮播、推荐项目、推荐队友、相关技术讨论。
- 运营后台：内容管理、审核中心、举报中心、用户管理、警告私信、发现运营、公告运营、风控规则、审核日志。
- 图片系统：帖子图、公告图、发现推送封面统一走 `/api/uploads/images`，数据库只保存 URL。
- 推荐系统：规则驱动 + 标签匹配，不依赖 AI、大模型或 embedding。

## 推荐逻辑

当前阶段只做规则推荐，方便解释、调试和给 Flutter 端复用。

技术贴推荐：

```txt
用户技能 / 兴趣标签
↓
匹配帖子 tags / requiredSkills
↓
按命中数量和热度排序
```

组队推荐：

```txt
requiredSkills - currentSkills = missingSkills
↓
用户 skills 命中 missingSkills
↓
推荐为可补位队友
```

核心代码：

- `src/lib/recommendations.ts`
- `src/lib/discover-data.ts`
- `src/app/api/recommendations/route.ts`
- `src/app/api/discover/route.ts`

## 本地启动

安装依赖：

```bash
npx pnpm install
```

配置 `.env`：

```env
DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/jinghu_hub?schema=public"
ADMIN_PASSWORD_HASH="scrypt:..."
ADMIN_SESSION_SECRET="换成一段足够长的随机字符串"
```

生成管理员密码哈希：

```bash
node -e "const {scryptSync,randomBytes}=require('crypto');const p=process.argv[1];const salt=randomBytes(16).toString('hex');console.log('scrypt:'+salt+':'+scryptSync(p,salt,64).toString('hex'))" "你的后台密码"
```

同步数据库：

```bash
npx prisma generate
npx prisma db push
```

启动开发服务：

```bash
npx pnpm dev
```

默认访问：

- 用户端：http://localhost:3000
- 发现页：http://localhost:3000/discover
- 组队页：http://localhost:3000/teams
- 后台：http://localhost:3000/admin
- Prisma Studio：`npx prisma studio`

## 常用命令

```bash
npx pnpm dev          # 开发服务
npx pnpm build        # 生产构建
npx pnpm typecheck    # TypeScript 检查
npx prisma generate   # 生成 Prisma Client
npx prisma db push    # 同步数据库结构
npx prisma studio     # 查看和编辑数据库
```

## 主要接口

用户端：

- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `GET /api/posts/:id/comments`
- `POST /api/posts/:id/comments`
- `GET /api/users`
- `GET /api/users/:id`
- `GET /api/teams`
- `POST /api/teams`
- `GET /api/messages`
- `POST /api/messages`
- `POST /api/uploads/images`
- `GET /api/recommendations?userId=u_001`
- `GET /api/discover?userId=u_001`

后台：

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/overview`
- `GET /api/admin/moderation`
- `POST /api/admin/moderation/actions`
- `GET /api/admin/reports`
- `POST /api/admin/reports/:id/action`
- `GET /api/admin/users`
- `GET /api/admin/rules`
- `GET /api/admin/logs`
- `GET /api/admin/columns`
- `GET /api/admin/announcements`
- `GET /api/admin/system-messages`

## 数据库模型重点

- `hub_users`：用户、技能、在线状态、个人资料。
- `community_posts`：帖子、类型、标签、所需技能、审核状态。
- `post_images`：帖子图片 URL。
- `post_comments`：评论和审核状态。
- `direct_messages`：私信和风控状态。
- `team_projects`：组队项目、所需技能、已有技能、缺口技能。
- `editorial_columns`：发现运营 / 学校官号推送。
- `announcements`：公告和活动轮播图。
- `reports`：举报。
- `moderation_rules`：风控规则。
- `admin_audit_logs`：后台审核日志。
- `uploaded_assets`：上传资源记录。

## 目录结构

```txt
src/
  app/                 Next.js 页面和 API Routes
  components/          前台和后台组件
  data/                初始种子数据和兜底数据
  generated/prisma/    Prisma Client 输出目录
  lib/                 Prisma、审核、推荐、发现数据等服务逻辑
  services/            前端 API 封装
  types/               业务类型
```

## 运营链路

发现页的运营内容来自数据库：

```txt
后台公告运营 / 发现运营
↓
上传图片到 /api/uploads/images
↓
数据库保存 image_url / cover_url
↓
/api/discover 聚合学校官号、公告轮播和推荐数据
↓
Web 发现页和后续 Flutter App 共用
```

## 注意

- 不要把 Flutter 构建产物放进这个 Web 项目。
- 不要把 `.env`、数据库密码、管理员哈希提交到 Git。
- 图片文件可以先用本地 `public/uploads`，后续再迁到 MinIO / R2。
- 当前推荐系统是第一阶段规则匹配，先保证数据闭环和用户行为链路。
