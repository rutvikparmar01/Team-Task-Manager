import type { ProjectProgress } from "../types/api";

export function ProgressSummary({ progress }: { progress: ProjectProgress }) {
  if (progress.totalTasks === 0) {
    return <p className="text-sm text-slate-500">No tasks yet.</p>;
  }

  const percent = Math.round((progress.progress ?? 0) * 100);
  return (
    <p className="text-sm text-slate-700">
      {progress.doneTasks} of {progress.totalTasks} tasks complete ({percent}%)
    </p>
  );
}
