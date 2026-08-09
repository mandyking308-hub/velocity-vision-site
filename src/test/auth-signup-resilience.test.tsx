import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

class ResizeObserverStub { observe() {} unobserve() {} disconnect() {} }
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver ?? ResizeObserverStub;

const navigate = vi.fn();
const signUp = vi.fn();
const signInWithPassword = vi.fn();
const recordLegalAcceptance = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
  useSearchParams: () => [new URLSearchParams()],
  Link: ({ to, children, ...rest }: any) => React.createElement("a", { href: to, ...rest }, children),
}));
vi.mock("react-helmet-async", () => ({ Helmet: () => null }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/lib/recordLegalAcceptance", () => ({
  recordLegalAcceptance: (...a: unknown[]) => recordLegalAcceptance(...a),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: (...a: unknown[]) => signUp(...a),
      signInWithPassword: (...a: unknown[]) => signInWithPassword(...a),
    },
    from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: [] }) }) }),
  },
}));

import AuthPage from "@/pages/AuthPage";
import { toast } from "sonner";

const fillAndSubmit = () => {
  fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));
  fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: "New" } });
  fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: "Customer" } });
  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "new@example.com" } });
  fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "Password!234" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: /create account/i }));
};

describe("AuthPage signup resilience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signUp.mockResolvedValue({ data: { user: { id: "u-new" }, session: null }, error: null });
  });

  it("blocks signup until the legal box is ticked", () => {
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));
    expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
    expect(signUp).not.toHaveBeenCalled();
  });

  it("records legal acceptance on successful signup", async () => {
    recordLegalAcceptance.mockResolvedValue(undefined);
    render(<AuthPage />);
    fillAndSubmit();
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(signUp).toHaveBeenCalledTimes(1);
    expect(recordLegalAcceptance).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u-new", source: "signup" }),
    );
  });

  it("signup UX survives a failed acceptance insert (no unhandled rejection, gate re-records later)", async () => {
    recordLegalAcceptance.mockRejectedValue(new Error("RLS denied"));
    render(<AuthPage />);
    fillAndSubmit();
    // Account creation must still be treated as success for the user.
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(signUp).toHaveBeenCalledTimes(1);
    // Button must return to an enabled state (no stuck "Loading...").
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /create account/i })).toBeEnabled(),
    );
  });
});
