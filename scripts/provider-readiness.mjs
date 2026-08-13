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
  "/pricing",
  "/demo",
  "/legal",
  "/contact",
  "/services",
  "/industries",
  "/work",
  "/for-businesses",
  "/for-agencies",
  "/insights",
]) {
  assert(app.includes(`path=\"${route}\"`), `Missing public provider-review route: ${route}`);
}

const hero = read("src/components/HeroSection.tsx");
const homeFaqSource = read("src/components/HomeFAQ.tsx");
assert(
  homeFaqSource.includes("does not scrape contact data"),
  "Homepage must state that Velocity Vision does not scrape contact data",
);
assert(homeFaqSource.includes("sell lists"), "Homepage must state that Velocity Vision does not sell lists");
assert(
  hero.includes("You review and approve what gets used, sent or handed off."),
  "Homepage hero must retain customer-controlled activation wording",
);
assert(
  hero.includes("Illustrative interface only. These figures are not customer results or performance claims."),
  "Homepage figures must remain labelled as illustrative, non-result data",
);
assert(!hero.includes('label: "Reply rate"'), "Homepage must not present an unsourced reply-rate figure");
assert(!hero.includes('label: "Pipeline"'), "Homepage must not present an unsourced pipeline-value figure");

const problem = read("src/components/ProblemProof.tsx");
for (const claim of ['stat: "6+"', 'stat: "40%+"', 'stat: "70%"']) {
  assert(!problem.includes(claim), `Unsupported homepage statistic returned: ${claim}`);
}

const pricing = read("src/pages/Pricing.tsx");
const teaser = read("src/components/PricingTeaser.tsx");
const pricingSource = `${pricing}\n${teaser}`;
assert(
  pricingSource.includes("Outcome Funnel reporting from stored records"),
  "Growth plan must describe software-generated reporting, not a managed review service",
);
assert(
  !pricingSource.includes("Monthly performance review"),
  "Managed-service wording returned to pricing",
);
assert(!pricingSource.includes("Monthly review"), "Ambiguous managed-service wording returned to pricing teaser");
assert(
  !pricingSource.includes("automated checkout is being finalised"),
  "Temporary checkout placeholder returned to public pricing",
);
assert(
  pricing.includes("Does Velocity Vision scrape contacts or sell lists?"),
  "Pricing FAQ must retain the scraping/list-selling clarification",
);
assert(
  pricing.includes(
    "The final transaction currency, applicable tax, payment provider and terms are confirmed before payment.",
  ),
  "Pricing must explain how the payment provider and terms are disclosed",
);
assert(
  pricing.includes("Growth and Agency renew monthly until canceled"),
  "Pricing must state which plans renew monthly",
);
assert(
  pricing.includes("paid access is delivered electronically"),
  "Pricing must state the electronic delivery method",
);
assert(
  pricing.includes("Onboarding or setup help is optional and is never a prerequisite for checkout."),
  "Pricing must keep onboarding optional and never a checkout prerequisite",
);
assert(
  pricing.includes("https://globalsolutions.management/refunds"),
  "Pricing must link directly to the GSM Refund Policy",
);
assert(!pricing.includes("Most popular"), "Unsupported popularity label returned to pricing");
assert(
  !pricing.includes("Tiered daily caps protect deliverability"),
  "Pricing must not imply that plan limits guarantee deliverability",
);

const faq = read("src/components/HomeFAQ.tsx");
assert(
  faq.includes("Does Velocity Vision scrape contacts or sell lists?"),
  "Homepage FAQ must retain the scraping/list-selling clarification",
);

