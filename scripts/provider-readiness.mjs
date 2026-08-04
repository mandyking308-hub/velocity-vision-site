import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const read = (path) => readFileSync(resolve(root, path), "utf8");
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const requiredFiles = [
  "src/App.tsx",
  "src/pages/Index.tsx",
  "src/components/HeroSection.tsx",
  "src/components/AudienceSplit.tsx",
  "src/components/HowItWorksPreview.tsx",
  "src/components/ProblemProof.tsx",
  "src/components/CampaignCapabilities.tsx",
  "src/components/WorkflowSavings.tsx",
  "src/components/PricingTeaser.tsx",
  "src/components/EmailIntegrationsStrip.tsx",
  "src/components/SecurityTrust.tsx",
  "src/components/GlobalStrip.tsx",
  "src/components/HomeFAQ.tsx",
  "src/components/FinalCTA.tsx",
  "src/pages/Features.tsx",
  "src/pages/HowItWorks.tsx",
  "src/pages/Templates.tsx",
  "src/pages/About.tsx",
  "src/pages/Pricing.tsx",
  "src/pages/Contact.tsx",
  "src/pages/Help.tsx",
  "src/pages/help/GettingStarted.tsx",
  "src/pages/DemoLogin.tsx",
  "src/pages/Services.tsx",
  "src/pages/Industries.tsx",
  "src/pages/Work.tsx",
  "src/pages/ForBusinesses.tsx",
  "src/pages/ForAgencies.tsx",
  "src/pages/Insights.tsx",
  "src/pages/legal/LegalCentre.tsx",
  "src/pages/legal/LegalDocumentPage.tsx",
];

for (const file of requiredFiles) {
  assert(existsSync(resolve(root, file)), `Missing required provider-review file: ${file}`);
}

const app = read("src/App.tsx");
for (const route of [
  "/",
  "/features",
  "/how-it-works",
  "/templates",
  "/about",
  "/pricing",
  "/contact",
  "/help",
  "/help/getting-started",
  "/demo",
  "/services",
  "/industries",
  "/work",
  "/for-businesses",
  "/for-agencies",
  "/insights",
  "/legal",
]) {
  assert(app.includes(`path=\"${route}\"`), `Missing public provider-review route: ${route}`);
}

const sourceByFile = Object.fromEntries(
  requiredFiles.map((file) => [file, read(file)]),
);
const publicSource = Object.values(sourceByFile).join("\n");

const forbiddenPhrases = [
  "Most popular",
  "Monthly review",
  "safe-to-activate",
  "safe-to-contact",
  "safe segment",
  "activate safely",
  "pipeline proved",
  "Real pipeline",
  "Zero busywork",
  "Average 3.2x ROI",
  "2,400+ tier-1 media placements",
  "Average 240% engagement lift",
  "£180M+ in managed media spend",
  "200+ enterprise clients",
  "340% increase",
  "12M impressions",
  "450+ media placements",
  "$8M pipeline",
  "18M organic reach",
  "180% sales lift",
  "qualified conversations",
  "Recovered revenue without compliance or deliverability risk",
  "the next run runs itself",
  "Brief to live campaign in minutes",
  "Ship more clients with the same team",
  "100+ language options",
  "WAF-style",
  "No Customer Data Model Training",
  "Stripe payment clears",
  "top-ups never expire",
  "Data storage, uploads, review, follow-up and pipeline are always free",
  "protects deliverability and your legal position",
  "safe send limits",
  "Estimated monthly savings",
  "Total estimated monthly savings",
  "tools * 0.6",
  "free * 0.5",
  "totalHours * 0.7",
  "automated checkout is being finalised",
];

for (const phrase of forbiddenPhrases) {
  assert(!publicSource.includes(phrase), `Forbidden or unsupported public phrase returned: ${phrase}`);
}

const index = sourceByFile["src/pages/Index.tsx"];
for (const control of [
  "Self-serve B2B software",
  "SoftwareApplication",
  "operated by Global Solutions Management LLC",
]) {
  assert(index.includes(control), `Homepage metadata is missing: ${control}`);
}

const hero = sourceByFile["src/components/HeroSection.tsx"];
for (const control of [
  "does not scrape contact data",
  "sell lists",
  "provide managed campaigns",
  "approve every activation decision",
  "Illustrative interface data only",
  "not customer results or performance claims",
]) {
  assert(hero.includes(control), `Homepage hero is missing provider-safe wording: ${control}`);
}
assert(!hero.includes('label: "Reply rate"'), "Homepage must not present a reply-rate figure");
assert(!hero.includes('label: "Pipeline"'), "Homepage must not present a pipeline-value figure");

