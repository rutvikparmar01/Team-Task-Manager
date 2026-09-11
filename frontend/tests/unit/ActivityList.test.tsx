import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityList } from "../../src/components/ActivityList";
import type { Activity, TeamMember } from "../../src/types/api";

const teamMembers: TeamMember[] = [{ _id: "m1", name: "Ada", createdAt: "2026-01-01" }];

describe("ActivityList", () => {
  it("shows a loading state", () => {
    render(
      <ActivityList activities={undefined} teamMembers={[]} isLoading={true} isError={false} />,
    );
    expect(screen.getByText(/loading activity/i)).toBeInTheDocument();
  });

  it("shows an error state", () => {
    render(
      <ActivityList activities={undefined} teamMembers={[]} isLoading={false} isError={true} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't load activity/i);
  });

  it("shows an empty state when there are no activities", () => {
    render(<ActivityList activities={[]} teamMembers={[]} isLoading={false} isError={false} />);
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
  });

  it("renders plain-language descriptions for each activity category", () => {
    const activities: Activity[] = [
      { _id: "a1", taskId: "t1", category: "TaskCreated", createdAt: "2026-01-01T00:00:00Z" },
      {
        _id: "a2",
        taskId: "t1",
        category: "StatusChanged",
        fromStatus: "Todo",
        toStatus: "In Progress",
        createdAt: "2026-01-01T00:01:00Z",
      },
      {
        _id: "a3",
        taskId: "t1",
        category: "PriorityChanged",
        fromPriority: "Medium",
        toPriority: "High",
        createdAt: "2026-01-01T00:02:00Z",
      },
      {
        _id: "a4",
        taskId: "t1",
        category: "AssigneeChanged",
        assigneeId: "m1",
        createdAt: "2026-01-01T00:03:00Z",
      },
      {
        _id: "a5",
        taskId: "t1",
        category: "AssigneeChanged",
        assigneeId: null,
        createdAt: "2026-01-01T00:04:00Z",
      },
    ];

    render(
      <ActivityList
        activities={activities}
        teamMembers={teamMembers}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText("Task created")).toBeInTheDocument();
    expect(screen.getByText("Status changed from Todo to In Progress")).toBeInTheDocument();
    expect(screen.getByText("Priority changed from Medium to High")).toBeInTheDocument();
    expect(screen.getByText("Assigned to Ada")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });
});
