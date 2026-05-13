import { announcements, comments, conversations, hotTags, messages, notifications, posts, teams, users } from "@/data/mock";
import { adminOverview, adminQueue, adminReports, adminUserRisks } from "@/data/admin";

const delay = async () => new Promise((resolve) => setTimeout(resolve, 120));

async function getJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return fallback;
    const data = (await response.json()) as { item?: T; items?: T; ok?: boolean };
    return (data.items ?? data.item ?? fallback) as T;
  } catch {
    await delay();
    return fallback;
  }
}

export const api = {
  async getPosts() {
    return getJson(endpoints.posts, posts);
  },
  async getPost(id: string) {
    return getJson(endpoints.post(id), posts.find((post) => post.id === id));
  },
  async getComments(postId: string) {
    return getJson(endpoints.comments(postId), comments.filter((comment) => comment.postId === postId));
  },
  async getUsers() {
    return getJson(endpoints.users, users);
  },
  async getUser(id: string) {
    return getJson(endpoints.user(id), users.find((user) => user.id === id) ?? users[1]);
  },
  async getTeams() {
    await delay();
    return teams;
  },
  async getNotifications() {
    await delay();
    return notifications;
  },
  async getConversations() {
    await delay();
    return conversations;
  },
  async getMessages() {
    await delay();
    return messages;
  },
  async getSidebar() {
    await delay();
    return { hotTags, announcements, users, teams };
  },
  async getAdminOverview() {
    await delay();
    return adminOverview;
  },
  async getAdminQueue() {
    await delay();
    return adminQueue;
  },
  async getAdminReports() {
    await delay();
    return adminReports;
  },
  async getAdminUserRisks() {
    await delay();
    return adminUserRisks;
  }
};

export const endpoints = {
  posts: "/api/posts",
  post: (id: string) => `/api/posts/${id}`,
  createPost: "/api/posts",
  comments: (postId: string) => `/api/posts/${postId}/comments`,
  users: "/api/users",
  user: (id: string) => `/api/users/${id}`,
  uploadImages: "/api/uploads/images",
  messages: "/api/messages",
  teamApply: "/api/team/apply",
  notifications: "/api/notifications",
  conversations: "/api/conversations",
  adminOverview: "/api/admin/overview",
  adminQueue: "/api/admin/moderation",
  adminReports: "/api/admin/reports",
  adminUsers: "/api/admin/users"
};
