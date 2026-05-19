# Jinghu Hub 用户端移动版功能与接口说明

本文档按当前 Web 版源码整理，用于移动端移植。移动端范围只包含用户端功能，不移植后台审核、后台管理、后台登录、规则配置、举报处理、审计日志、运营内容后台编辑等管理台能力。

## 1. 移动端需要实现的页面

### 1.1 首页信息流

对应 Web 路由：`/`

功能：
- 展示帖子列表。
- 支持关键词搜索，搜索范围：标题、摘要、标签。
- 支持分类 Tab：
  - 全部
  - 最新
  - 热门：`heat > 80`
  - 组队：`type === "TEAM_UP"`
  - 技术：`type === "TECH"`
- 展示右侧栏信息在移动端可改为独立入口或首页模块：
  - 在线同学
  - 热门技术标签
  - 最新组队
  - 校园公告

主要接口：
- `GET /api/posts`
- 右侧栏当前 Web 由服务端直接查库，没有独立接口。移动端建议复用：
  - 用户：`GET /api/users`
  - 组队：`GET /api/teams`
  - 公告目前没有用户端独立接口，如移动端需要公告列表，建议新增用户端接口或让后端开放已发布公告接口。

### 1.2 帖子详情

对应 Web 路由：`/posts/:id`

功能：
- 展示帖子标题、作者、发布时间、分类、板块、正文、图片、标签、状态、开放名额。
- 展示作者卡片。
- 展示评论列表。
- 发表评论。
- 回复评论。
- 本地删除“我的评论”（Web 目前只从前端列表移除，没有调用删除接口）。
- 举报帖子、评论。
- 展示相关帖子。
- 展示推荐队友。
- 点击“联系作者”进入消息页。

主要接口：
- `GET /api/posts/:id`
- `GET /api/posts/:id/comments`
- `POST /api/posts/:id/comments`
- `POST /api/reports`

### 1.3 发帖

对应 Web 路由：`/posts/new`

功能：
- 输入标题。
- 选择帖子类型：
  - `TECH`：技术帖
  - `TEAM_UP`：组队帖
  - `EVENT`：活动帖
- 输入正文。
- 上传 0-4 张图片。
- 输入标签，逗号或空格分隔。
- 输入所需技能，逗号或空格分隔。
- 保存草稿或发布。
- 发帖内容会进入内容风控：
  - 高风险会被阻断，接口返回 `content_blocked`。
  - 正常或待审核内容会创建成功，但可能需要后台通过后才在公开列表展示。

主要接口：
- `POST /api/uploads/images`
- `POST /api/posts`

### 1.4 发现页

对应 Web 路由：`/discover`

功能：
- 展示学校官方内容/校园公告轮播。
- 展示“适合我的项目”推荐。
- 展示“推荐队友”。
- 展示“与你相关的技术讨论”。
- 当前推荐策略是规则匹配，不是 AI：
  - 根据用户技能 `user.skills`
  - 匹配项目缺口技能 `team.missingSkills`
  - 匹配项目标签 `team.tags`
  - 匹配帖子标签/所需技能

主要接口：
- `GET /api/discover?userId=u_001`
- 或单独用：`GET /api/recommendations?userId=u_001`

### 1.5 组队广场

对应 Web 路由：`/teams`

功能：
- 展示所有组队项目。
- 展示项目标题、摘要、负责人、状态、人数、缺口角色、所需技能、当前技能、缺口技能、标签、阶段。
- 展示当前热门缺口技能。
- Web 目前有创建组队接口，但页面主要是展示；移动端如果要“功能都有”，建议提供创建组队入口。

主要接口：
- `GET /api/teams`
- `POST /api/teams`

### 1.6 消息中心

对应 Web 路由：`/messages`

功能：
- 会话列表：
  - 系统通知会话
  - 项目私信会话
- 系统通知：
  - 本地 mock 通知
  - 后台创建的系统消息
  - conversationId 为 `c_system` 的消息
