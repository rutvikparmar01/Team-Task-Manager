import { useState, type FormEvent } from "react";
import type { Priority, TeamMember } from "../types/api";

const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

export function CreateTaskForm({
  teamMembers,
  onCreate,
  onCreateTeamMember,
  isSubmitting,
}: {
  teamMembers: TeamMember[];
  onCreate: (input: {
    title: string;
    description?: string;
    priority?: Priority;
    assigneeId?: string;
  }) => void;
  onCreateTeamMember: (name: string) => void;
  isSubmitting?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    setError(null);
    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assigneeId: assigneeId || undefined,
    });
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setAssigneeId("");
  }

  function handleAddTeamMember() {
    if (!newMemberName.trim()) return;
    onCreateTeamMember(newMemberName.trim());
    setNewMemberName("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <label htmlFor="task-title" className="block text-sm font-medium text-slate-700">
          Task title
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        />
        {error && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="task-description" className="block text-sm font-medium text-slate-700">
          Description (optional)
        </label>
        <input
          id="task-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        />
      </div>
      <div className="flex gap-3">
        <div>
          <label htmlFor="task-priority" className="block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="mt-1 rounded-md border border-slate-300 px-2 py-2 text-sm"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="task-assignee" className="block text-sm font-medium text-slate-700">
            Assignee
          </label>
          <select
            id="task-assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {teamMembers.length === 0 && (
        <p className="text-sm text-slate-500">
          No team members yet — add one below to assign this task.
        </p>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="new-team-member" className="block text-sm font-medium text-slate-700">
            Add a team member
          </label>
          <input
            id="new-team-member"
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleAddTeamMember}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        >
          Add
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:opacity-50"
      >
        Create task
      </button>
    </form>
  );
}
