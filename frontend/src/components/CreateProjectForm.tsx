import { useState, type FormEvent } from "react";

export function CreateProjectForm({
  onCreate,
  isSubmitting,
}: {
  onCreate: (input: { name: string; description?: string }) => void;
  isSubmitting?: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    setError(null);
    onCreate({ name: name.trim(), description: description.trim() || undefined });
    setName("");
    setDescription("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-slate-700">
          Project name
        </label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        />
        {error && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="project-description" className="block text-sm font-medium text-slate-700">
          Description (optional)
        </label>
        <input
          id="project-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:opacity-50"
      >
        Create project
      </button>
    </form>
  );
}
