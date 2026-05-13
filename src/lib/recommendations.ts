import type { Post, TeamProject, User } from "@/types";

export interface SkillMatch {
  skill: string;
  source: "missing" | "tag" | "required";
}

export interface TeammateRecommendation {
  user: User;
  team: TeamProject;
  score: number;
  matches: SkillMatch[];
  reason: string;
}

export interface TeamRecommendation {
  team: TeamProject;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  reason: string;
}

export interface TechPostRecommendation {
  post: Post;
  score: number;
  matchedTags: string[];
  reason: string;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function softMatch(left: string, right: string) {
  const a = normalize(left);
  const b = normalize(right);
  return Boolean(a && b && (a === b || a.includes(b) || b.includes(a)));
}

export function calculateMissingSkills(requiredSkills: string[] = [], currentSkills: string[] = []) {
  return unique(requiredSkills).filter((skill) => !currentSkills.some((current) => softMatch(skill, current)));
}

export function getTeamMissingSkills(team: TeamProject) {
  const explicitMissing = unique(team.missingSkills ?? []);
  if (explicitMissing.length > 0) return explicitMissing;
  const calculated = calculateMissingSkills(team.requiredSkills ?? [], team.currentSkills ?? []);
  if (calculated.length > 0) return calculated;
  return unique(team.missingRoles);
}

export function recommendTeamsForUser(user: User, teams: TeamProject[], limit = 4): TeamRecommendation[] {
  return teams
    .filter((team) => team.status !== "CLOSED")
    .map((team) => {
      const missingSkills = getTeamMissingSkills(team);
      const matchedSkills = user.skills.filter((skill) => missingSkills.some((missing) => softMatch(skill, missing)));
      const tagMatches = user.skills.filter((skill) => team.tags.some((tag) => softMatch(skill, tag)));
      const score = matchedSkills.length * 20 + tagMatches.length * 4 + (team.status === "RECRUITING" ? 6 : 2);
      return {
        team,
        score,
        matchedSkills: unique(matchedSkills),
        missingSkills,
        reason: matchedSkills.length > 0 ? `补位 ${unique(matchedSkills).join(" / ")}` : "技能方向相关"
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function recommendTeammatesForTeams(currentUser: User, users: User[], teams: TeamProject[], limit = 6): TeammateRecommendation[] {
  return teams
    .filter((team) => team.status !== "CLOSED")
    .flatMap((team) => {
      const missingSkills = getTeamMissingSkills(team);
      return users
        .filter((user) => user.id !== "system" && user.id !== currentUser.id && user.id !== team.leaderId)
        .map((user) => {
          const missingMatches = user.skills
            .filter((skill) => missingSkills.some((missing) => softMatch(skill, missing)))
            .map((skill) => ({ skill, source: "missing" as const }));
          const requiredMatches = user.skills
            .filter((skill) => (team.requiredSkills ?? []).some((required) => softMatch(skill, required)))
            .map((skill) => ({ skill, source: "required" as const }));
          const tagMatches = user.skills
            .filter((skill) => team.tags.some((tag) => softMatch(skill, tag)))
            .map((skill) => ({ skill, source: "tag" as const }));
          const matches = [...missingMatches, ...requiredMatches, ...tagMatches].filter(
            (match, index, array) => array.findIndex((item) => normalize(item.skill) === normalize(match.skill)) === index
          );
          const score = missingMatches.length * 25 + requiredMatches.length * 8 + tagMatches.length * 4 + (user.online ? 3 : 0);
          return {
            user,
            team,
            score,
            matches,
            reason: missingMatches.length > 0 ? `适合补 ${missingMatches.map((match) => match.skill).join(" / ")}` : "方向相关"
          };
        });
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function recommendTechPostsForUser(user: User, posts: Post[], limit = 4): TechPostRecommendation[] {
  return posts
    .filter((post) => post.type !== "TEAM_UP")
    .map((post) => {
      const signals = unique([...post.tags, ...post.requiredSkills]);
      const matchedTags = user.skills.filter((skill) => signals.some((signal) => softMatch(skill, signal)));
      const score = matchedTags.length * 12 + Math.min(10, Math.floor(post.heat / 20));
      return {
        post,
        score,
        matchedTags: unique(matchedTags),
        reason: matchedTags.length > 0 ? `与你的 ${unique(matchedTags).join(" / ")} 相关` : "近期热度较高"
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
