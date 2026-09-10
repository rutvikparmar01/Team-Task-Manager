import { Link } from "react-router-dom";
import type { Project } from "../types/api";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project._id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
    >
      <h3 className="font-medium text-slate-900">{project.name}</h3>
      {project.description && (
        <p className="mt-1 text-sm text-slate-500">{project.description}</p>
      )}
    </Link>
  );
}
