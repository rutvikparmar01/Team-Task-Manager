import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateTaskForm } from "../../src/components/CreateTaskForm";

describe("CreateTaskForm", () => {
  it("shows a validation message when submitted with a blank title", async () => {
    const onCreate = vi.fn();
    render(
      <CreateTaskForm teamMembers={[]} onCreate={onCreate} onCreateTeamMember={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /create task/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/task title is required/i);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("defaults priority to Medium when not changed", async () => {
    const onCreate = vi.fn();
    render(
      <CreateTaskForm teamMembers={[]} onCreate={onCreate} onCreateTeamMember={vi.fn()} />,
    );

    await userEvent.type(screen.getByLabelText(/task title/i), "Write report");
    await userEvent.click(screen.getByRole("button", { name: /create task/i }));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Write report", priority: "Medium" }),
    );
  });

  it("shows guidance and lets the user add a team member when none exist", async () => {
    const onCreateTeamMember = vi.fn();
    render(
      <CreateTaskForm teamMembers={[]} onCreate={vi.fn()} onCreateTeamMember={onCreateTeamMember} />,
    );

    expect(screen.getByText(/no team members yet/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/add a team member/i), "Ada");
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onCreateTeamMember).toHaveBeenCalledWith("Ada");
  });
});
