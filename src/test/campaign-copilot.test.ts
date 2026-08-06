import { describe, it, expect } from "vitest";
import {
  EMPTY_COPILOT_INPUT, buildCampaignInsert, buildComplianceNote, buildCopilotPlan, buildEmailSteps,
  buildManualTasks, canCreateFromCopilot, clearCopilotDraft, loadCopilotDraft, readCopilotPlan,
  saveCopilotDraft, toCampaignBrief, validateCopilotInput, type CopilotInput,
} from "@/lib/copilotBrief";
import { mergeGeneratedPack } from "@/lib/campaignPack";
import { runPreflight, type PreflightInput } from "@/lib/campaignPreflight";
import { SAMPLE_BRIEF } from "@/lib/sampleCampaign";

const validInput = (over: Partial<CopilotInput> = {}): CopilotInput => ({
  ...EMPTY_COPILOT_INPUT,
  offer: "A short operations review that produces a written summary of process gaps.",
  audience: "Operations leads at UK service businesses with 5 to 50 staff.",
  channels: ["Email"],
  dataSourceConfirmed: true,
  ...over,
});

// In-memory storage stand-in so the tests never touch a real browser Storage.
const memoryStorage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    size: () => map.size,
  };
};

describe("copilot — required data-source confirmation", () => {
  it("blocks creation until the user confirms authorised business data", () => {
    const input = validInput({ dataSourceConfirmed: false });
    expect(canCreateFromCopilot(input)).toBe(false);
    expect(validateCopilotInput(input).map((i) => i.field)).toContain("dataSourceConfirmed");
  });

  it("allows creation once confirmed", () => {
    expect(canCreateFromCopilot(validInput())).toBe(true);
    expect(validateCopilotInput(validInput())).toHaveLength(0);
  });

  it("still requires a real offer and audience", () => {
    const fields = validateCopilotInput(validInput({ offer: "too short", audience: "" })).map((i) => i.field);
    expect(fields).toContain("offer");
    expect(fields).toContain("audience");
  });

  it("requires at least one channel", () => {
    expect(validateCopilotInput(validInput({ channels: [] })).map((i) => i.field)).toContain("channels");
  });

  it("records the confirmation in the compliance note", () => {
    const note = buildComplianceNote({ dataSourceConfirmed: true, constraints: "" }, "ai");
    expect(note).toMatch(/authorised business data/i);
    expect(buildComplianceNote({ dataSourceConfirmed: false, constraints: "" }, "ai")).toMatch(/not yet confirmed/i);
  });
});

describe("copilot — creation into the existing draft model", () => {
  const brief = toCampaignBrief(validInput({ name: "My campaign", channels: ["Email", "LinkedIn"] }));
  const pack = mergeGeneratedPack(brief, null);
  const plan = buildCopilotPlan({ input: validInput(), brief, pack, source: "ai" });

  it("projects the copilot answers onto the existing CampaignBrief shape", () => {
    expect(brief.name).toBe("My campaign");
    expect(brief.goal).toBe("leads");
    expect(brief.channels).toContain("Email");
    expect(brief.outputs).toContain("email");
  });

  it("writes a draft row on the existing campaigns table", () => {
    const row = buildCampaignInsert({ brief, pack, plan, userId: "u1", workspaceId: "w1", sample: false, slug: "s-1" });
    expect(row.status).toBe("draft");
    expect(row.is_sample).toBe(false);
    expect(row.owner_id).toBe("u1");
    expect(row.workspace_id).toBe("w1");
    expect(row.type).toBe("email");
    expect(row.cadence_type).toBe("one_off");
    // Never scheduled or activated by the copilot.
    expect(row).not.toHaveProperty("start_at");
    expect(row).not.toHaveProperty("next_run_at");
  });

  it("stores the plan inside the existing brief column, not a parallel table", () => {
    const row = buildCampaignInsert({ brief, pack, plan, userId: "u1", workspaceId: "w1", sample: false });
    expect(readCopilotPlan(row.brief)).not.toBeNull();
    expect(readCopilotPlan(row.brief)?.emailSteps).toHaveLength(3);
  });

  it("produces three email steps with suggested delays and safe variables", () => {
    expect(plan.emailSteps.map((s) => s.step)).toEqual([1, 2, 3]);
    expect(plan.emailSteps[0].delayDays).toBe(0);
    expect(plan.emailSteps[1].delayDays).toBeGreaterThan(0);
    expect(plan.emailSteps[2].delayDays).toBeGreaterThan(plan.emailSteps[1].delayDays);
    expect(plan.variables.every((v) => v.fallback.length > 0)).toBe(true);
  });

  it("turns non-email channels into manual tasks only", () => {
    const tasks = buildManualTasks(["Email", "LinkedIn", "PR"]);
    expect(tasks.map((t) => t.channel)).toEqual(["LinkedIn", "PR"]);
    expect(tasks.every((t) => /manual|yourself|your own/i.test(t.task))).toBe(true);
  });
});

