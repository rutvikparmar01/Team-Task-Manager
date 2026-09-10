import type { Status } from "../types/api";

const STATUSES: Status[] = ["Todo", "In Progress", "Done"];

export function StatusControl({
  status,
  onChange,
}: {
  status: Status;
  onChange: (status: Status) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Task status</span>
      <select
        value={status}
        onChange={(e) => {
          const next = e.target.value as Status;
          if (next !== status) onChange(next);
        }}
        className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}
