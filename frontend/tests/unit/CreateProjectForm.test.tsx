import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateProjectForm } from "../../src/components/CreateProjectForm";

describe("CreateProjectForm", () => {
  it("shows a validation message when submitted with a blank name", async () => {
    const onCreate = vi.fn();
    render(<CreateProjectForm onCreate={onCreate} />);

    await userEvent.click(screen.getByRole("button", { name: /create project/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/project name is required/i);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("calls onCreate with the trimmed name when valid", async () => {
    const onCreate = vi.fn();
    render(<CreateProjectForm onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText(/project name/i), "  Demo Project  ");
    await userEvent.click(screen.getByRole("button", { name: /create project/i }));

    expect(onCreate).toHaveBeenCalledWith({ name: "Demo Project", description: undefined });
  });
});
