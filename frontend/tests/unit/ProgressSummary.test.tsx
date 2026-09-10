import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressSummary } from "../../src/components/ProgressSummary";

describe("ProgressSummary", () => {
  it("shows a 'no tasks yet' state when there are zero tasks", () => {
    render(<ProgressSummary progress={{ totalTasks: 0, doneTasks: 0, progress: null }} />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it("shows the partial completion ratio", () => {
    render(<ProgressSummary progress={{ totalTasks: 4, doneTasks: 1, progress: 0.25 }} />);
    expect(screen.getByText(/1 of 4 tasks complete \(25%\)/i)).toBeInTheDocument();
  });

  it("shows full completion when every task is done", () => {
    render(<ProgressSummary progress={{ totalTasks: 2, doneTasks: 2, progress: 1 }} />);
    expect(screen.getByText(/2 of 2 tasks complete \(100%\)/i)).toBeInTheDocument();
  });
});
