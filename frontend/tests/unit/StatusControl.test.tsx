import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusControl } from "../../src/components/StatusControl";

describe("StatusControl", () => {
  it("does not call onChange when the same status is re-selected", async () => {
    const onChange = vi.fn();
    render(<StatusControl status="Todo" onChange={onChange} />);

    await userEvent.selectOptions(screen.getByRole("combobox"), "Todo");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("calls onChange with the newly selected status", async () => {
    const onChange = vi.fn();
    render(<StatusControl status="Todo" onChange={onChange} />);

    await userEvent.selectOptions(screen.getByRole("combobox"), "Done");

    expect(onChange).toHaveBeenCalledWith("Done");
  });
});
