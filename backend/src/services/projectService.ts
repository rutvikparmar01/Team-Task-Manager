import { ProjectModel } from "../models/Project";
import { TaskModel } from "../models/Task";
import { NotFoundError } from "../errors";
import type { CreateProjectInput } from "../validation/project";

export async function createProject(input: CreateProjectInput) {
  return ProjectModel.create(input);
}

export async function listProjects() {
  return ProjectModel.find().sort({ createdAt: 1 });
}

export async function getProjectOrThrow(projectId: string) {
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw new NotFoundError(`Project ${projectId} not found.`);
  }
  return project;
}

export async function getProjectProgress(projectId: string) {
  await getProjectOrThrow(projectId);

  const totalTasks = await TaskModel.countDocuments({ projectId });
  if (totalTasks === 0) {
    return { totalTasks: 0, doneTasks: 0, progress: null as number | null };
  }
  const doneTasks = await TaskModel.countDocuments({ projectId, status: "Done" });
  return { totalTasks, doneTasks, progress: doneTasks / totalTasks };
}
