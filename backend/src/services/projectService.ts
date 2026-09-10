import { ProjectModel } from "../models/Project";
import { TaskModel } from "../models/Task";
import { NotFoundError, ValidationError } from "../errors";
import type { CreateProjectInput } from "../validation/project";

// Matches the Project model's unique index (specs/002-project-management/research.md item 2):
// case-insensitive, accent-insensitive comparison. Whitespace is already normalized by the
// Zod schema's .trim() before input reaches this service.
const NAME_COLLATION = { locale: "en", strength: 2 } as const;

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

export async function createProject(input: CreateProjectInput) {
  const existing = await ProjectModel.findOne({ name: input.name }).collation(NAME_COLLATION);
  if (existing) {
    throw new ValidationError(`A project named "${input.name}" already exists.`);
  }

  try {
    return await ProjectModel.create(input);
  } catch (err) {
    // Backstop for the race window between the pre-check above and this insert — the unique
    // index is the actual correctness guarantee under concurrent requests.
    if (isDuplicateKeyError(err)) {
      throw new ValidationError(`A project named "${input.name}" already exists.`);
    }
    throw err;
  }
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