- 私信：
  - 展示消息气泡。
  - 发送消息。
  - 举报对方消息。
- 私信内容允许联系方式，但仍会做违规内容检测。

主要接口：
- `GET /api/messages`
- `POST /api/messages`
- `GET /api/system-messages`
- `POST /api/reports`

注意：
- Web 的会话列表 `conversations` 目前来自本地 mock 数据，不是接口返回。移动端若要真实会话列表，建议后端补充 `GET /api/conversations`。
- `src/services/api.ts` 中写了 `/api/conversations`、`/api/notifications`、`/api/team/apply`，但当前源码没有对应 route，移动端不要直接依赖这些接口。

### 1.7 个人主页

对应 Web 路由：`/profile/:id`

功能：
- 展示用户资料：
  - 昵称
  - 真实姓名
  - 学院
  - 年级
  - 方向
  - 头像标识
  - 简介
  - 联系方式
  - 状态
  - 在线状态
  - 技能
  - 数据统计
- 展示该用户发布的帖子。
- 展示该用户负责的组队项目。
- 当前登录用户 `u_001` 可进入编辑资料。

主要接口：
- `GET /api/users/:id`
- 页面补充内容可用：
  - `GET /api/posts` 后按 `authorId` 过滤
  - `GET /api/teams` 后按 `leaderId` 过滤

### 1.8 编辑个人资料

对应 Web 路由：`/profile/:id/edit`

功能：
- 修改昵称。
- 修改简介。
- 修改联系方式。
- 修改技能。
- Web 接口还支持修改方向和状态。

主要接口：
- `PATCH /api/users/:id`

### 1.9 登录页

对应 Web 路由：`/login`

功能现状：
- Web 只有静态登录表单，没有真实用户登录接口。
- 前端默认当前用户为 `u_001`，见 `src/store/use-session-store.ts`。

移动端处理建议：
- 第一版如果沿用 Web，可固定默认用户 `u_001`。
- 如果要正式上线，需要后端新增用户认证接口，例如登录、退出、刷新 token、当前用户信息。

## 2. 通用数据结构

### 2.1 通用响应格式

列表：

```json
{
  "ok": true,
  "items": []
}
```

单项：

```json
{
  "ok": true,
  "item": {}
}
```

错误：

```json
{
  "ok": false,
  "error": "not_found"
}
```

部分接口会带：

```json
{
  "source": "database"
}
```

`source` 可能是：
- `database`
- `mock`

### 2.2 Post

```ts
type PostType = "TECH" | "TEAM_UP" | "EVENT";

interface Post {
  id: string;
  title: string;
  type: PostType;
  authorId: string;
  author: string;
  authorAvatar: string;
  category: string;
  board: string;
  summary: string;
  content: string;
  images: PostImage[];
  tags: string[];
  requiredSkills: string[];
  openSlots: number;
  status: string;
  createdAt: string;
  comments: number;
  heat: number;
}
```

### 2.3 PostImage

```ts
interface PostImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}
```

### 2.4 Comment

```ts
interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: string;
  authorAvatar: string;
  content: string;
  time: string;
  replyTo?: string;
  mine?: boolean;
}
```

### 2.5 User

```ts
interface User {
  id: string;
  name: string;
  realName: string;
  college: string;
  grade: string;
  direction: string;
  avatar: string;
  bio: string;
  contact: string;
  status: string;
  online: boolean;
  skills: string[];
  stats: {
    posts: number;
    projects: number;
    reputation: number;
  };
}
```

### 2.6 TeamProject

```ts
type TeamStatus = "RECRUITING" | "MATCHING" | "CLOSED";

interface TeamProject {
  id: string;
  title: string;
  summary: string;
  leaderId: string;
  leader: string;
  status: TeamStatus;
  currentCount: number;
  maxCount: number;
  missingRoles: string[];
  requiredSkills?: string[];
  currentSkills?: string[];
  missingSkills?: string[];
  tags: string[];
  stage: string;
}
```

