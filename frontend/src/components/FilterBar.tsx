import type { Priority, Status, TaskFilter } from "../types/api";

const STATUSES: Status[] = ["Todo", "In Progress", "Done"];
const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

export function FilterBar({
  filter,
  onChange,
}: {
  filter: TaskFilter;
  onChange: (filter: TaskFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <label className="text-sm">
        <span className="block text-slate-700">Status</span>
        <select
          value={filter.status ?? ""}
          onChange={(e) =>
            onChange({ ...filter, status: (e.target.value || undefined) as Status | undefined })
          }
          className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="block text-slate-700">Priority</span>
        <select
          value={filter.priority ?? ""}
          onChange={(e) =>
            onChange({
              ...filter,
              priority: (e.target.value || undefined) as Priority | undefined,
            })
          }
          className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="">All</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      {(filter.status || filter.priority) && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="rounded-md px-3 py-1 text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
