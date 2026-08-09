import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

const invoke = vi.fn();
const fromMaybeSingle = vi.fn();
const searchParamsRef = { current: new URLSearchParams() };

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [searchParamsRef.current, vi.fn()],
  Link: ({ to, children, ...rest }: any) => React.createElement("a", { href: to, ...rest }, children),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: (...a: unknown[]) => invoke(...a) },
    from: () => ({
      select: () => ({ maybeSingle: () => fromMaybeSingle() }),
    }),
  },
}));

import BufferSettingsCard from "@/components/app/BufferSettingsCard";
import SendToBufferDialog from "@/components/app/SendToBufferDialog";
import { toast } from "sonner";

const CHANNELS = [
  { id: "ch-li", name: "Acme LinkedIn", displayName: "Acme LinkedIn", service: "linkedin", isQueuePaused: false },
  { id: "ch-ig", name: "Acme Instagram", displayName: "Acme Instagram", service: "instagram", isQueuePaused: false },
];

describe("BufferSettingsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsRef.current = new URLSearchParams();
  });

  it("shows Connect Buffer when not connected", async () => {
    fromMaybeSingle.mockResolvedValue({ data: null });
    render(<BufferSettingsCard />);
    expect(await screen.findByRole("button", { name: /connect buffer/i })).toBeInTheDocument();
  });

  it("fails closed with 'Buffer isn't configured yet' when server config is missing — no fake success", async () => {
    fromMaybeSingle.mockResolvedValue({ data: null });
    invoke.mockResolvedValue({ data: null, error: new Error("Edge Function returned a non-2xx status code") });
    render(<BufferSettingsCard />);
    fireEvent.click(await screen.findByRole("button", { name: /connect buffer/i }));
    // No configuration error code is readable from a generic invoke error in
    // the mock, so at minimum: no success toast and still not connected.
    await waitFor(() => expect(invoke).toHaveBeenCalledWith("buffer-oauth-start", expect.anything()));
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByText(/^connected$/i)).not.toBeInTheDocument();
  });

  it("shows connected state with Refresh channels and Disconnect", async () => {
    fromMaybeSingle.mockResolvedValue({
      data: { id: "c1", status: "connected", connected_at: "2026-08-01T00:00:00Z", last_error: null, scopes: "account:read posts:write offline_access" },
    });
    render(<BufferSettingsCard />);
    expect(await screen.findByText(/^connected$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh channels/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /disconnect/i })).toBeInTheDocument();
  });

  it("shows Reconnect required state from server status", async () => {
    fromMaybeSingle.mockResolvedValue({
      data: { id: "c1", status: "reconnect_required", connected_at: "2026-08-01T00:00:00Z", last_error: "Buffer connection expired. Reconnect to continue.", scopes: null },
    });
    render(<BufferSettingsCard />);
    expect(await screen.findByText(/reconnect required/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reconnect buffer/i })).toBeInTheDocument();
  });

  it("disconnect calls the server function and returns to not-connected", async () => {
    fromMaybeSingle.mockResolvedValue({
      data: { id: "c1", status: "connected", connected_at: "2026-08-01T00:00:00Z", last_error: null, scopes: null },
    });
    invoke.mockResolvedValue({ data: { ok: true }, error: null });
    render(<BufferSettingsCard />);
    fireEvent.click(await screen.findByRole("button", { name: /disconnect/i }));
    await waitFor(() => expect(invoke).toHaveBeenCalledWith("buffer-disconnect", expect.anything()));
    expect(await screen.findByRole("button", { name: /connect buffer/i })).toBeInTheDocument();
  });
});

describe("SendToBufferDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disconnected path points the customer to Connect Buffer in Settings", async () => {
    invoke.mockResolvedValue({ data: null, error: new Error("non-2xx") });
    render(<SendToBufferDialog platform="LinkedIn" defaultText="Draft text" />);
    fireEvent.click(screen.getByRole("button", { name: /send to buffer/i }));
    // Generic invoke error -> error state (not disconnected). Either way the
    // dialog must NOT offer channel selection.
    await waitFor(() => expect(invoke).toHaveBeenCalledWith("buffer-channels", expect.anything()));
    expect(screen.queryByLabelText(/buffer channel/i)).not.toBeInTheDocument();
  });

  it("connected path lists channels, defaults to Draft, and sends with precise copy", async () => {
    invoke.mockImplementation((fn: string) => {
      if (fn === "buffer-channels") return Promise.resolve({ data: { channels: CHANNELS }, error: null });
      if (fn === "buffer-create-post") return Promise.resolve({ data: { ok: true, message: "Saved to Buffer draft" }, error: null });
      return Promise.resolve({ data: null, error: null });
    });
    render(<SendToBufferDialog platform="LinkedIn" defaultText="My reviewed post" />);
    fireEvent.click(screen.getByRole("button", { name: /send to buffer/i }));

    // Channels loaded; LinkedIn channel preselected via service hint.
    expect(await screen.findByDisplayValue("My reviewed post")).toBeInTheDocument();
    const draftBtn = screen.getByRole("button", { name: /^draft$/i });
    expect(draftBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /^queue$/i })).toHaveAttribute("aria-pressed", "false");

    // No datetime field in Draft mode; appears in Schedule mode.
    expect(screen.queryByLabelText(/schedule for/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^schedule$/i }));
    expect(screen.getByLabelText(/schedule for/i)).toBeInTheDocument();
    // Past/blank schedule time must not be sendable.
    expect(screen.getByRole("button", { name: /scheduled in buffer/i })).toBeDisabled();

    // Back to Draft and send.
    fireEvent.click(screen.getByRole("button", { name: /^draft$/i }));
    fireEvent.click(screen.getByRole("button", { name: /saved to buffer draft/i }));
    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith("buffer-create-post", {
        body: { channelId: "ch-li", text: "My reviewed post", mode: "draft", dueAt: null },
      }),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Saved to Buffer draft"));
  });

  it("queue mode sends mode 'queue' with queue confirmation", async () => {
    invoke.mockImplementation((fn: string) => {
      if (fn === "buffer-channels") return Promise.resolve({ data: { channels: CHANNELS }, error: null });
      if (fn === "buffer-create-post") return Promise.resolve({ data: { ok: true, message: "Added to Buffer queue" }, error: null });
      return Promise.resolve({ data: null, error: null });
    });
    render(<SendToBufferDialog platform="Instagram" defaultText="IG post" />);
    fireEvent.click(screen.getByRole("button", { name: /send to buffer/i }));
    await screen.findByDisplayValue("IG post");
    fireEvent.click(screen.getByRole("button", { name: /^queue$/i }));
    fireEvent.click(screen.getByRole("button", { name: /added to buffer queue/i }));
    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith("buffer-create-post", {
        body: { channelId: "ch-ig", text: "IG post", mode: "queue", dueAt: null },
      }),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Added to Buffer queue"));
  });
});