### 2.7 Message

```ts
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  time: string;
}
```

## 3. 用户端接口清单

### 3.1 帖子列表

`GET /api/posts`

说明：
- 只返回 `moderationStatus === "approved"` 的公开帖子。
- 按创建时间倒序。

响应：

```json
{
  "ok": true,
  "items": ["Post[]"],
  "source": "database"
}
```

### 3.2 创建帖子

`POST /api/posts`

请求：

```json
{
  "authorId": "u_001",
  "title": "标题",
  "type": "TECH",
  "category": "校园",
  "board": "默认板块",
  "summary": "摘要",
  "content": "正文",
  "tags": ["Flutter", "后端"],
  "requiredSkills": ["UI", "后端"],
  "openSlots": 0,
  "status": "已发布",
  "images": ["/uploads/posts/xxx.webp"]
}
```

字段说明：
- `authorId` 可不传，默认 `u_001`。
- `type` 默认 `TECH`。
- `summary` 不传时取 `content` 前 140 字。
- `images` 是图片 URL 字符串数组，不是文件对象。

成功：

```json
{
  "ok": true,
  "item": "Post",
  "source": "database"
}
```

内容被阻断：

```json
{
  "ok": false,
  "error": "content_blocked",
  "item": "Post",
  "moderation": {},
  "source": "database"
}
```

### 3.3 帖子详情

`GET /api/posts/:id`

说明：
- 帖子不存在或未审核通过时返回 404。

响应：

```json
{
  "ok": true,
  "item": "Post",
  "source": "database"
}
```

### 3.4 修改帖子

`PATCH /api/posts/:id`

请求：

```json
{
  "title": "新标题",
  "summary": "新摘要",
  "content": "新正文",
  "tags": ["Flutter"],
  "requiredSkills": ["UI"],
  "status": "已发布"
}
```

说明：
- 所有字段都是可选字段。
- 当前 Web 用户端没有编辑帖子页面，但接口存在。移动端如做“我的帖子编辑”可使用。

### 3.5 删除帖子

`DELETE /api/posts/:id`

说明：
- 不是真物理删除，而是把 `moderationStatus` 改为 `deleted`。
- 当前 Web 用户端没有删除帖子入口，但接口存在。

响应：

```json
{
  "ok": true
}
```

### 3.6 评论列表

`GET /api/posts/:id/comments`

说明：
- 只返回审核通过评论。
- 按创建时间正序。

响应：

```json
{
  "ok": true,
  "items": ["Comment[]"],
  "source": "database"
}
```

### 3.7 创建评论/回复

`POST /api/posts/:id/comments`

请求：

```json
{
  "authorId": "u_001",
  "content": "评论内容",
  "replyTo": "被回复人的名称或标识"
}
```

字段说明：
- `authorId` 不传默认 `u_001`。
- `replyTo` 可选。

成功：

```json
{
  "ok": true,
  "item": "Comment",
  "source": "database"
}
```

内容被阻断：

```json
{
  "ok": false,
  "error": "content_blocked",
  "moderation": {}
}
```

### 3.8 用户列表

`GET /api/users`

响应：

```json
{
  "ok": true,
  "items": ["User[]"]
}
```

### 3.9 用户详情

`GET /api/users/:id`

响应：

```json
{
  "ok": true,
  "item": "User"
}
```

### 3.10 修改用户资料

`PATCH /api/users/:id`

请求：

```json
{
  "name": "昵称",
  "bio": "简介",
  "contact": "联系方式",
  "skills": ["Flutter", "后端"],
  "direction": "技术方向",
  "status": "normal"
}
```

说明：
- 所有字段都是可选字段。
- Web 编辑页只提交 `name`、`bio`、`contact`、`skills`。

响应：

```json
{
  "ok": true,
  "item": "User"
}
```

### 3.11 组队列表

`GET /api/teams`

响应：