const savings = sourceByFile["src/components/WorkflowSavings.tsx"];
for (const control of [
  "does not predict savings",
  "simple arithmetic only",
  "not a savings calculation",
  "does not guarantee cost savings",
]) {
  assert(savings.includes(control), `Workflow cost calculator is missing: ${control}`);
}

const capabilities = sourceByFile["src/components/CampaignCapabilities.tsx"];
for (const control of [
  "not legal or compliance approval",
  "explicit authorised-user decision",
  "does not scrape contacts",
  "does not guarantee legal compliance",
]) {
  assert(capabilities.includes(control), `Homepage capabilities are missing: ${control}`);
}

const preview = sourceByFile["src/components/HowItWorksPreview.tsx"];
for (const control of [
  "customer-authorised business data",
  "authorised-user decision",
  "not a guaranteed commercial outcome",
  "do not provide legal approval",
]) {
  assert(preview.includes(control), `Homepage workflow preview is missing: ${control}`);
}

const teaser = sourceByFile["src/components/PricingTeaser.tsx"];
for (const control of [
  "Starter is one-off with 30 days of access",
  "Growth and Agency Workspace renew monthly until cancelled",
  "no automatic paid upgrade",
  "Product use remains self-serve",
]) {
  assert(teaser.includes(control), `Homepage pricing block is missing: ${control}`);
}

const security = sourceByFile["src/components/SecurityTrust.tsx"];
assert(
  security.includes("No internet service can guarantee absolute security or compliance"),
  "Security section must retain its no-absolute-security statement",
);

const emailIntegrations = sourceByFile["src/components/EmailIntegrationsStrip.tsx"];
for (const control of [
  "does not guarantee deliverability",
  "Provider compatibility and connection availability may change",
  "authorised mailbox",
]) {
  assert(emailIntegrations.includes(control), `Mailbox section is missing: ${control}`);
}

const globalStrip = sourceByFile["src/components/GlobalStrip.tsx"];
for (const control of [
  "Automated translation where available",
  "final currency, tax treatment, payment provider and applicable terms are confirmed before purchase",
  "English legal documents control",
]) {
  assert(globalStrip.includes(control), `International-access section is missing: ${control}`);
}

const faq = sourceByFile["src/components/HomeFAQ.tsx"];
for (const control of [
  "Does Velocity Vision scrape contacts or sell lists?",
  "does not provide managed campaigns",
  "do not guarantee deliverability or legal compliance",
  "remains subject to the applicable plan",
]) {
  assert(faq.includes(control), `Homepage FAQ is missing: ${control}`);
}

const features = sourceByFile["src/pages/Features.tsx"];
for (const control of [
  "does not scrape contacts",
  "sell lists",
  "provide managed campaigns",
  "send automatically",
  "No guaranteed outcomes",
  "confirmed before payment",
]) {
  assert(features.includes(control), `Features page is missing: ${control}`);
}

const howItWorks = sourceByFile["src/pages/HowItWorks.tsx"];
for (const control of [
  "does not scrape contacts",
  "sell lists",
  "provide managed campaigns",
  "Software flags are not legal approval",
  "not a promised commercial result",
]) {
  assert(howItWorks.includes(control), `How It Works page is missing: ${control}`);
}

const templates = sourceByFile["src/pages/Templates.tsx"];
for (const control of [
  "not prospect databases",
  "not a prospect database",
  "Customers review and approve every record",
  "do not determine lawful basis",
]) {
  assert(templates.includes(control), `Templates page is missing: ${control}`);
}

const about = sourceByFile["src/pages/About.tsx"];
for (const control of [
  "operated by Global Solutions Management LLC",
  "does not scrape contacts",
  "does not provide managed campaigns",
  "No internet service can guarantee absolute security or compliance",
]) {
  assert(about.includes(control), `About page is missing: ${control}`);
}

const pricing = sourceByFile["src/pages/Pricing.tsx"];
for (const control of [
  "Does Velocity Vision scrape contacts or sell lists?",
  "Growth and Agency Workspace are monthly subscriptions that renew",
  "paid products are delivered electronically",
  "https://globalsolutions.management/refunds",
  "payment provider and applicable terms are confirmed before purchase",
]) {
  assert(pricing.includes(control), `Pricing page is missing: ${control}`);
}
assert(
  pricing.includes("Automated monthly performance summary"),
  "Growth must describe software-generated reporting rather than a managed review",
);
assert(
  !pricing.includes("Tiered daily caps protect deliverability"),
  "Pricing must not imply that plan limits guarantee deliverability",
);

