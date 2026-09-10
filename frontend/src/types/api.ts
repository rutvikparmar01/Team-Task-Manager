export type Priority = "Low" | "Medium" | "High";
export type Status = "Todo" | "In Progress" | "Done";

export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  assigneeId?: string | null;
  createdAt: string;
}

export interface ProjectProgress {
  totalTasks: number;
  doneTasks: number;
  progress: number | null;
}

export interface TaskFilter {
  status?: Status;
  priority?: Priority;
}