```json
{
  "ok": true,
  "items": ["TeamProject[]"]
}
```

### 3.12 创建组队项目

`POST /api/teams`

请求：

```json
{
  "id": "t_001",
  "title": "项目标题",
  "summary": "项目简介",
  "leaderId": "u_001",
  "leader": "负责人名称",
  "status": "RECRUITING",
  "currentCount": 1,
  "maxCount": 5,
  "missingRoles": ["前端", "UI"],
  "requiredSkills": ["Flutter", "Node.js"],
  "currentSkills": ["产品"],
  "missingSkills": ["Flutter"],
  "tags": ["校园工具", "Flutter"],
  "stage": "原型阶段"
}
```

说明：
- `id` 不传会自动生成。
- `leaderId` 不传默认 `u_001`。
- `status` 不传默认 `RECRUITING`。
- `requiredSkills` 不传时，会用 `tags + missingRoles` 生成。
- `missingSkills` 不传时，会根据 `requiredSkills - currentSkills` 计算，计算不到则回退为 `missingRoles`。

### 3.13 发现页数据

`GET /api/discover?userId=u_001`

响应：

```json
{
  "ok": true,
  "source": "database",
  "officialFeed": [
    {
      "id": "id",
      "title": "标题",
      "body": "内容",
      "type": "学校官方内容或校园公告",
      "imageUrl": null,
      "source": "column"
    }
  ],
  "recommendations": {
    "strategy": "rule_based_skill_matching",
    "userId": "u_001",
    "teamMatches": [],
    "teammateMatches": [],
    "techPosts": []
  }
}
```

### 3.14 推荐数据

`GET /api/recommendations?userId=u_001`

响应：

```json
{
  "ok": true,
  "strategy": "rule_based_skill_matching",
  "userId": "u_001",
  "teamMatches": [
    {
      "team": "TeamProject",
      "score": 30,
      "matchedSkills": ["Flutter"],
      "missingSkills": ["Flutter", "UI"],
      "reason": "补位 Flutter"
    }
  ],
  "teammateMatches": [
    {
      "user": "User",
      "team": "TeamProject",
      "score": 40,
      "matches": [
        {
          "skill": "Flutter",
          "source": "missing"
        }
      ],
      "reason": "适合补 Flutter"
    }
  ],
  "techPosts": [
    {
      "post": "Post",
      "score": 20,
      "matchedTags": ["Flutter"],
      "reason": "与你的 Flutter 相关"
    }
  ]
}
```

### 3.15 消息列表

`GET /api/messages`

说明：
- 当前只返回审核通过的消息。
- 按创建时间正序。

响应：

```json
{
  "ok": true,
  "items": ["Message[]"]
}
```

### 3.16 发送消息

`POST /api/messages`

请求：

```json
{
  "conversationId": "c_001",
  "senderId": "u_001",
  "receiverId": "u_002",
  "content": "消息内容"
}
```

字段说明：
- `conversationId` 不传默认 `c_001`。
- `senderId` 不传默认 `u_001`。
- `receiverId` 可选。
- 私信内容允许联系方式，但仍会检测其他违规内容。

成功：

```json
{
  "ok": true,
  "item": "Message"
}
```

内容被阻断：

```json
{
  "ok": false,
  "error": "content_blocked",
  "item": "Message",
  "moderation": {}
}
```

### 3.17 用户系统消息

`GET /api/system-messages`

说明：
- 返回 `scope = all` 或 `targetUserId = u_001` 的系统消息。
- 当前接口固定查 `u_001`，未支持通过 token 或 query 指定用户。

响应：

```json
{
  "ok": true,
  "items": [
    {
      "id": "id",
      "scope": "user",
      "targetUserId": "u_001",
      "targetName": "用户",
      "title": "标题",
      "body": "内容",
      "messageType": "warning",
      "createdBy": "admin01",
      "createdAt": "2026-05-19T00:00:00.000Z"
    }
  ]
}
```

### 3.18 举报列表

