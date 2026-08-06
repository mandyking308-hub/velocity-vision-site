import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

vi.mock("@/contexts/CreditsContext", () => ({
  useCredits: () => ({ isFreePreview: true, loading: false }),
}));

import SetupWizard from "@/components/app/SetupWizard";
import CookieBanner from "@/components/CookieBanner";

const at = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <SetupWizard />
    </MemoryRouter>,
  );

describe("first-run overlays on the Copilot route", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-cookie-banner");
  });

  it("does not render the blocking guided-setup tour on the Copilot route", () => {
    at("/app/campaigns/copilot");
    expect(screen.queryByText(/guided setup/i)).not.toBeInTheDocument();
  });

  it("still shows the tour on the dashboard for an eligible first-run user", () => {
    at("/app");
    expect(screen.getByText(/guided setup/i)).toBeInTheDocument();
  });

  it("does not permanently dismiss the tour when suppressed", () => {
    at("/app/campaigns/copilot");
    expect(window.localStorage.getItem("vv_setup_wizard_dismissed_v1")).toBeNull();
  });

  it("keeps the cookie banner present with all consent choices", () => {
    render(<MemoryRouter><CookieBanner /></MemoryRouter>);
    expect(screen.getByRole("dialog", { name: /cookie preferences/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /accept all/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject non-essential/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /manage preferences/i })).toBeInTheDocument();
    expect(window.localStorage.getItem("vv_cookie_consent_v1")).toBeNull();
  });

  it("flags banner visibility so page content reserves safe bottom space", () => {
    render(<MemoryRouter><CookieBanner /></MemoryRouter>);
    expect(document.documentElement.getAttribute("data-cookie-banner")).toBe("visible");
  });
});
