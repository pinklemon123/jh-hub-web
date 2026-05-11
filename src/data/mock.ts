import type { Comment, Conversation, Message, NotificationItem, Post, TeamProject, User } from "@/types";

export const users: User[] = [
  {
    id: "system",
    name: "镜湖Hub助手",
    realName: "系统助手",
    college: "镜湖 Hub",
    grade: "系统",
    direction: "通知 / 公告",
    avatar: "湖",
    bio: "负责推送系统公告、组队进展、评论提醒和活动消息。",
    contact: "系统消息中心",
    status: "系统会话",
    online: true,
    skills: ["通知", "公告", "组队提醒"],
    stats: { posts: 0, projects: 0, reputation: 0 }
  },
  {
    id: "u_001",
    name: "镜湖大懒猫",
    realName: "林景复",
    college: "软件学院",
    grade: "2024",
    direction: "理学 / 软件",
    avatar: "林",
    bio: "关注 Flutter、Web 和 AI 应用，喜欢把校园里的真实需求做成能跑起来的小工具。",
    contact: "站内私信 / linjing@example.edu.cn",
    status: "正在找队友",
    online: true,
    skills: ["Flutter", "Next.js", "UI", "接口设计", "校园工具"],
    stats: { posts: 18, projects: 4, reputation: 126 }
  },
  {
    id: "u_002",
    name: "陈洲",
    realName: "陈洲",
    college: "数学科学学院",
    grade: "2023",
    direction: "数学建模 / 大数据",
    avatar: "陈",
    bio: "做过建模竞赛和数据分析，正在找展示端和交互设计搭子。",
    contact: "站内私信 / chenzhou@example.edu.cn",
    status: "可以联系",
    online: true,
    skills: ["数学建模", "Python", "数据分析", "可视化"],
    stats: { posts: 11, projects: 2, reputation: 98 }
  },
  {
    id: "u_003",
    name: "苏远",
    realName: "苏远",
    college: "文学院",
    grade: "2022",
    direction: "文案 / 表达",
    avatar: "苏",
    bio: "负责项目书、路演稿和答辩材料，把复杂方案讲清楚。",
    contact: "站内私信 / suyuan-write",
    status: "长期协作",
    online: false,
    skills: ["文案", "PPT", "路演", "资料整理"],
    stats: { posts: 9, projects: 3, reputation: 87 }
  },
  {
    id: "u_004",
    name: "何鹿",
    realName: "何鹿",
    college: "电子信息学院",
    grade: "2025",
    direction: "硬件 / IoT",
    avatar: "何",
    bio: "会做传感器原型和嵌入式调试，想找软件同学一起做校园设备。",
    contact: "站内私信 / helu-iot",
    status: "招募中",
    online: true,
    skills: ["IoT", "嵌入式", "Arduino", "后端"],
    stats: { posts: 6, projects: 2, reputation: 72 }
  }
];

