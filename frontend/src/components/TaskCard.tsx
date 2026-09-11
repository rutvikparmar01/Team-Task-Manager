import { useState } from "react";
import type { Status, Task, TeamMember } from "../types/api";
import { PriorityBadge } from "./PriorityBadge";
import { StatusControl } from "./StatusControl";
import { ActivityList } from "./ActivityList";
import { useTaskActivities } from "../api/activities";

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
  const [isActivityExpanded, setIsActivityExpanded] = useState(false);
  const {
    data: activities,
    isLoading: isActivityLoading,
    isError: isActivityError,
  } = useTaskActivities(task._id, isActivityExpanded);

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-slate-900">{task.title}</p>
          {task.description && <p className="text-sm text-slate-500">{task.description}</p>}
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <PriorityBadge priority={task.priority} />
            <span>{assignee ? assignee.name : "Unassigned"}</span>
          </div>
        </div>
        <StatusControl status={task.status} onChange={onStatusChange} />
      </div>
      <button
        type="button"
        onClick={() => setIsActivityExpanded((expanded) => !expanded)}
        className="mt-3 text-xs font-medium text-slate-500 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
      >
        {isActivityExpanded ? "Hide activity" : "Show activity"}
      </button>
      {isActivityExpanded && (
        <div className="mt-2 border-t border-slate-100 pt-2">
          <ActivityList
            activities={activities}
            teamMembers={teamMembers}
            isLoading={isActivityLoading}
            isError={isActivityError}
          />
        </div>
      )}
    </li>
  );
}
