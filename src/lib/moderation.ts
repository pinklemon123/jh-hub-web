import type { ModerationDecision, ModerationLevel, ModerationResult } from "@/types/admin";

interface ModerationOptions {
  allowContactInfo?: boolean;
}

const keywordRules: ReadonlyArray<{ words: string[]; category: string; weight: number; tag: string }> = [
  { words: ["约炮", "裸聊", "色情", "黄片"], category: "色情低俗", weight: 70, tag: "色情低俗" },
  { words: ["赌博", "博彩", "下注", "时时彩"], category: "赌博引流", weight: 70, tag: "赌博引流" },
  { words: ["毒品", "冰毒", "大麻", "摇头丸"], category: "毒品违法", weight: 90, tag: "违法内容" },
  { words: ["代考", "代写论文", "买论文", "代做作业"], category: "校园违规", weight: 60, tag: "校园违规" },
  { words: ["破解", "黑产", "出售账号", "盗号"], category: "黑灰产", weight: 55, tag: "黑灰产" },
  { words: ["加v", "加V", "微信", "VX", "vx", "扣扣", "QQ群", "qq群"], category: "联系方式", weight: 35, tag: "含联系方式" },
  { words: ["兼职刷单", "返利", "广告投放", "推广群"], category: "广告营销", weight: 45, tag: "广告营销" },
  {
    words: ["wocaonima", "wo cao ni ma", "nmsl", "操你妈", "草你妈", "你妈死了", "死妈", "傻逼", "煞笔", "人身攻击"],
    category: "辱骂骚扰",
    weight: 75,
    tag: "辱骂骚扰"
  }
];

const patternRules: ReadonlyArray<{ pattern: RegExp; category: string; weight: number; tag: string; label: string }> = [
  { pattern: /1[3-9]\d{9}/g, category: "联系方式", weight: 45, tag: "手机号", label: "手机号" },
  { pattern: /(?:\d[\s-]?){11,}/g, category: "联系方式", weight: 42, tag: "疑似拆分手机号", label: "拆分数字" },
  { pattern: /[1-9][0-9]{4,11}/g, category: "联系方式", weight: 28, tag: "QQ号", label: "QQ号" },
  { pattern: /\b[a-zA-Z][-_a-zA-Z0-9]{5,19}\b/g, category: "联系方式", weight: 18, tag: "疑似微信号", label: "疑似微信号" },
  { pattern: /(https?:\/\/|www\.|\.com|\.cn|\.top|\.xyz)/gi, category: "站外链接", weight: 35, tag: "站外链接", label: "链接" }
];

function normalizeText(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function levelFromScore(score: number): ModerationLevel {
  if (score >= 80) return "blocked";
  if (score >= 60) return "high";
  if (score >= 30) return "suspicious";
  return "normal";
}

function decisionFromScore(score: number): ModerationDecision {
  if (score >= 70) return "block";
  if (score >= 30) return "review";
  return "allow";
}

function shouldSkipRule(category: string, options: ModerationOptions) {
  return Boolean(options.allowContactInfo && (category === "联系方式" || category === "站外链接"));
}

export function moderateContent(input: string, options: ModerationOptions = {}): ModerationResult {
  const content = normalizeText(input);
  const hits: ModerationResult["hits"] = [];
  const tags = new Set<string>();

  for (const rule of keywordRules) {
    if (shouldSkipRule(rule.category, options)) continue;
    for (const word of rule.words) {
      if (content.includes(word)) {
        tags.add(rule.tag);
        hits.push({
          label: word,
          category: rule.category,
          weight: rule.weight,
          evidence: word
        });
      }
    }
  }

  for (const rule of patternRules) {
    if (shouldSkipRule(rule.category, options)) continue;
    const matches = content.match(rule.pattern);
    if (!matches) continue;
    tags.add(rule.tag);
    for (const match of matches.slice(0, 3)) {
      hits.push({
        label: rule.label,
        category: rule.category,
        weight: rule.weight,
        evidence: match
      });
    }
  }

  const repeatedMessageRisk = /(.)\1{8,}/.test(content) || /(.{4,})\1{2,}/.test(content);
  if (repeatedMessageRisk) {
    tags.add("重复刷屏");
    hits.push({
      label: "重复内容",
      category: "频率风控",
      weight: 20,
      evidence: "检测到连续重复字符或短句"
    });
  }

  const rawScore = hits.reduce((total, hit) => total + hit.weight, 0);
  const score = Math.min(100, rawScore);
  const decision = decisionFromScore(score);
  const level = levelFromScore(score);

  return {
    decision,
    level,
    score,
    tags: [...tags],
    hits,
    message:
      decision === "block"
        ? "内容包含高风险信息，已自动拦截。"
        : decision === "review"
          ? "内容存在风险，需要进入人工审核。"
          : "内容风险正常。"
  };
}