export const posts: Post[] = [
  {
    id: "p_001",
    title: "AI 数学建模比赛需要 Flutter + UI 队友",
    type: "TEAM_UP",
    authorId: "u_002",
    author: "陈洲",
    authorAvatar: "陈",
    category: "理学",
    board: "数学与大数据",
    summary: "已有 Python 建模和数据分析同学，需要移动端展示、交互原型和答辩材料协作。",
    content:
      "我们已经完成了数据清洗和基础模型，下一步需要把建模过程、关键图表和最终预测结果做成一个能在答辩现场演示的版本。希望加入的同学能负责 Flutter 或 Web 展示端，也欢迎擅长 UI、PPT 和路演表达的同学一起把故事线整理清楚。",
    images: [
      {
        id: "img_001",
        url: "/uploads/posts/ai-model-preview.svg",
        alt: "AI 建模展示端图表预览",
        width: 960,
        height: 540
      }
    ],
    tags: ["组队", "数学建模", "Flutter", "可视化"],
    requiredSkills: ["Flutter", "UI"],
    openSlots: 2,
    status: "招募中",
    createdAt: "12 分钟前",
    comments: 8,
    heat: 128
  },
  {
    id: "p_002",
    title: "校园活动报名系统想找后端同学",
    type: "TEAM_UP",
    authorId: "u_001",
    author: "镜湖大懒猫",
    authorAvatar: "林",
    category: "理学",
    board: "软件",
    summary: "前端原型已完成，计划支持报名、审核、通知和导出，后端接口需要一起定。",
    content:
      "这个项目来自社团活动报名的真实需求。第一版会支持活动发布、报名收集、审核、站内通知和数据导出。前端原型已经有了，现在最需要的是后端同学一起把用户、活动、报名、审核、通知几个接口边界定下来，后面 Flutter 和 Web 会共用同一套 API。",
    images: [
      {
        id: "img_002",
        url: "/uploads/posts/event-form-preview.svg",
        alt: "校园活动报名系统界面预览",
        width: 960,
        height: 540
      }
    ],
    tags: ["组队", "后端", "数据库", "校园工具"],
    requiredSkills: ["后端", "数据库"],
    openSlots: 1,
    status: "可以联系",
    createdAt: "38 分钟前",
    comments: 5,
    heat: 96
  },
  {
    id: "p_003",
    title: "挑战杯项目书和路演 PPT 优化互助",
    type: "TEAM_UP",
    authorId: "u_003",
    author: "苏远",
    authorAvatar: "苏",
    category: "文科",
    board: "表达与写作",
    summary: "项目已有初稿，想找技术同学一起把 Demo 逻辑、商业价值和答辩故事线梳理清楚。",
    content:
      "挑战杯材料目前有项目书初稿和几页路演 PPT，但技术路线、应用场景和答辩叙事还不够顺。希望找能讲清技术 Demo 的同学一起打磨，也欢迎会视觉排版、路演表达和资料整理的同学加入。",
    images: [
      {
        id: "img_003",
        url: "/uploads/posts/roadshow-poster.svg",
        alt: "挑战杯路演材料海报预览",
        width: 960,
        height: 540
      }
    ],
    tags: ["竞赛", "PPT", "文案", "挑战杯"],
    requiredSkills: ["PPT", "路演"],
    openSlots: 3,
    status: "招募中",
    createdAt: "1 小时前",
    comments: 3,
    heat: 73
  },
  {
    id: "p_004",
    title: "聊聊校园社区的接口边界怎么拆",
    type: "TECH",
    authorId: "u_001",
    author: "镜湖大懒猫",
    authorAvatar: "林",
    category: "理学",
    board: "软件",
    summary: "帖子、组队、联系人和通知都要给 Flutter 与 Web 共用，接口最好从第一天就统一。",
    content:
      "如果后面 Flutter 和 Web 都要上线，接口从第一天就应该统一。帖子、评论、组队申请、联系人、通知、私信都只由后端维护数据和权限，前端只负责 UI、状态和请求。这样不会出现移动端一套逻辑、网页端一套逻辑，后面维护成本会低很多。",
    images: [],
    tags: ["技术贴", "API", "前后端分离", "架构"],
    requiredSkills: [],
    openSlots: 0,
    status: "讨论中",
    createdAt: "昨天",
    comments: 12,
    heat: 64
  }
];

export const comments: Comment[] = [
  {
    id: "cm_001",
    postId: "p_001",
    authorId: "u_001",
    author: "镜湖大懒猫",
    authorAvatar: "林",
    content: "我可以先看你们的数据字段和展示需求，Flutter 或 Next.js 展示端都能做。",
    time: "6 分钟前",
    mine: true
  },
  {
    id: "cm_002",
    postId: "p_001",
    authorId: "u_003",
    author: "苏远",
    authorAvatar: "苏",
    content: "如果答辩材料需要梳理，我也可以帮你们把模型流程压成更清楚的路演叙事。",
    time: "3 分钟前"
  },
  {
    id: "cm_003",
    postId: "p_002",
    authorId: "u_002",
    author: "陈洲",
    authorAvatar: "陈",
    content: "这个需求很适合做成公共工具，报名数据导出格式可以提前统一。",
    time: "20 分钟前"
  },
  {
    id: "cm_004",
    postId: "p_004",
    authorId: "u_004",
    author: "何鹿",
    authorAvatar: "何",
    content: "通知和私信建议都走消息中心，移动端和 Web 能少维护一套入口。",
    time: "昨天"
  }
];

