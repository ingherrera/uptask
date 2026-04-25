import api from "@/lib/axios";
import { isAxiosError } from "axios";
import { teamMembersSchema, type Project, type TeamMember, type TeamMemberForm } from "../types";


type findUserByEmailprops = {
  projectId: Project["id"];
  formData: TeamMemberForm;
};

type addUserToProjectProps = {
  id: TeamMember["id"];
  projectId: Project["id"];
};

type getProjectTeamProps = {
  projectId: Project["id"];
};

type removeUserFromProjectProps = {
  projectId: Project["id"];
  userId: TeamMember["id"];
};

export async function findUserByEmail({ projectId, formData }: findUserByEmailprops) {
  try {
    const url = `/projects/${projectId}/team/find`;
    const { data } = await api.post(url, formData);
    console.log(data);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}


export async function addUserToProject({ id, projectId }: addUserToProjectProps) {
  try {
    console.log(id, projectId);
    const url = `/projects/${projectId}/team`;
    const { data } = await api.post<string>(url, { id });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}

export async function getProjectTeam({projectId}:getProjectTeamProps) {
  try {
    const url = `/projects/${projectId}/team`;
    const { data } = await api(url);
    const response = teamMembersSchema.safeParse(data);
    console.log({ data })

    if (response.success) {
      return response.data;
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}


export async function removeUserFromProject({
  projectId,
  userId,
}: removeUserFromProjectProps) {
  try {
    const url = `/projects/${projectId}/team/${userId}`;
    const { data } = await api.delete<string>(url);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}