const contact = sourceByFile["src/pages/Contact.tsx"];
for (const control of [
  'toast.error("We could not send your message.',
  "if (error) throw error",
  "data?.notified !== true",
  "scrollToContactForm",
  'to: "#contact-form"',
  "/legal/privacy-policy",
]) {
  assert(contact.includes(control), `Contact workflow is missing: ${control}`);
}
assert(!contact.includes('to: "/app"'), "Public support must not send reviewers to a protected route");
assert(!contact.includes('to: "/app/billing"'), "Public billing help must not send reviewers to a protected route");

const help = sourceByFile["src/pages/Help.tsx"];
for (const control of [
  "Software flags are not legal approval",
  "does not qualify leads",
  "Growth and Agency Workspace renew monthly until cancelled",
  "GSM Refund Policy",
]) {
  assert(help.includes(control), `Help Centre is missing: ${control}`);
}

const gettingStarted = sourceByFile["src/pages/help/GettingStarted.tsx"];
for (const control of [
  "Free Preview has no live sending",
  "no automatic paid upgrade",
  "payment provider and applicable terms are confirmed before purchase",
  "Additional credits are not activated until",
]) {
  assert(gettingStarted.includes(control), `Getting Started is missing: ${control}`);
}
assert(!gettingStarted.includes("Stripe"), "Getting Started must not name an unconfirmed payment provider");

const demo = sourceByFile["src/pages/DemoLogin.tsx"];
for (const control of [
  "read-only demonstration",
  "illustrative data",
  "does not send messages",
  "does not represent customer results",
]) {
  assert(demo.includes(control), `Demo entry is missing: ${control}`);
}

const services = sourceByFile["src/pages/Services.tsx"];
for (const control of [
  "One self-serve workspace for governed commercial activity",
  "does not scrape contact data",
  "sell lists",
  "provide managed campaigns",
  "send automatically",
]) {
  assert(services.includes(control), `Services page is missing: ${control}`);
}

const industries = sourceByFile["src/pages/Industries.tsx"];
assert(
  industries.includes("not managed services, customer case studies or performance claims"),
  "Industries page must label examples correctly",
);

const work = sourceByFile["src/pages/Work.tsx"];
assert(work.includes("hypothetical product workflows"), "Work page must label examples as hypothetical");

const forBusinesses = sourceByFile["src/pages/ForBusinesses.tsx"];
for (const control of [
  "does not scrape contact data",
  "sell lists",
  "provide managed campaigns",
  "send automatically",
  "not a promise of replies, sales or revenue",
]) {
  assert(forBusinesses.includes(control), `Business page is missing: ${control}`);
}

const forAgencies = sourceByFile["src/pages/ForAgencies.tsx"];
for (const control of [
  "self-serve software, not agency delivery",
  "does not scrape contacts",
  "sell lists",
  "operate managed campaigns",
  "send automatically",
]) {
  assert(forAgencies.includes(control), `Agency page is missing: ${control}`);
}

const insights = sourceByFile["src/pages/Insights.tsx"];
assert(
  insights.includes("not legal advice, compliance approval, customer case studies or promises of deliverability, replies, sales, pipeline or revenue"),
  "Insights page must retain its no-advice and no-results disclaimer",
);

const legalCentre = sourceByFile["src/pages/legal/LegalCentre.tsx"];
for (const documentPath of [
  "/legal/terms-of-service",
  "/legal/client-services-agreement",
  "https://globalsolutions.management/refunds",
  "/legal/data-processing-agreement",
  "/legal/privacy-policy",
  "/legal/acceptable-use-policy",
  "/legal/marketing-compliance-policy",
  "/legal/cookie-policy",
  "/legal/platform-security-policy",
  "/legal/service-level-agreement",
  "/legal/subprocessors",
]) {
  assert(legalCentre.includes(documentPath), `Legal Centre is missing ${documentPath}`);
}

const legalDocs = sourceByFile["src/pages/legal/LegalDocumentPage.tsx"];
for (const control of [
  "data collected by unlawful scraping",
  "purchased, rented or third-party lists that cannot lawfully be used",
  "self-serve software platform",
  "do not provide managed campaigns",
]) {
  assert(
    legalDocs.toLowerCase().includes(control.toLowerCase()),
    `Legal safeguards are missing: ${control}`,
  );
}

if (failures.length) {
  console.error("\nVelocity Vision provider-readiness audit failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Velocity Vision provider-readiness audit passed: all public review routes, claims, pricing, billing, delivery, refunds, contact handling, demonstration wording and legal safeguards are intact.",
);
