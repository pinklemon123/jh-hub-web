export const colleges = [
  {
    key: "education",
    label: "教育学部",
    shortName: "教育学部",
    office: "教育学部综合办公室",
    phone: "23766001",
    aliases: ["教育"]
  },
  {
    key: "literature",
    label: "文学院",
    shortName: "文学院",
    office: "文学院办公楼203室",
    phone: "23766023",
    aliases: ["文学", "中文"]
  },
  {
    key: "foreign-languages",
    label: "外国语学院",
    shortName: "外国语",
    office: "外国语学院办公楼105室",
    phone: "23766032",
    aliases: ["外语", "英语"]
  },
  {
    key: "journalism",
    label: "新闻传播学院",
    shortName: "新闻传播",
    office: "新闻传播学院207室",
    phone: "23766041",
    aliases: ["新闻", "传播"]
  },
  {
    key: "history",
    label: "历史文化学院",
    shortName: "历史文化",
    office: "历史文化学院312室",
    phone: "23766052",
    aliases: ["历史"]
  },
  {
    key: "economics",
    label: "经济学院",
    shortName: "经济学院",
    office: "经济学院办公楼118室",
    phone: "23766108",
    aliases: ["经济"]
  },
  {
    key: "management",
    label: "管理学院",
    shortName: "管理学院",
    office: "管理学院办公楼216室",
    phone: "23766118",
    aliases: ["管理", "经管", "经济管理"]
  },
  {
    key: "computer",
    label: "计算机与信息工程学院",
    shortName: "计算机学院",
    office: "博理楼D区114室",
    phone: "23766295",
    aliases: ["计算机", "信息工程", "计信"]
  },
  {
    key: "software",
    label: "软件学院",
    shortName: "软件学院",
    office: "软件学院办公楼301室",
    phone: "23766306",
    aliases: ["软件"]
  },
  {
    key: "ai",
    label: "人工智能学院",
    shortName: "人工智能",
    office: "人工智能学院创新中心205室",
    phone: "23766318",
    aliases: ["人工智能", "AI"]
  },
  {
    key: "math",
    label: "数学科学学院",
    shortName: "数学学院",
    office: "数学科学学院办公楼110室",
    phone: "23766216",
    aliases: ["数学", "数学科学"]
  },
  {
    key: "electronics",
    label: "电子信息学院",
    shortName: "电子信息",
    office: "电子信息学院实验楼409室",
    phone: "23766262",
    aliases: ["电子", "电子信息"]
  }
] as const;

export type College = (typeof colleges)[number];
export type CollegeKey = College["key"];

export function getCollegeByKey(key: string | null) {
  return colleges.find((college) => college.key === key);
}

export function getCollegeKeyByName(name: string) {
  const normalized = name.trim().toLowerCase();
  return colleges.find((college) => {
    const names = [college.label, college.shortName, ...college.aliases].map((item) => item.toLowerCase());
    return names.some((item) => normalized.includes(item));
  })?.key;
}
