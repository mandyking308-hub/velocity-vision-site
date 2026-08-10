import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import type { Currency } from "@/lib/currency";
import { priceFor } from "@/lib/currency";

// Controlled active currency for UI tests (USD baseline).
const activeCurrency: Currency = "USD";
vi.mock("@/hooks/useCurrency", () => ({
  useCurrency: () => ({
    currency: activeCurrency,
    setCurrency: vi.fn(),
    country: "US",
    setCountry: vi.fn(),
  }),
}));

// framer-motion's whileInView needs IntersectionObserver in jsdom.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
  MockIntersectionObserver;

import WorkflowSavings from "@/components/WorkflowSavings";

const NEUTRAL_MESSAGE =
  "Enter your figures to compare your current monthly estimate with the published Growth price.";

const growth = priceFor("vv_growth_monthly", activeCurrency);

const renderCalculator = () =>
  render(
    <MemoryRouter>
      <WorkflowSavings />
    </MemoryRouter>,
  );

describe("WorkflowSavings blank/reset comparison state", () => {
  it("shows the neutral comparison message when every input is blank", () => {
    renderCalculator();
    expect(screen.getByText(NEUTRAL_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(/Illustrative cost difference:/)).not.toBeInTheDocument();
    // No confusing negative difference such as -$315 on a blank calculator.
    expect(screen.queryByText(/-\$/)).not.toBeInTheDocument();
    expect(screen.getByText("0.0h")).toBeInTheDocument();
  });

  it("shows the transparent difference as soon as any value is entered", () => {
    renderCalculator();
    fireEvent.change(screen.getByLabelText(/Current monthly software spend/), {
      target: { value: "1000" },
    });
    expect(screen.queryByText(NEUTRAL_MESSAGE)).not.toBeInTheDocument();
    // 1000 - 315 = 685
    const expected = 1000 - growth.amount;
    expect(
      screen.getByText((content) => content.includes("Illustrative cost difference:") && content.includes("$685")),
    ).toBeInTheDocument();
    expect(expected).toBe(685);
  });

  it("Load example produces the illustrative figures and difference", () => {
    renderCalculator();
    fireEvent.click(screen.getByRole("button", { name: /Load example/i }));
    // Example: 4 * (3 + 5) = 32h * $35 = $1,120 time + $300 tools + $1,000 contractors = $2,420
    expect(screen.getByText("$2,420")).toBeInTheDocument();
    // 2420 - 315 = 2105
    expect(
      screen.getByText((content) => content.includes("Illustrative cost difference:") && content.includes("$2,105")),
    ).toBeInTheDocument();
    expect(screen.queryByText(NEUTRAL_MESSAGE)).not.toBeInTheDocument();
  });

  it("Reset returns all fields to blank and restores the neutral message", () => {
    renderCalculator();
    fireEvent.click(screen.getByRole("button", { name: /Load example/i }));
    expect(screen.getByText("$2,420")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Reset$/i }));
    expect(screen.getByText(NEUTRAL_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(/Illustrative cost difference:/)).not.toBeInTheDocument();
    expect(screen.getByText("0.0h")).toBeInTheDocument();
    expect((screen.getByLabelText(/Campaign workflows per month/) as HTMLInputElement).value).toBe("");
  });

  it("clamps negatives to 0 and treats invalid input safely", () => {
    renderCalculator();
    fireEvent.change(screen.getByLabelText(/Current monthly software spend/), {
      target: { value: "-500" },
    });
    // Clamped to 0 — entered a value, so the signed difference shows (0 - 315).
    expect(screen.getByText("0.0h")).toBeInTheDocument();
    expect(screen.queryByText(/\$1,\d{3}|\$2,\d{3}/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Your chosen hourly cost/), {
      target: { value: "abc" },
    });
    // Invalid input is safe: no NaN anywhere.
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it("supports decimal hourly rates", () => {
    renderCalculator();
    fireEvent.change(screen.getByLabelText(/Campaign workflows per month/), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/preparing and reviewing data/), { target: { value: "1.5" } });
    fireEvent.change(screen.getByLabelText(/Your chosen hourly cost/), { target: { value: "35.5" } });
    // 2 * 1.5 = 3.0h; 3 * 35.5 = $106.50
    expect(screen.getByText("3.0h")).toBeInTheDocument();
    expect(screen.getAllByText("$106.50").length).toBeGreaterThan(0);
  });
});
