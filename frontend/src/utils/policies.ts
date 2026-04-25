import type { Project, TeamMember } from "../types";

export const isManager = (userId: TeamMember["id"], managerId: Project["manager"]): boolean => {
  return userId === managerId;
};