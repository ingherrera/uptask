import api from "@/lib/axios";
import {
	dashboardProjectSchema,
	editProjectSchema,
	ProjectFormData,
	projectSchema,
	type Project,
} from "../types";
import { isAxiosError } from "axios";

type updateProjectProps = {
	formData: ProjectFormData;
	projectId: Project["id"];
};

export async function createProject(formData: ProjectFormData) {
	console.log({ formData });
	try {
		const { data } = await api.post("/projects", formData);
		console.log(data);
		return data;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error);
		}
	}
}

export async function getAllProjects() {
	try {
		const { data } = await api("/projects/");
		console.log("getAllProjects", data)
		const response = dashboardProjectSchema.safeParse(data);
		if (response.success) {
 			console.log("getAllProjects-response.data", response.data)
			return response.data;
		}
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error);
		}
	}
}

export async function getProjectById(id: Project["id"]) {
	try {
		const { data } = await api(`/projects/${id}`);
		const response = editProjectSchema.safeParse(data);
		if (response.success) {
			return response.data;
		}
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error);
		}
	}
}

export async function updateProject({ formData, projectId }: updateProjectProps) {
	console.log(formData, projectId);
	try {
		const { data } = await api.put<string>(`/projects/${projectId}`, formData);
		return data;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error);
		}
	}
}

export async function deleteProject(id: Project["id"]) {
	try {
		const { data } = await api.delete<string>(`/projects/${id}`);
		return data;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error);
		}
	}
}

export async function getProjectAndTasks(id: Project["id"]) {
	try {
		const { data } = await api(`/projects/${id}`);
		console.log("data - getProjectAndTasks..",{data})

		const response = projectSchema.safeParse(data);
		console.log("response - getProjectAndTasks..",{response})

		if (response.success) {
			return response.data;
		}
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error);
		}
	}
}