`GET /api/reports`

说明：
- 接口存在，但用户端通常不需要展示举报列表。
- 移动端只需要提交举报。

### 3.19 提交举报

`POST /api/reports`

请求：

```json
{
  "reporterId": "u_001",
  "targetType": "post",
  "targetId": "p_001",
  "accusedName": "被举报人名称",
  "reason": "举报原因",
  "detail": "补充说明",
  "snapshot": "被举报内容快照"
}
```

`targetType` 可用值：
- `post`
- `comment`
- `message`
- `image`
- `user`

说明：
- `reporterId` 不传默认 `u_001`。
- `status` 后端固定创建为 `open`。

响应：

```json
{
  "ok": true,
  "item": {}
}
```

### 3.20 图片上传

`POST /api/uploads/images`

请求类型：
- `multipart/form-data`

字段：
- `files`: 图片文件，可多个。

限制：
- 最多处理前 4 张。
- 只接受：
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- 单张最大 5MB。
- Web 前端会先压缩成 webp，最大边 1600，质量 0.82。移动端可以本地压缩后再传。

响应：

```json
{
  "ok": true,
  "urls": [
    "/uploads/posts/xxx.webp"
  ]
}
```

上传后使用方式：
- 先调用图片上传接口拿到 `urls`。
- 发帖时把这些 URL 放到 `POST /api/posts` 的 `images` 数组里。

## 4. 当前不建议移动端依赖的接口

以下接口在 `src/services/api.ts` 写了 endpoint，但当前源码没有对应 API route：

- `GET /api/notifications`
- `GET /api/conversations`
- `POST /api/team/apply`

移动端如果需要完整消息体验，建议后端新增：
- `GET /api/conversations?userId=...`
- `POST /api/team/apply`
- `GET /api/notifications?userId=...`

## 5. 明确不移植的后台功能

移动端用户版不做以下功能：
- `/admin`
- `/admin/login`
- `/admin/moderation`
- `/admin/reports`
- `/admin/users`
- `/admin/rules`
- `/admin/logs`
- `/admin/columns`
- `/admin/announcements`
- `/admin/warnings`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/overview`
- `GET /api/admin/moderation`
- `POST /api/admin/moderation/actions`
- `GET /api/admin/reports`
- `POST /api/admin/reports/:id/action`
- `GET /api/admin/users`
- `GET /api/admin/rules`
- `POST /api/admin/rules`
- `PATCH /api/admin/rules/:id`
- `GET /api/admin/logs`
- `GET /api/admin/columns`
- `POST /api/admin/columns`
- `PATCH /api/admin/columns/:id`
- `GET /api/admin/announcements`
- `POST /api/admin/announcements`
- `PATCH /api/admin/announcements/:id`
- `GET /api/admin/system-messages`
- `POST /api/admin/system-messages`

## 6. 移动端建议的信息架构

建议底部 Tab：
- 首页：帖子流、搜索、分类、热门标签。
- 发现：官方内容、项目推荐、队友推荐、技术推荐。
- 发帖：新建帖子、图片上传。
- 消息：系统通知、私信。
- 我的：个人资料、我的帖子、我的组队、编辑资料。

组队广场可以放在：
- 首页顶部入口
- 发现页入口
- 或单独作为“组队”二级页面

## 7. 需要后端补齐或确认的点

当前 Web 可以运行，但移动端正式化还缺几类用户端接口：

- 真实登录/当前用户：当前默认 `u_001`，没有用户登录 API。
- 会话列表接口：当前会话列表来自 mock。
- 通知列表接口：当前通知来自 mock + 系统消息接口。
- 公告用户端列表接口：首页右侧公告当前没有独立用户端接口。
- 申请加入组队接口：`/api/team/apply` 被前端声明但没有实现。
- 评论删除接口：Web 只本地删除，没有后端删除评论接口。
- 我的帖子/我的组队接口：当前可用列表接口前端过滤，正式移动端建议后端支持 query。

