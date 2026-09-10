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

  it("shows a server-rejected error message (e.g. too-short or duplicate name)", () => {
    render(<CreateProjectForm onCreate={vi.fn()} serverError='Project name must be at least 3 characters.' />);

    expect(screen.getByRole("alert")).toHaveTextContent(/at least 3 characters/i);
  });

  it("shows a server-rejected duplicate-name error through the same alert", () => {
    render(
      <CreateProjectForm onCreate={vi.fn()} serverError='A project named "Marketing Site" already exists.' />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/already exists/i);
  });

  it("prefers the client-side blank-name check over a stale server error", async () => {
    const onCreate = vi.fn();
    render(
      <CreateProjectForm onCreate={onCreate} serverError="A project named &quot;X&quot; already exists." />,
    );

    await userEvent.click(screen.getByRole("button", { name: /create project/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/project name is required/i);
    expect(onCreate).not.toHaveBeenCalled();
  });
});
