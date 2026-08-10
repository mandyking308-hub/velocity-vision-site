import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DemoSendToBuffer from "@/components/demo/DemoSendToBuffer";

describe("DemoSendToBuffer (public demo simulation)", () => {
  it("states own-account rule and never implies a shared Velocity Buffer account", () => {
    render(<DemoSendToBuffer />);
    expect(screen.getByText(/You sign in to your own Buffer account/i)).toBeInTheDocument();
    expect(screen.getByText(/Velocity never uses a shared Buffer account/i)).toBeInTheDocument();
    expect(screen.getByText(/never asks for your social-network passwords/i)).toBeInTheDocument();
  });

  it("defaults to Draft mode and offers simulated own channels", () => {
    render(<DemoSendToBuffer />);
    const draftBtn = screen.getByRole("button", { name: "Draft" });
    expect(draftBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText(/Your LinkedIn/i).length).toBeGreaterThan(0);
  });

  it("confirms with precise non-published wording for draft mode", () => {
    render(<DemoSendToBuffer />);
    fireEvent.click(screen.getByRole("button", { name: /Saved to Buffer draft/i }));
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Saved to Buffer draft (demo)");
    expect(status.textContent).not.toMatch(/Published to|Post published|Published successfully/i);
    expect(status.textContent).toContain("nothing is published automatically");
  });

  it("uses precise wording for queue and schedule modes", () => {
    render(<DemoSendToBuffer />);
    fireEvent.click(screen.getByRole("button", { name: "Queue" }));
    fireEvent.click(screen.getByRole("button", { name: /Added to Buffer queue/i }));
    expect(screen.getByRole("status").textContent).toContain("Added to Buffer queue (demo)");

    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
    expect(screen.getByLabelText(/Schedule for/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Scheduled in Buffer/i }));
    expect(screen.getByRole("status").textContent).toContain("Scheduled in Buffer (demo)");
  });

  it("makes clear the state is demo/example, not real connected data", () => {
    render(<DemoSendToBuffer />);
    expect(screen.getByText("Demo — example state")).toBeInTheDocument();
    expect(screen.getByText("Connected (example)")).toBeInTheDocument();
  });
});