describe("copilot — AI failure fallback", () => {
  const brief = toCampaignBrief(validInput());

  it("labels a fallback draft as a manual starter", () => {
    const pack = mergeGeneratedPack(brief, null);
    const plan = buildCopilotPlan({ input: validInput(), brief, pack, source: "manual_starter" });
    expect(plan.source).toBe("manual_starter");
  });

  it("still returns three usable steps when no pack emails exist", () => {
    const steps = buildEmailSteps({ emails: [] } as any, brief);
    expect(steps).toHaveLength(3);
    expect(steps.every((s) => s.subject.length > 0 && s.body.length > 0)).toBe(true);
    expect(steps.some((s) => s.subject.includes("[EDIT]"))).toBe(true);
  });

  it("keeps the user's chosen CTA in the starter body", () => {
    const steps = buildEmailSteps(null, brief);
    expect(steps[0].body).toContain(brief.cta);
  });

  it("preserves the brief in local storage so work is never lost", () => {
    const store = memoryStorage();
    const input = validInput({ proof: "Twelve reviews delivered." });
    saveCopilotDraft(input, store);
    const restored = loadCopilotDraft(store);
    expect(restored?.offer).toBe(input.offer);
    expect(restored?.proof).toBe("Twelve reviews delivered.");
    // Consent is deliberately not restored — the user re-confirms every time.
    expect(restored?.dataSourceConfirmed).toBe(false);
    clearCopilotDraft(store);
    expect(loadCopilotDraft(store)).toBeNull();
  });
});

describe("copilot — sample mode is non-operational", () => {
  const pack = mergeGeneratedPack(SAMPLE_BRIEF, null);
  const plan = buildCopilotPlan({ input: validInput(), brief: SAMPLE_BRIEF, pack, source: "sample" });
  const row = buildCampaignInsert({ brief: SAMPLE_BRIEF, pack, plan, userId: "u1", workspaceId: "w1", sample: true });

  it("flags the campaign as a sample draft", () => {
    expect(row.is_sample).toBe(true);
    expect(row.status).toBe("draft");
  });

  it("says plainly that it cannot be sent", () => {
    expect(plan.complianceNote).toMatch(/cannot be activated or sent/i);
  });

  it("is hard-blocked by preflight so it can never be activated", () => {
    const input: PreflightInput = {
      campaign: {
        id: "c1", name: SAMPLE_BRIEF.name, goal: "leads",
        brief: SAMPLE_BRIEF, pack, approved_at: new Date().toISOString(), is_sample: true,
      },
      safeContacts: 100, reviewContacts: 0, senderState: "ready_full", senderEmail: "me@example.com",
      remainingToday: 100, pauseReasons: [], creditsAvailable: 100, creditsRequired: 1,
      legalAccepted: true, unsubscribeReady: true,
    } as PreflightInput;
    const result = runPreflight(input);
    expect(result.canActivate).toBe(false);
    expect(result.blockers.some((b) => /sample/i.test(`${b.label} ${b.detail}`))).toBe(true);
  });
});
