import { announcements, comments, conversations, hotTags, messages, notifications, posts, teams, users } from "@/data/mock";

const delay = async () => new Promise((resolve) => setTimeout(resolve, 120));

export const api = {
  async getPosts() {
    await delay();
    return posts;
  },
  async getPost(id: string) {
    await delay();
    return posts.find((post) => post.id === id);
  },
  async getComments(postId: string) {
    await delay();
    return comments.filter((comment) => comment.postId === postId);
  },
  async getUsers() {
    await delay();
    return users;
  },
  async getUser(id: string) {
    await delay();
    return users.find((user) => user.id === id) ?? users[1];
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
  }
};

export const endpoints = {
  posts: "/api/posts",
  createPost: "/api/posts",
  user: (id: string) => `/api/users/${id}`,
  teamApply: "/api/team/apply",
  notifications: "/api/notifications",
  conversations: "/api/conversations"
};
