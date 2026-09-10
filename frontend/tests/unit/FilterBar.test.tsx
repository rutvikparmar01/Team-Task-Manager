import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "../../src/components/FilterBar";

describe("FilterBar", () => {
  it("calls onChange with both status and priority when both are set", async () => {
    const onChange = vi.fn();
    render(<FilterBar filter={{}} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByLabelText(/status/i), "Done");
    expect(onChange).toHaveBeenLastCalledWith({ status: "Done" });

    await userEvent.selectOptions(screen.getByLabelText(/priority/i), "High");
    expect(onChange).toHaveBeenLastCalledWith({ status: undefined, priority: "High" });
  });

  it("only shows a clear-filters action once a filter is active, and clears on click", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<FilterBar filter={{}} onChange={onChange} />);
    expect(screen.queryByRole("button", { name: /clear filters/i })).not.toBeInTheDocument();

    rerender(<FilterBar filter={{ status: "Done" }} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(onChange).toHaveBeenCalledWith({});
  });
});
