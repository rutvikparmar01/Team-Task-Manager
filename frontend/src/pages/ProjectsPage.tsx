import { useProjects, useCreateProject } from "../api/projects";
import { ProjectCard } from "../components/ProjectCard";
import { CreateProjectForm } from "../components/CreateProjectForm";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Projects</h2>
        {isLoading && <p className="text-sm text-slate-500">Loading projects…</p>}
        {!isLoading && projects && projects.length === 0 && (
          <p className="text-sm text-slate-500">No projects yet. Create one below.</p>
        )}
        <ul className="grid gap-3 sm:grid-cols-2">
          {projects?.map((project) => (
            <li key={project._id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Create a project</h2>
        <CreateProjectForm
          onCreate={(input) => createProject.mutate(input)}
          isSubmitting={createProject.isPending}
          serverError={createProject.error?.message}
        />
      </section>
    </div>
  );
}
