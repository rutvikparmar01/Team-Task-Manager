import type { Activity, TeamMember } from "../types/api";

function describeActivity(activity: Activity, teamMembers: TeamMember[]): string {
  switch (activity.category) {
    case "TaskCreated":
      return "Task created";
    case "StatusChanged":
      return `Status changed from ${activity.fromStatus} to ${activity.toStatus}`;
    case "PriorityChanged":
      return `Priority changed from ${activity.fromPriority} to ${activity.toPriority}`;
    case "AssigneeChanged": {
      if (!activity.assigneeId) return "Unassigned";
      const member = teamMembers.find((m) => m._id === activity.assigneeId);
      return `Assigned to ${member ? member.name : "a team member"}`;
    }
    default:
      return "Unknown activity";
  }
}

export function ActivityList({
  activities,
  teamMembers,
  isLoading,
  isError,
}: {
  activities: Activity[] | undefined;
  teamMembers: TeamMember[];
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading activity…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-red-600">
        Couldn't load activity history. Please try again.
      </p>
    );
  }

  if (!activities || activities.length === 0) {
    return <p className="text-sm text-slate-500">No activity yet.</p>;
  }

  return (
    <ul className="space-y-1">
      {activities.map((activity) => (
        <li key={activity._id} className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-slate-700">{describeActivity(activity, teamMembers)}</span>
          <span className="shrink-0 text-xs text-slate-400">
            {new Date(activity.createdAt).toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}
