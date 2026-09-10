import type { Status, Task, TeamMember } from "../types/api";
import { PriorityBadge } from "./PriorityBadge";
import { StatusControl } from "./StatusControl";

export function TaskCard({
  task,
  teamMembers,
  onStatusChange,
}: {
  task: Task;
  teamMembers: TeamMember[];
  onStatusChange: (status: Status) => void;
}) {
  const assignee = teamMembers.find((m) => m._id === task.assigneeId);

  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium text-slate-900">{task.title}</p>
        {task.description && <p className="text-sm text-slate-500">{task.description}</p>}
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <PriorityBadge priority={task.priority} />
          <span>{assignee ? assignee.name : "Unassigned"}</span>
        </div>
      </div>
      <StatusControl status={task.status} onChange={onStatusChange} />
    </li>
  );
}