export const teams: TeamProject[] = [
  {
    id: "t_001",
    title: "校园地图系统",
    summary: "把教学楼、社团空间和活动场地做成可搜索、可收藏、可投稿的轻地图。",
    leaderId: "u_001",
    leader: "镜湖大懒猫",
    status: "RECRUITING",
    currentCount: 3,
    maxCount: 5,
    missingRoles: ["后端", "UI"],
    tags: ["Next.js", "Flutter", "地图", "校园工具"],
    stage: "原型完成"
  },
  {
    id: "t_002",
    title: "AI 建模结果展示台",
    summary: "把建模过程、数据图表和预测结果做成答辩现场可交互展示页。",
    leaderId: "u_002",
    leader: "陈洲",
    status: "RECRUITING",
    currentCount: 2,
    maxCount: 4,
    missingRoles: ["前端", "视觉"],
    tags: ["数据可视化", "Python", "竞赛"],
    stage: "数据清洗中"
  },
  {
    id: "t_003",
    title: "社团活动报名助手",
    summary: "用统一模板管理活动、报名、审核、签到和通知，减少重复表格。",
    leaderId: "u_004",
    leader: "何鹿",
    status: "MATCHING",
    currentCount: 4,
    maxCount: 5,
    missingRoles: ["产品"],
    tags: ["活动", "通知", "低代码"],
    stage: "内测准备"
  }
];

export const notifications: NotificationItem[] = [
  {
    id: "n_001",
    title: "陈洲申请联系你",
    body: "他想加入你的校园活动报名系统，关注后端接口和数据库设计。",
    type: "联系申请",
    time: "刚刚",
    unread: true
  },
  {
    id: "n_002",
    title: "你的帖子收到 3 个推荐队友",
    body: "系统根据技能标签和项目需求匹配到了几位可联系同学。",
    type: "匹配推荐",
    time: "18 分钟前",
    unread: true
  },
  {
    id: "n_003",
    title: "挑战杯校内互助周开放",
    body: "文案、PPT、技术 Demo 和答辩方向都可以发布组队帖。",
    type: "校园公告",
    time: "昨天",
    unread: false
  }
];

export const conversations: Conversation[] = [
  {
    id: "c_001",
    target: users[2],
    project: "AI 数学建模展示端",
    lastMessage: "先看一下你们现在的数据和展示需求。",
    time: "19:24",
    unread: 2,
    kind: "direct"
  },
  {
    id: "c_002",
    target: users[3],
    project: "挑战杯路演材料",
    lastMessage: "我把技术路线压成三段叙事会更稳。",
    time: "昨天",
    unread: 0,
    kind: "direct"
  },
  {
    id: "c_system",
    target: users[0],
    project: "系统通知",
    lastMessage: "你的帖子收到 3 个推荐队友。",
    time: "刚刚",
    unread: 3,
    kind: "system"
  }
];

export const messages: Message[] = [
  { id: "m_001", conversationId: "c_001", senderId: "u_002", content: "你好，我看到你会 Flutter 和 UI，可以聊一下建模展示端吗？", time: "19:20" },
  { id: "m_002", conversationId: "c_001", senderId: "u_001", content: "可以。你们现在主要缺图表展示，还是完整 App？", time: "19:22" },
  { id: "m_003", conversationId: "c_001", senderId: "u_002", content: "先需要一个能展示模型结果和队伍介绍的版本，后面再接数据。", time: "19:24" },
  { id: "m_004", conversationId: "c_002", senderId: "u_003", content: "我把技术路线压成三段叙事会更稳。", time: "昨天" },
  { id: "m_005", conversationId: "c_system", senderId: "system", content: "你的帖子收到 3 个推荐队友，推荐依据是 Flutter、UI 和后端标签。", time: "刚刚" },
  { id: "m_006", conversationId: "c_system", senderId: "system", content: "挑战杯校内互助周开放，技术 Demo、PPT 和路演方向都可以发布组队帖。", time: "昨天" }
];

export const hotTags = ["Flutter", "Next.js", "数学建模", "AI", "后端", "PPT", "校园工具", "数据可视化"];
export const announcements = ["挑战杯校内互助周开放", "软件学院项目路演征集", "新生工具共创计划招募"];
