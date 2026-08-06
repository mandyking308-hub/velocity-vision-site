import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

const navigate = vi.fn();
const insertSingle = vi.fn();
const invoke = vi.fn();

vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "u1" } }) }));
vi.mock("@/contexts/WorkspaceContext", () => ({ useWorkspace: () => ({ currentId: "w1" }) }));
vi.mock("@/contexts/CreditsContext", () => ({ useCredits: () => ({ refresh: vi.fn() }) }));
vi.mock("@/contexts/DemoContext", () => ({ useDemo: () => ({ guardAction: () => true }) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: (...a: unknown[]) => invoke(...a) },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }),
      insert: () => ({ select: () => ({ single: () => insertSingle() }) }),
    }),
  },
}));

import AppCampaignCopilot from "@/pages/app/AppCampaignCopilot";
import { COPILOT_DRAFT_STORAGE_KEY } from "@/lib/copilotBrief";

const OFFER = "A short operations review that produces a written summary of process gaps.";
const AUDIENCE = "Operations leads at UK service businesses with 5 to 50 staff.";

const advanceToReview = () => {
  fireEvent.change(screen.getByLabelText(/what are you offering/i), { target: { value: OFFER } });
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
  fireEvent.change(screen.getByLabelText(/who are you contacting/i), { target: { value: AUDIENCE } });
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
};

describe("Copilot wizard UI", () => {
  beforeEach(() => {
    window.localStorage.clear();
    navigate.mockReset();
    insertSingle.mockReset().mockResolvedValue({ data: { id: "camp-1" }, error: null });
    invoke.mockReset().mockResolvedValue({ data: null, error: new Error("gateway down") });
  });

  it("shows a step indicator and both entry paths", () => {
    render(<AppCampaignCopilot />);
    expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /use sample data/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /build my first campaign/i })).toBeInTheDocument();
  });

  it("keeps the user moving back and forth without losing answers", () => {
    render(<AppCampaignCopilot />);
    const offer = screen.getByLabelText(/what are you offering/i);
    fireEvent.change(offer, { target: { value: OFFER } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByText(/step 2 of 5/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByLabelText(/what are you offering/i)).toHaveValue(OFFER);
  });

  it("blocks Continue until the offer is described", () => {
    render(<AppCampaignCopilot />);
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/what are you offering/i), { target: { value: OFFER } });
    expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled();
  });

  it("will not create a draft until the data-source confirmation is ticked", async () => {
    render(<AppCampaignCopilot />);
    advanceToReview();
    const createBtn = screen.getByRole("button", { name: /create my draft/i });
    expect(createBtn).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: /authorised to email/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /create my draft/i })).toBeEnabled());
  });

  it("falls back to a manual starter and still saves a draft when AI is unavailable", async () => {
    render(<AppCampaignCopilot />);
    advanceToReview();
    fireEvent.click(screen.getByRole("checkbox", { name: /authorised to email/i }));
    fireEvent.click(screen.getByRole("button", { name: /create my draft/i }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/app/campaigns/camp-1"));
    expect(invoke).toHaveBeenCalled();
  });

  it("persists the brief so a failed creation never loses the user's work", async () => {
    insertSingle.mockResolvedValue({ data: null, error: new Error("network") });
    render(<AppCampaignCopilot />);
    advanceToReview();
    fireEvent.click(screen.getByRole("checkbox", { name: /authorised to email/i }));
    fireEvent.click(screen.getByRole("button", { name: /create my draft/i }));
    await waitFor(() => expect(screen.getByText(/couldn't finish that/i)).toBeInTheDocument());
    expect(navigate).not.toHaveBeenCalled();
    expect(JSON.parse(window.localStorage.getItem(COPILOT_DRAFT_STORAGE_KEY)!).offer).toBe(OFFER);
  });

  it("creates a sample draft without calling the AI function", async () => {
    render(<AppCampaignCopilot />);
    fireEvent.click(screen.getByRole("button", { name: /use sample data/i }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/app/campaigns/camp-1"));
    expect(invoke).not.toHaveBeenCalled();
  });
});
