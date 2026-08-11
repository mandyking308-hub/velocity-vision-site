import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

const fromMaybeSingle = vi.fn();

vi.mock("react-router-dom", () => ({
  Link: ({ to, children, ...rest }: any) => React.createElement("a", { href: to, ...rest }, children),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ maybeSingle: () => fromMaybeSingle() }),
    }),
  },
}));

import BufferReadinessCard from "@/components/app/BufferReadinessCard";

describe("BufferReadinessCard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a Connect Buffer action linking to settings when not connected", async () => {
    fromMaybeSingle.mockResolvedValue({ data: null });
    render(<BufferReadinessCard />);
    const link = await screen.findByRole("link", { name: /connect buffer/i });
    expect(link).toHaveAttribute("href", "/app/settings");
    expect(screen.getByText(/not connected/i)).toBeInTheDocument();
  });

  it("shows connected and ready wording without a connect action", async () => {
    fromMaybeSingle.mockResolvedValue({ data: { status: "connected" } });
    render(<BufferReadinessCard />);
    expect(await screen.findByText(/^connected$/i)).toBeInTheDocument();
    expect(screen.getByText(/you control publishing in buffer/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /connect buffer/i })).not.toBeInTheDocument();
  });

  it("surfaces reconnect_required with a reconnect action", async () => {
    fromMaybeSingle.mockResolvedValue({ data: { status: "reconnect_required" } });
    render(<BufferReadinessCard />);
    expect(await screen.findByRole("link", { name: /reconnect buffer/i })).toBeInTheDocument();
  });

  it("never implies automatic publishing", async () => {
    fromMaybeSingle.mockResolvedValue({ data: { status: "connected" } });
    render(<BufferReadinessCard />);
    await screen.findByText(/^connected$/i);
    expect(screen.queryByText(/automatically posts|auto-publish|publishes for you/i)).not.toBeInTheDocument();
  });
});
