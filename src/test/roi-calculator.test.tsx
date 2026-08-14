import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import type { Currency } from "@/lib/currency";
import {
  ROI_PLANS,
  computeScenario,
  planCostFor,
  parseScenarioInput,
} from "@/lib/roiScenario";

// Controlled active currency for UI tests.
let activeCurrency: Currency = "GBP";
vi.mock("@/hooks/useCurrency", () => ({
  useCurrency: () => ({
    currency: activeCurrency,
    setCurrency: vi.fn(),
    country: "GB",
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

import ROICalculator from "@/components/ROICalculator";

const renderCalculator = () =>
  render(
    <MemoryRouter>
      <ROICalculator />
    </MemoryRouter>,
  );

describe("ROI scenario maths", () => {
  it("computes the documented sanity check: 40 leads × 20% × 15,000", () => {
    const r = computeScenario({
      monthlyLeads: 40,
      closeRatePct: 20,
      dealValue: 15000,
      planCost: 249,
    });
    expect(r.deals).toBe(8);
    expect(r.monthlyRevenue).toBe(120000);
    expect(r.annualRevenue).toBe(1440000);
    expect(r.netVsPlan).toBe(120000 - 249);
    expect(r.ratio).toBeCloseTo(120000 / 249, 5);
    expect(r.isNetPositive).toBe(true);
  });

  it("clamps close rate to 0–100 and values to non-negative", () => {
    const r = computeScenario({
      monthlyLeads: 40,
      closeRatePct: 250,
      dealValue: 100,
      planCost: 249,
    });
    expect(r.closeRatePct).toBe(100);
    expect(r.deals).toBe(40);

    const neg = computeScenario({
      monthlyLeads: -5,
      closeRatePct: -10,
      dealValue: -100,
      planCost: 249,
    });
    expect(neg.deals).toBe(0);
    expect(neg.monthlyRevenue).toBe(0);
  });

  it("never returns NaN or Infinity, even with null inputs or a zero-cost plan", () => {
    const r = computeScenario({
      monthlyLeads: null,
      closeRatePct: null,
      dealValue: null,
      planCost: 0,
    });
    for (const v of [r.deals, r.monthlyRevenue, r.annualRevenue, r.netVsPlan, r.ratio]) {
      expect(Number.isFinite(v)).toBe(true);
    }
    expect(r.ratio).toBe(0);
    expect(r.isNetPositive).toBe(false);
  });

  it("parses raw input safely: empty/invalid → null, negatives → 0", () => {
    expect(parseScenarioInput("")).toBeNull();
    expect(parseScenarioInput("   ")).toBeNull();
    expect(parseScenarioInput("abc")).toBeNull();
    expect(parseScenarioInput("-25")).toBe(0);
    expect(parseScenarioInput("12.5")).toBe(12.5);
  });

  it("uses live catalogue plan prices per currency — never a hard-coded 7,500", () => {
    expect(planCostFor("growth", "GBP")).toBe(249);
    expect(planCostFor("growth", "USD")).toBe(315);
    expect(planCostFor("starter", "GBP")).toBe(149);
    expect(planCostFor("agency", "EUR")).toBe(579);
    for (const plan of ROI_PLANS) {
      for (const ccy of ["GBP", "USD", "EUR", "CAD", "AUD", "MXN"] as const) {
        const cost = planCostFor(plan.id, ccy);
        expect(cost).toBeGreaterThan(0);
        expect(cost).not.toBe(7500);
      }
    }
  });
});

describe("ROI calculator UI", () => {
  beforeEach(() => {
    activeCurrency = "GBP";
  });

  it("defaults to Growth and renders the sanity-check scenario in the active currency", () => {
    renderCalculator();
    // Growth selected by default with its catalogue price
    const growthBtn = screen.getByRole("button", { name: /growth/i });
    expect(growthBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText(/£249\/mo/i).length).toBeGreaterThan(0);
    // 40 × 20% × £15,000 scenario
    expect(screen.getByText("8.0")).toBeInTheDocument();
    expect(screen.getByText("£120,000")).toBeInTheDocument();
    expect(screen.getByText("£1,440,000")).toBeInTheDocument();
  });

  it("switches to Starter and compares against the one-off 30-day price", () => {
    renderCalculator();
    fireEvent.click(screen.getByRole("button", { name: /starter/i }));
    expect(screen.getByText(/£149 one-off — the 30-day plan price/i)).toBeInTheDocument();
    expect(screen.getByText(/net vs one-off plan price/i)).toBeInTheDocument();
    // ratio now uses 149, not 249 or 7,500: 120,000 / 149 ≈ 805.4
    expect(screen.getByText("805.4×")).toBeInTheDocument();
  });

  it("localises plan prices to the visitor's active currency", () => {
    activeCurrency = "USD";
    renderCalculator();
    expect(screen.getAllByText(/\$315\/mo/i).length).toBeGreaterThan(0);
    expect(screen.getByText("$120,000")).toBeInTheDocument();
    expect(screen.queryByText(/£/)).toBeNull();
  });

  it("lets inputs be cleared without snapping to 0 and never renders NaN", () => {
    renderCalculator();
    const dealInput = screen.getByLabelText(/average deal value/i) as HTMLInputElement;
    fireEvent.change(dealInput, { target: { value: "" } });
    expect(dealInput.value).toBe(""); // stays empty, no snap
    expect(screen.getAllByText("£0").length).toBeGreaterThan(0); // maths treats empty as 0
    expect(screen.queryByText(/NaN|Infinity/)).toBeNull();
  });

  it("clamps close rate above 100 in the scenario maths", () => {
    renderCalculator();
    const rateInput = screen.getByLabelText(/close rate \(%\)/i);
    fireEvent.change(rateInput, { target: { value: "250" } });
    // 40 leads × 100% = 40.0 deals
    expect(screen.getByText("40.0")).toBeInTheDocument();
  });

  it("uses truthful self-serve labels — no retainer, discovery-call or $7,500 copy", () => {
    const { container } = renderCalculator();
    expect(screen.getByText(/scenario estimate/i)).toBeInTheDocument();
    expect(screen.getByText(/revenue-to-plan-cost ratio/i)).toBeInTheDocument();
    expect(screen.getByText(/estimate the economics using your own assumptions/i)).toBeInTheDocument();
    expect(screen.getByText(/illustrative only — not a guarantee of results/i)).toBeInTheDocument();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/retainer/i);
    expect(text).not.toMatch(/discovery call/i);
    expect(text).not.toContain("7,500");
    expect(text).not.toMatch(/projected impact|ROI multiple/i);
  });

  it("keeps both CTAs", () => {
    renderCalculator();
    expect(screen.getByRole("link", { name: /explore the platform/i })).toHaveAttribute("href", "/demo");
    expect(screen.getByRole("link", { name: /start your workspace/i })).toHaveAttribute("href", "/auth?mode=signup");
  });
});
