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
  "src/components/HeroSection.tsx",
  "src/components/ProblemProof.tsx",
  "src/components/PricingTeaser.tsx",
  "src/components/HomeFAQ.tsx",
  "src/pages/Pricing.tsx",
  "src/pages/Contact.tsx",
  "src/pages/legal/LegalCentre.tsx",
  "src/pages/legal/LegalDocumentPage.tsx",
];

for (const file of requiredFiles) {
  assert(existsSync(resolve(root, file)), `Missing required provider-review file: ${file}`);
}

const app = read("src/App.tsx");
for (const route of ["/", "/features", "/pricing", "/demo", "/legal", "/contact"]) {
  assert(app.includes(`path=\"${route}\"`), `Missing public provider-review route: ${route}`);
}

const hero = read("src/components/HeroSection.tsx");
assert(hero.includes("does not scrape contact data"), "Homepage must state that Velocity Vision does not scrape contact data");
assert(hero.includes("sell lists"), "Homepage must state that Velocity Vision does not sell lists");
assert(hero.includes("approve every activation"), "Homepage must retain customer-controlled activation wording");
assert(hero.includes("Illustrative interface data"), "Homepage figures must remain labelled as illustrative demo data");
assert(!hero.includes('label: "Reply rate"'), "Homepage must not present an unsourced reply-rate figure");
assert(!hero.includes('label: "Pipeline"'), "Homepage must not present an unsourced pipeline-value figure");

const problem = read("src/components/ProblemProof.tsx");
for (const claim of ['stat: "6+"', 'stat: "40%+"', 'stat: "70%"']) {
  assert(!problem.includes(claim), `Unsupported homepage statistic returned: ${claim}`);
}

const pricing = read("src/pages/Pricing.tsx");
const teaser = read("src/components/PricingTeaser.tsx");
const pricingSource = `${pricing}\n${teaser}`;
assert(pricingSource.includes("Automated monthly performance summary"), "Growth plan must describe software-generated reporting, not a managed review service");
assert(!pricingSource.includes("Monthly performance review"), "Managed-service wording returned to pricing");
assert(!pricingSource.includes("Monthly review"), "Ambiguous managed-service wording returned to pricing teaser");
assert(!pricingSource.includes("automated checkout is being finalised"), "Temporary checkout placeholder returned to public pricing");
assert(pricing.includes("Does Velocity Vision scrape contacts or sell lists?"), "Pricing FAQ must retain the data-source clarification");
assert(pricing.includes("payment provider are confirmed before purchase"), "Pricing must explain how the payment provider is disclosed");

const faq = read("src/components/HomeFAQ.tsx");
assert(faq.includes("Does Velocity Vision scrape contacts or sell lists?"), "Homepage FAQ must retain the scraping/list-selling clarification");

const contact = read("src/pages/Contact.tsx");
assert(contact.includes('toast.error("We could not send your message.'), "Contact form must show a real failure state");
assert(contact.includes("if (error) throw error"), "Contact form must inspect the backend invocation result");
assert(contact.includes("data?.notified !== true"), "Contact form must not report success unless notification delivery succeeded");
assert(contact.includes("scrollToContactForm"), "Contact page must provide working in-page contact navigation");
assert(contact.includes('to: "#contact-form"'), "Contact route cards must point to the public enquiry form");
assert(!contact.includes('to: "/app"'), "Public contact support must not send logged-out reviewers to the protected app");
assert(!contact.includes('to: "/app/billing"'), "Public billing support must not send logged-out reviewers to the protected app");
assert(contact.includes("/legal/privacy-policy"), "Contact form must link to the Privacy Policy");

const legalCentre = read("src/pages/legal/LegalCentre.tsx");
for (const documentPath of [
  "/legal/terms-of-service",
  "/legal/client-services-agreement",
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

const legalDocs = read("src/pages/legal/LegalDocumentPage.tsx");
for (const control of [
  "data collected by unlawful scraping",
  "purchased, rented or third-party lists that cannot lawfully be used",
  "self-serve software platform",
  "do not provide managed campaigns",
]) {
  assert(legalDocs.toLowerCase().includes(control.toLowerCase()), `Legal safeguards are missing: ${control}`);
}

if (failures.length) {
  console.error("\nVelocity Vision provider-readiness audit failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Velocity Vision provider-readiness audit passed: public routes, claims, demo labels, pricing, contact handling and legal safeguards are intact.");