const contact = read("src/pages/Contact.tsx");
assert(
  contact.includes('toast.error("We could not send your message.'),
  "Contact form must show a real failure state",
);
assert(contact.includes("if (error) throw error"), "Contact form must inspect the backend invocation result");
assert(
  contact.includes("data?.notified !== true"),
  "Contact form must not report success unless notification delivery succeeded",
);
assert(contact.includes("scrollToContactForm"), "Contact page must provide working in-page contact navigation");
assert(contact.includes('to: "#contact-form"'), "Contact route cards must point to the public enquiry form");
assert(!contact.includes('to: "/app"'), "Public contact support must not send logged-out reviewers to the protected app");
assert(
  !contact.includes('to: "/app/billing"'),
  "Public billing support must not send logged-out reviewers to the protected app",
);
assert(contact.includes("/legal/privacy-policy"), "Contact form must link to the Privacy Policy");

const services = read("src/pages/Services.tsx");
for (const control of [
  "from one software workspace",
  "remain responsible for every review, approval and activation decision",
  "does not scrape contact data",
  "sell lists",
  "provide managed campaigns",
  "send automatically",
]) {
  assert(services.includes(control), `Services page is missing provider-safe wording: ${control}`);
}
for (const prohibitedClaim of [
  "Average 3.2x ROI",
  "2,400+ tier-1 media placements",
  "Average 240% engagement lift",
  "£180M+ in managed media spend",
  "200+ enterprise clients",
]) {
  assert(!services.includes(prohibitedClaim), `Unsupported services claim returned: ${prohibitedClaim}`);
}

const industries = read("src/pages/Industries.tsx");
assert(
  industries.includes("not managed services, customer case studies or performance claims"),
  "Industries page must state that examples are not services, case studies or performance claims",
);
for (const prohibitedClaim of [
  "340% increase",
  "12M impressions",
  "450+ media placements",
  "$8M pipeline",
  "18M organic reach",
  "180% sales lift",
]) {
  assert(!industries.includes(prohibitedClaim), `Unsupported industry claim returned: ${prohibitedClaim}`);
}

const work = read("src/pages/Work.tsx");
assert(
  work.includes("hypothetical product workflows"),
  "Work page must label examples as hypothetical product workflows",
);
for (const prohibitedClaim of [
  "qualified conversations",
  "Revenue-attributable activity",
  "Recovered revenue without compliance or deliverability risk",
]) {
  assert(!work.includes(prohibitedClaim), `Unsupported work-page outcome returned: ${prohibitedClaim}`);
}

const forBusinesses = read("src/pages/ForBusinesses.tsx");
for (const control of [
  "does not scrape contact data",
  "sell lists",
  "provide managed campaigns",
  "send automatically",
  "not a promise of replies, sales or revenue",
]) {
  assert(
    forBusinesses.includes(control),
    `Business page is missing customer-control wording: ${control}`,
  );
}
for (const prohibitedClaim of ["the next run runs itself", "Brief to live campaign in minutes"] ) {
  assert(!forBusinesses.includes(prohibitedClaim), `Unsupported business-page claim returned: ${prohibitedClaim}`);
}

const forAgencies = read("src/pages/ForAgencies.tsx");
for (const control of [
  "self-serve software, not agency delivery",
  "does not scrape contacts",
  "sell lists",
  "operate managed campaigns",
  "send automatically",
]) {
  assert(forAgencies.includes(control), `Agency page is missing provider-safe wording: ${control}`);
}
for (const prohibitedClaim of ["Brief to live campaign in minutes", "Ship more clients with the same team"] ) {
  assert(!forAgencies.includes(prohibitedClaim), `Unsupported agency-page claim returned: ${prohibitedClaim}`);
}

const insights = read("src/pages/Insights.tsx");
assert(
  insights.includes(
    "not legal advice, compliance approval, customer case studies or promises of deliverability, replies, sales, pipeline or revenue",
  ),
  "Insights page must retain its non-advice and no-results disclaimer",
);

const legalCentre = read("src/pages/legal/LegalCentre.tsx");
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

const legalDocs = read("src/pages/legal/LegalDocumentPage.tsx");
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
  "Velocity Vision provider-readiness audit passed: public routes, claims, pricing, billing, delivery, refunds, contact handling and legal safeguards are intact.",
);
