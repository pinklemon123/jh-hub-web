export type AdminContentType = "post" | "comment" | "message" | "image";
export type ModerationLevel = "normal" | "suspicious" | "high" | "blocked";
export type ModerationDecision = "allow" | "review" | "block";
export type ContentModerationStatus = "pending" | "approved" | "rejected" | "blocked";
export type ReportStatus = "open" | "reviewing" | "resolved" | "ignored";
export type UserRiskStatus = "normal" | "muted" | "banned" | "watchlist";

export interface ModerationHit {
  label: string;
  category: string;
  weight: number;
  evidence: string;
}

export interface ModerationResult {
  decision: ModerationDecision;
  level: ModerationLevel;
  score: number;
  tags: string[];
  hits: ModerationHit[];
  message: string;
}

export interface AdminQueueItem {
  id: string;
  type: AdminContentType;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  target?: string;
  createdAt: string;
  reportCount: number;
  moderationStatus: ContentModerationStatus;
  reviewNote?: string;
  moderation: ModerationResult;
}

export interface AdminReport {
  id: string;
  targetType: AdminContentType | "user";
  targetId: string;
  reporter: string;
  accused: string;
  reason: string;
  snapshot: string;
  createdAt: string;
  status: ReportStatus;
  risk: ModerationLevel;
}

export interface AdminUserRisk {
  id: string;
  name: string;
  college: string;
  status: UserRiskStatus;
  riskScore: number;
  violationCount: number;
  reportCount: number;
  tags: string[];
  lastActive: string;
}

export interface AdminOverview {
  newUsersToday: number;
  postsToday: number;
  activeUsers: number;
  reportCount: number;
  riskyContent: number;
  pendingReview: number;
  blockedContent: number;
  mutedUsers: number;
}

export interface AdminRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export interface AdminAuditLog {
  id: string;
  admin: string;
  action: string;
  target: string;
  reason: string;
  createdAt: string;
}
