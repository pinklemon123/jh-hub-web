export type PostType = "TECH" | "TEAM_UP" | "EVENT";
export type TeamStatus = "RECRUITING" | "MATCHING" | "CLOSED";

export interface PostImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface User {
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

export interface Post {
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

export interface Comment {
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

export interface TeamProject {
  id: string;
  title: string;
  summary: string;
  leaderId: string;
  leader: string;
  status: TeamStatus;
  currentCount: number;
  maxCount: number;
  missingRoles: string[];
  tags: string[];
  stage: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  time: string;
  unread: boolean;
}

export interface Conversation {
  id: string;
  target: User;
  project: string;
  lastMessage: string;
  time: string;
  unread: number;
  kind: "system" | "direct";
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  time: string;
}
