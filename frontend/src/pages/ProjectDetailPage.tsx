import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProjectProgress } from "../api/projects";
import { useTeamMembers, useCreateTeamMember } from "../api/teamMembers";
import { useProjectTasks, useCreateTask, useUpdateTask } from "../api/tasks";
import { TaskCard } from "../components/TaskCard";
import { CreateTaskForm } from "../components/CreateTaskForm";
import { FilterBar } from "../components/FilterBar";
import { ProgressSummary } from "../components/ProgressSummary";
import type { TaskFilter } from "../types/api";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [filter, setFilter] = useState<TaskFilter>({});

  if (!projectId) return null;

  const { data: progress } = useProjectProgress(projectId);
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: tasks, isLoading } = useProjectTasks(projectId, filter);
  const createTask = useCreateTask(projectId);
  const createTeamMember = useCreateTeamMember();
  const updateTask = useUpdateTask(projectId);

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-slate-600 underline-offset-2 hover:underline">
        ← All projects
      </Link>

      <section>
        <h2 className="mb-2 text-base font-semibold text-slate-900">Progress</h2>
        {progress && <ProgressSummary progress={progress} />}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Tasks</h2>
        <FilterBar filter={filter} onChange={setFilter} />
        {isLoading && <p className="mt-3 text-sm text-slate-500">Loading tasks…</p>}
        {!isLoading && tasks && tasks.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">No tasks match the current filters.</p>
        )}
        <ul className="mt-3 space-y-2">
          {tasks?.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              teamMembers={teamMembers}
              onStatusChange={(status) => updateTask.mutate({ taskId: task._id, status })}
            />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Create a task</h2>
        <CreateTaskForm
          teamMembers={teamMembers}
          isSubmitting={createTask.isPending}
          onCreate={(input) => createTask.mutate(input)}
          onCreateTeamMember={(name) => createTeamMember.mutate({ name })}
        />
      </section>
    </div>
  );
}
