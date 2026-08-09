import type { CampaignBrief } from "@/lib/campaignPack";

/**
 * Sample brief used by the First-Campaign Copilot's "Use sample data" path.
 * It exists so a brand-new user can see a complete, realistic campaign before
 * they have uploaded anything. Campaigns built this way are flagged
 * `is_sample` and are hard-blocked from activation by the preflight engine.
 */
export const SAMPLE_BRIEF: CampaignBrief = {
  name: "Sample campaign — operations review offer",
  goal: "leads",
  kind: "lead_gen",
  offer:
    "A short operations review for small commercial teams that produces a written summary of where their outreach and follow-up process loses time.",
  audience:
    "Operations and commercial leads at US service businesses with 5–50 staff who run outreach manually across spreadsheets and inboxes.",
  industry: "Professional services",
  geography: "United States",
  pricePoint: "Fixed fee, quoted after the review",
  tone: "Direct, practical, no hype",
  cta: "Reply to arrange a short call",
  channels: ["Email"],
  deadline: "",
  notes:
    "Sample content for demonstration. Replace the offer, audience and call to action with your own before sending anything.",
  outputs: ["email", "landing", "offer"],
  language: "en",
};

export const SAMPLE_CONTACTS = [
  { first_name: "Priya", last_name: "Sample", email: "priya.sample@example.com", job_title: "Operations Director" },
  { first_name: "Tom", last_name: "Sample", email: "tom.sample@example.com", job_title: "Commercial Lead" },
  { first_name: "Ines", last_name: "Sample", email: "ines.sample@example.com", job_title: "Managing Partner" },
];
