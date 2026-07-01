import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const PLATFORM = "Velocity Vision";
const ENTITY = "Global Solutions Management LLC, a company incorporated in the State of Delaware, United States, and operator of Velocity Vision";
const CONTACT_CTA = "Use the Contact page and select the route that matches your request.";

type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalDoc = {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  version: string;
  sections: LegalSection[];
};

const standardContact = (topic: string) => [
  `For ${topic}, ${CONTACT_CTA}`,
  `${ENTITY}.`,
];

const docs: Record<string, LegalDoc> = {
  "terms-of-service": {
    title: "Platform Terms of Service",
    effectiveDate: "30 June 2026",
    lastUpdated: "1 July 2026",
    version: "5.0",
    sections: [
      {
        heading: "1. Definitions",
        paragraphs: [
          "In these Terms:",
          "“Velocity Vision”, “Platform”, “Service”, “we”, “us” or “our” means the Velocity Vision platform operated by Global Solutions Management LLC.",
          "“Global Solutions Management LLC” means Global Solutions Management LLC, a company incorporated in the State of Delaware, United States.",
          "“Customer”, “you” or “your” means the person, company, agency, organisation, partnership, charity, trust, public body, fund, brand, client, estate, project or other legal entity that accesses, purchases, subscribes to, creates, joins, administers or uses Velocity Vision.",
          "“User” means any person who accesses or uses Velocity Vision through, under or in connection with a Customer account, workspace, invitation, login, role, permission, integration, client workspace or agency workspace.",
          "“Workspace” means any account area, dashboard, Data Vault, client workspace, agency workspace, project space, business workspace or other environment made available through Velocity Vision.",
          "“Customer Data” means any data, file, record, list, note, instruction, prompt, content, contact, company record, recipient data, uploaded material, imported material, generated material, exported material, client material, sender information, billing information or workspace content provided, uploaded, imported, entered, generated, activated or used by or for Customer through Velocity Vision.",
          "“Generated Outputs” means AI-assisted or system-generated drafts, templates, outreach copy, social posts, press releases, video scripts, follow-up messages, campaign briefs, summaries, data observations, quality checks, reports, prompts, pipeline notes, translations, multilingual variants, recommendations or other materials produced through Velocity Vision.",
          "“Activation” means any customer-controlled action that sends, exports, publishes, schedules, prepares, triggers, connects, applies, downloads, moves, uses or otherwise operationalises Customer Data or Generated Outputs.",
          "“Protected Parties” means Global Solutions Management LLC and its present and former owners, members, managers, directors, officers, employees, contractors, consultants, agents, representatives, affiliates, licensors, suppliers, service providers, subprocessors, payment providers, infrastructure providers, AI providers, hosting providers, professional advisers, successors and assigns.",
        ],
      },
      {
        heading: "2. Business Use Only",
        paragraphs: [
          "Velocity Vision is provided for lawful business, professional, commercial, agency, organisational and entrepreneurial use only. It is not intended for personal, household or consumer use.",
          "By accessing or using Velocity Vision, you confirm that you are acting in a business, professional, commercial, agency, organisational or entrepreneurial capacity and not as a consumer.",
          "If you use Velocity Vision on behalf of a company, agency, partnership, client, charity, trust, public body, fund, estate, project, brand or other organisation, you represent and warrant that you have authority to bind that organisation to these Terms.",
          "If you do not agree to these Terms, or if you do not have authority to accept them, you must not access or use Velocity Vision.",
        ],
      },
      {
        heading: "3. No Consumer Use",
        paragraphs: [
          "Velocity Vision is not designed for consumer contracting, household use, personal messaging, personal address books, private family records, consumer credit activity or individual domestic use.",
          "If you access Velocity Vision in a jurisdiction where mandatory consumer laws may apply despite this business-use restriction, nothing in these Terms excludes rights that cannot legally be excluded. However, we may suspend, restrict or terminate any account that we reasonably believe is being used as a consumer account, personal account or household account.",
        ],
      },
      {
        heading: "4. Contract Formation and Electronic Acceptance",
        paragraphs: [
          "You accept these Terms by creating an account, clicking to accept, subscribing, purchasing credits, accessing a workspace, joining an invited workspace, using the platform, uploading data, generating outputs, activating features, connecting integrations or otherwise using Velocity Vision.",
          "Electronic acceptance, checkbox acceptance, account creation, continued use, checkout completion, payment, workspace access and in-platform acceptance each form a binding agreement to the maximum extent permitted by law.",
          "Our platform records, billing records, authentication records, usage logs, IP logs, email records, acceptance timestamps, workspace records and audit logs may be used as evidence of acceptance, access, use, activity, billing, activation and compliance events.",
        ],
      },
      {
        heading: "5. Service Provider and Platform Scope",
        paragraphs: [
          "Velocity Vision is an AI-powered commercial workspace designed to help businesses organise contact data, review data readiness, prepare AI-assisted outreach assets, manage templates, support governed activation, plan cadence, organise replies, support follow-up and move warm contacts into pipeline.",
          "Velocity Vision is software. It is not a law firm, compliance adviser, tax adviser, accountant, financial adviser, investment adviser, medical adviser, insurance adviser, broker, marketing agency, email service provider of record, lead-generation agency, managed campaign provider, data broker, records archive, regulated advisory service or guaranteed revenue service.",
          "Velocity Vision does not guarantee replies, leads, meetings, sales, revenue, funding, deliverability, inbox placement, domain reputation, sender reputation, legal compliance, regulatory compliance, campaign performance, commercial outcomes, investment outcomes or suitability for any particular business, industry, country, recipient group or use case.",
        ],
      },
      {
        heading: "6. Agreement and Document Hierarchy",
        paragraphs: [
          "These Terms apply together with all policies, notices, plan terms, checkout terms, product rules and agreements incorporated by reference, including where applicable:",
          "If there is a conflict between these Terms and another incorporated document, the more specific document applies to the relevant subject matter.",
          "If there is a conflict between these Terms and a separately signed written agreement expressly accepted by Global Solutions Management LLC, the signed written agreement controls only for the conflicting commercial term. All platform conduct, data, security, AI, outreach, acceptable use, compliance, suspension, liability, indemnity, confidentiality, no personal liability and enforcement provisions continue to apply unless expressly overridden in that signed written agreement.",
          "Customer purchase orders, procurement terms, vendor portal terms, customer policies, email footers, onboarding notes, unsigned documents, unilateral terms, tender documents or other customer-side terms do not modify these Terms unless expressly accepted in writing by Global Solutions Management LLC.",
          "No employee, contractor, chatbot, support agent, reseller, adviser, customer, agency or third party has authority to vary these Terms unless the variation is in a written agreement expressly accepted by Global Solutions Management LLC.",
        ],
        bullets: [
          "the Customer Agreement;",
          "the Data Processing Agreement;",
          "the Privacy Policy;",
          "the Acceptable Use Policy;",
          "the Marketing Compliance Policy;",
          "the Cookie Policy;",
          "the Platform Security Policy;",
          "the Service Level Agreement;",
          "product-specific rules;",
          "usage notices;",
          "checkout notices;",
          "credit rules;",
          "plan descriptions;",
          "in-product warnings;",
          "workspace notices;",
          "onboarding notices.",
        ],
      },
      {
        heading: "7. Changes to These Terms",
        paragraphs: [
          "We may update these Terms and incorporated policies from time to time to reflect product changes, legal developments, security requirements, operational needs, billing changes, third-party service changes, AI provider changes, infrastructure changes, market changes or changes to our business.",
          "Material updates may be notified by posting, email, checkout notice, website notice or in-platform notice.",
          "Continued access to or use of Velocity Vision after the effective date of updated terms means you accept the updated terms.",
          "If you do not agree to updated terms, you must stop using Velocity Vision and cancel any paid subscription before the next renewal date.",
        ],
      },
      {
        heading: "8. Accounts, Users and Authority",
        paragraphs: [
          "You must provide accurate account, workspace, billing, tax, contact and organisation information and keep it up to date.",
          "You are responsible for all activity under your account, workspaces, users, permissions, invitations, payment methods, sender connections, integrations, credentials and client workspaces.",
          "This includes activity by employees, contractors, invited users, administrators, agencies, clients, consultants, representatives, outsourced providers, end clients and anyone using your login, device, access link, workspace, API connection, sender connection, payment method or integration.",
          "You must:",
          "We may treat all activity under your account, workspace, payment method, sender connection, integration or credentials as authorised by you unless and until you notify us of suspected compromise and we have had a reasonable opportunity to act.",
        ],
        bullets: [
          "keep login credentials secure;",
          "use strong passwords and appropriate authentication measures;",
          "manage internal permissions responsibly;",
          "promptly remove users who no longer require access;",
          "ensure every user complies with these Terms;",
          "maintain internal records of user authority;",
          "review account activity and workspace access;",
          "notify us promptly if you suspect unauthorised access, credential compromise, data misuse, payment abuse, security incident or platform misuse.",
        ],
      },
      {
        heading: "9. Account Ownership Disputes",
        paragraphs: [
          "If there is a dispute about account ownership, workspace control, administrator authority, payment authority, client ownership, user access or legal entitlement to data, we may freeze, restrict, suspend, preserve or disable the relevant account, workspace, export, billing access or user access until the dispute is resolved to our satisfaction.",
          "We are not required to decide internal disputes between shareholders, directors, partners, employees, agencies, clients, contractors or other parties. We may rely on billing records, administrator records, legal documents, court orders, company records, account history or other evidence we consider appropriate.",
          "We are not liable for loss arising from account freezes, access restrictions, export holds or administrative delays caused by ownership or authority disputes.",
        ],
      },
      {
        heading: "10. Minimum Age",
        paragraphs: [
          "You must be at least 18 years old, or the age of legal majority in your jurisdiction if higher, to create an account, administer a workspace, purchase a plan, upload data, manage campaigns, activate outputs or use Velocity Vision.",
          "You must not allow minors to access the platform, upload data, manage outreach, activate campaigns, access client records or use workspace features.",
        ],
      },
      {
        heading: "11. Platform Functionality",
        paragraphs: [
          "Velocity Vision may include tools for data upload, mapping, storage, deduplication, enrichment support, quality review, quality status assignment, segmentation, sender verification, activation checks, AI-assisted templates, outreach packs, social posts, press releases, video scripts, multilingual variants, cadence planning, reply organisation, follow-up states, pipeline tracking, billing, credit usage, exports, reports, dashboards and integrations.",
          "Features may be added, changed, suspended, limited, renamed, redesigned, replaced or removed at any time.",
          "We may modify safety controls, usage limits, activation gates, quality checks, pricing logic, billing rules, credit consumption, interface flows, sender controls, verification steps, product labels, integrations, workspace limits or technical requirements to protect Velocity Vision, customers, users, recipients, senders, infrastructure, third-party providers, payment systems, legal compliance, platform reputation or our business.",
          "No product description, roadmap, beta feature, public page, help article, onboarding note, support response, marketing statement or sales statement creates an obligation to maintain any feature unless expressly stated in a signed written agreement accepted by Global Solutions Management LLC.",
        ],
      },
      {
        heading: "12. Self-Serve Software",
        paragraphs: [
          "Velocity Vision is a self-serve software platform. Customer is responsible for configuring, reviewing, approving, activating and using the platform.",
          "Unless expressly agreed in a separate signed written agreement, we do not provide managed campaigns, legal review, compliance sign-off, professional advice, manual prospecting, customer-side approval, human campaign operation, outsourced marketing services, guaranteed lead generation, guaranteed deliverability or agency services.",
          "Any support, guidance, examples, templates, help content, onboarding notes, AI outputs or recommendations are provided for general product-use assistance only and do not transfer responsibility from Customer to Velocity Vision.",
        ],
      },
      {
        heading: "13. Customer Data Responsibility",
        paragraphs: [
          "You are responsible for all Customer Data.",
          "This includes all data, files, records, lists, contacts, prompts, instructions, notes, tags, uploads, imports, pasted content, exported content, generated content, campaign materials, sender details, client materials, relationship data, company records, recipient information, billing information and workspace content that you or your users place into, create through, process through, activate through or export from Velocity Vision.",
          "You represent and warrant that you have all rights, permissions, notices, consents, lawful bases, contractual rights, regulatory permissions and internal authorisations required to collect, store, upload, import, process, analyse, enrich, segment, use, retain, export, transfer and contact the data you place into Velocity Vision.",
          "You must not upload or process:",
          "You are responsible for maintaining records of source, permission, consent, legitimate interest assessment, privacy notice, suppression status, opt-out history, contact restrictions, lawful basis and compliance evidence where required by law.",
        ],
        bullets: [
          "unlawfully obtained data;",
          "data collected by unlawful scraping;",
          "data collected without a lawful basis;",
          "purchased, rented or third-party lists that cannot lawfully be used;",
          "data about minors;",
          "sensitive personal data unless expressly authorised and legally permitted;",
          "health data;",
          "biometric data;",
          "genetic data;",
          "criminal offence data;",
          "financial account data;",
          "government identifier data;",
          "special category data;",
          "data subject to professional secrecy or privilege unless you are authorised to process it;",
          "data subject to contractual restrictions that prevent SaaS processing;",
          "data subject to regulatory restrictions that prevent transfer, storage, outreach or platform use;",
          "data that you are not authorised to transfer, store, process, export, retain or use.",
        ],
      },
      {
        heading: "14. Compliance Evidence",
        paragraphs: [
          "We may require Customer to provide evidence of lawful basis, consent, source, suppression handling, sender authority, recipient permission, client authority, data ownership, opt-out processing, campaign approval, regulated-sector permission or other compliance evidence where we reasonably believe there is legal, regulatory, security, payment, abuse, deliverability, reputational or operational risk.",
          "Failure to provide satisfactory evidence may result in suspension, restriction, export hold, activation hold, sender hold, account review or termination.",
          "We are not responsible for reviewing, validating or approving Customer’s compliance evidence, and any request for evidence does not make us responsible for Customer’s compliance.",
        ],
      },
      {
        heading: "15. Data Vault and Storage",
        paragraphs: [
          "The Data Vault is a workspace tool for organising and using customer-provided business and contact data. It is not a compliance archive, legal record system, regulated records repository, certified backup system, litigation hold system, accounting record system, public filing system or guaranteed evidence store.",
          "You are responsible for keeping independent copies of important data, legal records, accounting records, compliance evidence, consent records, suppression lists, contracts, approvals, exports and business-critical files.",
          "We may apply storage limits, file-size limits, fair-use limits, retention rules, export limits, download limits, security restrictions, workspace limits, data-type restrictions and technical controls depending on your plan, usage, risk profile or platform requirements.",
          "We are not responsible for Customer’s failure to export, back up, secure, retain, evidence or preserve Customer Data.",
        ],
      },
      {
        heading: "16. Data Quality Review",
        paragraphs: [
          "Velocity Vision may include quality checks, readiness statuses, duplicate indicators, risky-record flags, missing-field prompts, segmentation suggestions, quality scores or AI-assisted observations.",
          "These are workflow aids only. They do not verify legal permission, consent, lawful basis, recipient status, accuracy, deliverability, commercial value, compliance, suitability or completeness of any data.",
          "Customer remains responsible for reviewing and validating all Customer Data before use, export, activation, outreach, publication or reliance.",
        ],
      },
      {
        heading: "17. Outreach, Activation and Sender Governance",
        paragraphs: [
          "Velocity Vision may provide sender verification, data quality flags, activation gates, cadence controls, risky-record checks, plan limits, sender rules, suppression prompts and governance controls. These tools are designed to support safer use, but they do not make your outreach lawful by themselves.",
          "You are solely responsible for deciding whether:",
          "Customer is solely responsible for all outreach activity, whether sent through Velocity Vision, exported from Velocity Vision, copied from Velocity Vision, adapted from Velocity Vision or prepared using Generated Outputs.",
          "We may block, throttle, pause, restrict, disable or review activation, exports, sender connections, campaigns, messages, workspaces or accounts where data, sender setup, recipient targeting, content, volume, complaints, bounce rates, spam signals, opt-out signals, payment risk, legal risk, technical risk or platform signals create concern.",
          "We are not responsible for sender reputation, domain reputation, blacklist status, inbox placement, bounce rates, spam classification, recipient complaints, opt-outs, platform enforcement, email provider action or third-party deliverability decisions.",
        ],
        bullets: [
          "each contact may lawfully be contacted;",
          "your lawful basis, consent, legitimate interest or other permission is valid;",
          "your message is lawful in the recipient’s jurisdiction;",
          "your sender identity is accurate and not misleading;",
          "your content is truthful, non-deceptive and substantiated;",
          "opt-out, unsubscribe, suppression and consent rules apply;",
          "your volume, frequency and targeting are appropriate;",
          "your outreach complies with applicable email, SMS, messaging, privacy, marketing, consumer protection, platform, industry and professional rules;",
          "your campaign complies with the rules of all relevant countries, states, provinces, regions and recipient locations.",
        ],
      },
      {
        heading: "18. Marketing Compliance",
        paragraphs: [
          "Customer is responsible for compliance with all laws, rules, regulations, platform terms and industry standards that apply to outreach, prospecting, lead generation, direct marketing, email, SMS, messaging, social outreach, telephone contact, retargeting, advertising, tracking and follow-up.",
          "This includes, where applicable, laws and rules relating to consent, legitimate interest, opt-outs, unsubscribe mechanisms, suppression lists, sender identity, subject lines, message content, physical address disclosure, recordkeeping, commercial claims, regulated sectors, vulnerable recipients, recipient location, cross-border outreach and agency-managed campaigns.",
          "Velocity Vision does not validate consent, approve lawful basis, certify recipient lists, guarantee compliance, provide legal clearance, monitor all messages, act as sender of record or assume responsibility for customer outreach.",
          "Customer must not use Velocity Vision to bypass, ignore, suppress, conceal or frustrate recipient rights, unsubscribe rights, opt-out requests, suppression obligations, platform rules or legal restrictions.",
        ],
      },
      {
        heading: "19. AI-Assisted Features, Templates and Generated Outputs",
        paragraphs: [
          "Velocity Vision includes AI-assisted tools that may help draft, structure, summarise, classify, translate, segment, organise, review, suggest or generate content and workflow actions.",
          "Generated Outputs may include outreach copy, email drafts, social posts, press releases, video scripts, follow-up messages, campaign briefs, multilingual variants, summaries, pipeline notes, data quality observations, prompts, reports, templates or other materials.",
          "All Generated Outputs are drafts. Customer must review, edit, approve and verify outputs before using, sending, publishing, exporting, relying on or activating them.",
          "Customer is responsible for ensuring that all Generated Outputs are:",
          "AI outputs may be incomplete, inaccurate, outdated, repetitive, biased, unsuitable, non-compliant, unsafe, offensive, misleading or similar to outputs generated for other users.",
          "We do not guarantee uniqueness, copyrightability, legal clearance, factual accuracy, commercial value, compliance, suitability, performance, deliverability or any outcome from Generated Outputs.",
          "Velocity Vision does not provide legal, tax, accounting, financial, medical, employment, investment, regulatory, insurance, professional or compliance advice. Do not rely on AI outputs as a substitute for qualified professional review.",
          "Customer must not use AI-assisted features to generate unlawful, deceptive, harmful, infringing, discriminatory, abusive, regulated, unsafe or misleading content.",
          "Subject to our Privacy Policy and Data Processing Agreement, we may use usage data, telemetry, error data, aggregated data, de-identified data and safety signals to improve product quality, reliability, abuse prevention, security and platform performance.",
        ],
        bullets: [
          "accurate;",
          "lawful;",
          "non-deceptive;",
          "non-infringing;",
          "appropriate for the recipient;",
          "appropriate for the jurisdiction;",
          "appropriate for the channel;",
          "appropriate for the industry;",
          "consistent with Customer’s brand, policies and approvals;",
          "compliant with all applicable laws, regulations, professional duties and platform rules.",
        ],
      },
      {
        heading: "20. AI Governance and Customer Control",
        paragraphs: [
          "Velocity Vision is designed around AI-powered assistance and customer-controlled activation.",
          "Customer remains in control before sending, exporting, publishing, activating or relying on Generated Outputs.",
          "Customer is responsible for:",
          "Customer must not represent that Velocity Vision has approved, reviewed, verified, legally cleared, compliance-checked or guaranteed any Generated Output, campaign, recipient list, data source, template, claim, message, deliverability result or commercial outcome.",
        ],
        bullets: [
          "prompt instructions;",
          "source data;",
          "review of outputs;",
          "approvals;",
          "edits;",
          "recipient selection;",
          "claims and substantiation;",
          "legal and regulatory review;",
          "tone and brand fit;",
          "sender identity;",
          "activation decisions;",
          "final use.",
        ],
      },
      {
        heading: "21. AI Legal Role Allocation",
        paragraphs: [
          "Customer is responsible for determining whether its use of Velocity Vision makes Customer a deployer, user, provider, distributor, importer, operator, controller, business, employer, regulated entity or other legal role under applicable AI, privacy, marketing, consumer protection, professional or sector-specific laws.",
          "Velocity Vision provides AI-assisted software tools and workflow support. Unless expressly agreed in writing, Global Solutions Management LLC does not assume Customer’s legal role, regulated status, professional obligations, deployment obligations, customer-facing obligations, human oversight obligations, impact assessment obligations, transparency obligations or recordkeeping obligations.",
          "Customer must not use Velocity Vision in any way that would make Global Solutions Management LLC responsible for Customer’s regulated AI system, high-risk AI deployment, automated decision system, profiling activity, employment decision, credit decision, housing decision, education decision, insurance decision, medical decision, legal decision or other regulated decision.",
        ],
      },
      {
        heading: "22. Regulated, High-Risk and Restricted Uses",
        paragraphs: [
          "Velocity Vision must not be used for regulated, high-risk, sensitive or legally restricted use unless Customer has all required authorisations and the use is expressly permitted under Customer’s plan and applicable written agreement.",
          "Restricted uses include, without limitation, uses involving:",
          "We may restrict or refuse any use that we reasonably consider high-risk, unlawful, unsafe, reputationally harmful, operationally burdensome, incompatible with the platform or unsuitable for Velocity Vision.",
        ],
        bullets: [
          "medical advice or diagnosis;",
          "legal advice;",
          "financial advice;",
          "investment recommendations;",
          "insurance underwriting;",
          "credit eligibility;",
          "employment decisions;",
          "housing decisions;",
          "education access decisions;",
          "criminal justice decisions;",
          "biometric identification;",
          "children’s data;",
          "sensitive personal data;",
          "political targeting;",
          "regulated financial promotions;",
          "regulated healthcare promotions;",
          "gambling;",
          "controlled goods or services;",
          "weapons;",
          "illegal goods or services;",
          "vulnerable-person targeting;",
          "emergency services;",
          "safety-critical systems.",
        ],
      },
      {
        heading: "23. Subscriptions, Credits, Billing and Taxes",
        paragraphs: [
          "Plans, subscriptions, credits, top-ups, billing cycles, included features, usage limits, currencies, renewal terms and applicable fees are shown at checkout, in billing settings, in product notices or in an applicable order form.",
          "By purchasing a plan, subscription, credit package or paid feature, you authorise us and our payment processors to charge the payment method provided for applicable fees, taxes, renewals, top-ups, overages and other charges.",
          "Unless expressly stated otherwise, subscriptions renew automatically until cancelled. You are responsible for cancelling before the renewal date if you do not want to renew.",
          "Credits may be consumed by AI-assisted generation, campaign preparation, outreach packs, social posts, press releases, video scripts, follow-up assets, multilingual variants, data preparation, activation, export, processing or other chargeable platform actions depending on your plan.",
          "Credits are not money, stored value, electronic money, gift cards or currency. Credits have no cash value, are not transferable, are not redeemable for cash and may expire, be limited, be withdrawn or be subject to plan rules.",
          "Stored data may remain available when credits run out, but chargeable actions may pause until credits are added, the plan is upgraded or billing is restored.",
          "Unless required by law or expressly stated in writing by Global Solutions Management LLC, fees, subscriptions and credit purchases are non-refundable once the paid period begins, credits are made available or services are activated.",
          "You are responsible for all taxes, VAT, sales tax, use tax, withholding, duties, levies, exchange-rate effects, bank fees, card fees, foreign transaction fees and payment-provider charges.",
          "Prices may be displayed in one or more currencies. Currency conversion tools, estimates or localised price displays are provided for convenience only. The final amount charged may depend on checkout currency, payment processor rates, card issuer rates, taxes, location, exchange-rate changes and payment-provider charges.",
          "We may suspend, restrict or terminate access for failed payments, expired payment methods, chargebacks, payment disputes, fraud signals, overdue invoices, tax issues or billing abuse.",
        ],
      },
      {
        heading: "24. Payment Recovery and Collection",
        paragraphs: [
          "Customer is responsible for all fees, taxes, usage charges, renewal charges, overages, payment-provider fees, chargeback fees, collection costs and legal costs incurred in recovering unpaid amounts to the maximum extent permitted by law.",
          "We may use internal or external collection processes, payment processors, legal advisers or debt recovery providers to recover unpaid amounts.",
          "Suspension, termination, non-use, failure to activate, failure to export, non-deliverability, campaign failure, customer-side configuration issues or dissatisfaction with Generated Outputs does not remove Customer’s obligation to pay fees already incurred.",
        ],
      },
      {
        heading: "25. Chargebacks and Payment Disputes",
        paragraphs: [
          "You must contact us promptly if you believe there is a billing error. You agree to work with us in good faith before initiating a chargeback, payment reversal, payment dispute or card dispute.",
          "Unfounded, abusive, fraudulent or unresolved chargebacks may result in suspension, termination, recovery action, loss of credits, account restrictions and refusal of future service.",
          "We may retain account, billing, usage and transaction records as reasonably necessary to investigate payment disputes, prevent fraud, comply with law and enforce these Terms.",
          "Customer remains responsible for fees, taxes and charges incurred before suspension or termination.",
        ],
      },
      {
        heading: "26. Trials, Promotions, Beta Features and Pre-Release Tools",
        paragraphs: [
          "We may offer trials, previews, promotions, beta features, experimental features, early-access tools or pre-release functionality.",
          "These are provided for evaluation only, may be changed or withdrawn at any time and may be subject to additional limits or terms.",
          "Beta and experimental features may be incomplete, unstable, inaccurate, unavailable, insecure, unsupported or unsuitable for production use. They are provided as-is and excluded from any service level commitments unless expressly stated otherwise.",
          "We may terminate, limit or withdraw any trial, promotion, beta feature or early-access tool without liability.",
        ],
      },
      {
        heading: "27. Agency, Client and Multi-Workspace Use",
        paragraphs: [
          "Agency Workspace users may operate multiple client, campaign, brand or business workspaces from one account where their plan permits it.",
          "The agency account holder remains solely responsible for:",
          "Velocity Vision does not enter into a contract with an agency’s end clients unless separately agreed in writing by Global Solutions Management LLC.",
          "Agency users must not represent that Velocity Vision has approved, reviewed, endorsed, guaranteed, legally cleared or compliance-cleared any client campaign, data source, outreach list, message, template, Generated Output, sender setup, deliverability result, recipient group or activation.",
          "The agency account holder is liable for all end-client activity under the agency account and must indemnify the Protected Parties for claims arising from client workspaces, client data, client outreach, client instructions, agency-managed use or end-client disputes.",
          "You may not resell, white-label, sublicense, rent, lease, broker, provide bureau access to, provide service-provider access to or commercially exploit Velocity Vision for third parties unless your plan expressly permits it or we agree in writing.",
        ],
        bullets: [
          "client relationships;",
          "client permissions;",
          "client data;",
          "client privacy notices;",
          "client lawful basis;",
          "client approvals;",
          "workspace configuration;",
          "sender setup;",
          "suppression lists;",
          "campaign content;",
          "Generated Outputs;",
          "activation decisions;",
          "exports;",
          "billing;",
          "user access;",
          "compliance obligations;",
          "client disputes;",
          "end-client instructions;",
          "local-law obligations.",
        ],
      },
      {
        heading: "28. Prohibited Use",
        paragraphs: [
          "You must comply with the Acceptable Use Policy and must not use Velocity Vision for unlawful, harmful, deceptive, abusive, exploitative, high-risk, infringing or platform-damaging activity.",
          "You must not:",
          "We may determine, in our reasonable judgment, whether conduct violates this section.",
        ],
        bullets: [
          "send spam or unlawful unsolicited messaging;",
          "use deceptive headers, misleading subject lines or false sender identities;",
          "impersonate any person, brand, company or authority;",
          "hide, falsify or manipulate sender identity;",
          "bypass unsubscribe, opt-out, suppression or contact restriction requirements;",
          "upload unlawfully obtained data;",
          "upload data without required rights or lawful basis;",
          "use the platform for phishing, credential theft, malware, fraud, scams or social engineering;",
          "reverse engineer, scrape, copy, benchmark, probe, scan or security test the platform without permission;",
          "interfere with platform infrastructure, rate limits, billing systems, safety controls or access controls;",
          "bypass sender verification, data-quality holds, activation gates, plan limits, suppression controls or compliance prompts;",
          "generate or distribute unlawful, defamatory, discriminatory, harassing, hateful, exploitative, sexually abusive, violent, infringing or deceptive content;",
          "use the platform for illegal goods or services;",
          "target vulnerable persons unlawfully or exploitatively;",
          "conduct regulated activity without required authorisation;",
          "upload malicious code or unsafe files;",
          "overload, degrade or abuse the platform;",
          "create multiple accounts to avoid limits, suspension, billing, risk controls or enforcement;",
          "misrepresent Velocity Vision’s role in any campaign, output, result or client work;",
          "use Velocity Vision in a way that exposes us, our providers, customers, recipients, infrastructure or third parties to legal, regulatory, reputational, operational, financial or security risk.",
        ],
      },
      {
        heading: "29. Competitor, Benchmarking and Model Training Restrictions",
        paragraphs: [
          "Customer must not use Velocity Vision to build, train, fine-tune, benchmark, evaluate, test or improve any competing product, AI model, dataset, platform, workflow, template library, automation system, commercial database or outreach tool without our prior written consent.",
          "Customer must not scrape, copy, extract, monitor, harvest or use platform content, prompts, templates, workflows, outputs, interface patterns, scoring logic, safety logic, product logic or system behaviour for competitive analysis, model training, dataset creation, product replication, reverse engineering or benchmarking.",
        ],
      },
      {
        heading: "30. Sanctions, Export Control and Restricted Territories",
        paragraphs: [
          "You must comply with all applicable sanctions, export control, trade control, anti-bribery, anti-corruption and anti-money laundering laws.",
          "You must not use Velocity Vision if you are located in, organised under the laws of, ordinarily resident in, owned or controlled by, or acting on behalf of any person or entity subject to sanctions, embargoes or trade restrictions that would prohibit access to the platform.",
          "You must not use Velocity Vision to support prohibited transactions, restricted parties, sanctioned entities, embargoed territories, unlawful exports, unlawful re-exports or unlawful circumvention of trade controls.",
          "You represent and warrant that you and your users are not prohibited from using Velocity Vision under applicable sanctions, export control or trade laws.",
          "We may restrict, suspend or terminate access where sanctions, export control, trade compliance or payment risk is identified or suspected.",
        ],
      },
      {
        heading: "31. Intellectual Property",
        paragraphs: [
          "Global Solutions Management LLC and its licensors own the Velocity Vision platform, software, interfaces, workflows, systems, product logic, templates, prompts, safety controls, designs, documentation, branding, know-how, data models, scoring logic, processes and all related intellectual property.",
          "You receive a limited, revocable, non-exclusive, non-transferable, non-sublicensable right to access and use Velocity Vision in accordance with these Terms, your plan and applicable policies.",
          "You retain ownership of your Customer Data and customer-provided content.",
          "You grant us the rights necessary to host, store, process, transmit, display, secure, back up, analyse and operate Customer Data and customer-provided content as needed to provide, maintain, secure, support and improve Velocity Vision, subject to the Privacy Policy and Data Processing Agreement.",
          "You must not copy, reproduce, modify, resell, sublicense, frame, mirror, scrape, extract, reverse engineer, decompile, disassemble, replicate or create derivative works from the platform, workflows, templates, interface, product logic, scoring logic, prompts, safety controls or systems except as expressly permitted.",
        ],
      },
      {
        heading: "32. Generated Output Ownership and Use",
        paragraphs: [
          "As between you and Global Solutions Management LLC, and to the extent permitted by law and subject to your compliance with these Terms, you may use Generated Outputs produced for you through Velocity Vision for your lawful business purposes.",
          "We do not guarantee that Generated Outputs are unique, protectable, copyrightable, registrable, non-infringing, accurate, compliant or free from third-party rights.",
          "Similar or identical outputs may be generated for other users.",
          "You are responsible for reviewing, clearing, approving and lawfully using Generated Outputs before use.",
          "Platform templates, system prompts, workflow structures, product logic, interface design, scoring logic, safety controls, platform processes and underlying technology remain owned by Global Solutions Management LLC or its licensors and are not transferred to you.",
        ],
      },
      {
        heading: "33. Takedown and Content Removal",
        paragraphs: [
          "We may remove, disable, restrict, quarantine or block any Customer Data, Generated Output, file, campaign, message, sender connection, integration, export or workspace content that we reasonably believe may violate law, infringe rights, create risk, breach these Terms, expose the platform to liability or harm third parties.",
          "We are not liable for loss arising from removal, blocking, disabling, quarantine, moderation, restriction or refusal of content, outputs, campaigns or data where we act to protect the platform, users, recipients, third-party providers, rights holders, regulators or our business.",
        ],
      },
      {
        heading: "34. Feedback",
        paragraphs: [
          "If you provide ideas, suggestions, requests, improvements, comments or other feedback about Velocity Vision, you grant Global Solutions Management LLC a worldwide, perpetual, irrevocable, royalty-free, sublicensable and transferable right to use, modify, commercialise and incorporate that feedback without restriction, obligation or compensation.",
        ],
      },
      {
        heading: "35. Third-Party Services and Integrations",
        paragraphs: [
          "Velocity Vision may rely on, connect to or integrate with third-party providers for hosting, authentication, payments, analytics, email connectivity, AI processing, data storage, monitoring, communications, translation, CRM tools, domain services, DNS, CDNs, logging, support tools or other infrastructure.",
          "Third-party services are not controlled by Global Solutions Management LLC. They may have their own terms, policies, pricing, security practices, outages, rate limits, account restrictions, suspensions, data practices and compliance requirements.",
          "You authorise us to transmit, process and receive data through third-party services as reasonably necessary to provide the platform, operate integrations, process payments, support AI-assisted features and maintain security.",
          "We are not responsible for third-party service failures, outages, errors, policy changes, pricing changes, data handling, deliverability decisions, payment interruptions, email provider restrictions, account suspensions, integration failures or external platform behaviour outside our reasonable control.",
          "You are responsible for complying with the terms and policies of any third-party services you connect to or use with Velocity Vision.",
          "We may disconnect, suspend, restrict or disable third-party integrations at any time where required by law, provider rules, technical constraints, security concerns, abuse signals, payment issues or operational risk.",
        ],
      },
      {
        heading: "36. Privacy and Data Processing",
        paragraphs: [
          "Our Privacy Policy explains how we collect and use personal information about website visitors, platform users, prospects, customers, billing contacts, support contacts and individuals who interact with us directly.",
          "The Data Processing Agreement governs personal data that customers upload and that we process as a processor, service provider or equivalent role on Customer’s behalf.",
          "Customer is responsible for determining whether Customer acts as controller, business, processor, service provider, joint controller, independent controller or another legal role under applicable law.",
          "Customer is responsible for providing all required privacy notices to its own contacts, customers, prospects, recipients, employees, contractors, end clients and users.",
          "Customer is responsible for responding to legal rights requests from its own contacts, customers, prospects and end clients unless applicable law requires us to respond directly.",
          "Customer must not use Velocity Vision to avoid, bypass or frustrate privacy, marketing, data protection, platform or recipient rights.",
        ],
      },
      {
        heading: "37. International Data Transfers",
        paragraphs: [
          "Velocity Vision may be operated from, supported from, hosted in or accessed from multiple jurisdictions, including the United States and other countries where we or our service providers operate.",
          "Customer is responsible for ensuring that Customer Data may lawfully be transferred to, accessed from, processed in and stored in all relevant jurisdictions.",
          "Where required by applicable data protection law, international transfers may be governed by the Data Processing Agreement, applicable standard contractual clauses, transfer addenda, supplementary measures or other lawful transfer mechanisms.",
          "Customer must not upload or process data through Velocity Vision where transfer, access, processing or storage would breach applicable law, contract, professional duty, regulatory obligation or data subject restriction.",
        ],
      },
      {
        heading: "38. Regulatory, Legal and Third-Party Requests",
        paragraphs: [
          "If we receive a subpoena, court order, regulator request, law enforcement request, data subject request, rights-holder complaint, payment-provider request, email-provider request, third-party platform request, security complaint or legal notice relating to Customer, Customer Data, Customer’s users, Customer’s outreach, Customer’s clients or Customer’s workspace, we may respond, disclose information, preserve records, restrict access, notify Customer or take other action as we consider legally required or reasonably appropriate.",
          "Customer is responsible for costs, losses, fees, penalties, legal fees and operational burden arising from requests, complaints, investigations or claims caused by Customer Data, Customer outreach, Customer instructions, Customer users, Customer clients, Customer integrations or Customer’s use of Velocity Vision.",
          "We are not required to challenge any legal, regulatory, payment-provider, email-provider or third-party request unless required by law or expressly agreed in writing.",
        ],
      },
      {
        heading: "39. Monitoring, Review and Enforcement",
        paragraphs: [
          "We may, but are not required to, monitor, scan, log, review, analyse, investigate, preserve or restrict accounts, workspaces, Customer Data, Generated Outputs, usage patterns, sender connections, integrations, activation activity, exports, billing activity and platform signals to operate the platform, improve safety, prevent abuse, enforce these Terms, comply with law, respond to complaints, protect infrastructure, protect recipients, protect third-party providers and protect our business.",
          "No monitoring, review, automated check, manual check, warning, flag, hold, approval flow or failure to act creates any responsibility for Customer’s data, outputs, campaigns, compliance, outreach or legal obligations.",
          "We may use automated systems, human review, third-party tools and risk scoring to identify suspected abuse, fraud, unlawful activity, security risk, policy breach or platform risk.",
        ],
      },
      {
        heading: "40. Security and Customer Responsibilities",
        paragraphs: [
          "We use commercially reasonable safeguards designed to protect the platform. However, no system is completely secure, error-free or immune from attack.",
          "Customer is responsible for:",
          "We are not responsible for losses caused by weak passwords, shared credentials, compromised devices, unsafe exports, unauthorised internal users, insecure customer systems, customer-side misconfiguration, customer-side malware, user error, customer integrations or third-party account compromise.",
        ],
        bullets: [
          "securing its devices, networks, browsers and accounts;",
          "protecting passwords, credentials, API keys and integration access;",
          "managing workspace permissions;",
          "reviewing exports and downloads;",
          "securing data after export;",
          "ensuring users are trained and authorised;",
          "maintaining backups of important data;",
          "applying appropriate internal policies;",
          "promptly notifying us of suspected compromise.",
        ],
      },
      {
        heading: "41. Confidentiality",
        paragraphs: [
          "You must not disclose non-public information about Velocity Vision, including security controls, platform logic, private roadmap information, beta features, pricing not publicly available, technical processes, non-public documentation, non-public product plans, vulnerability information or other confidential information, except as required to use the platform or as required by law.",
          "This section does not prevent you from using your own Customer Data or Generated Outputs in accordance with these Terms.",
        ],
      },
      {
        heading: "42. Responsible Disclosure and Security Testing",
        paragraphs: [
          "You must not conduct vulnerability scanning, penetration testing, load testing, scraping, probing, automated testing, reverse engineering, credential testing, exploit testing or security research on Velocity Vision without our prior written permission.",
          "If you discover a suspected vulnerability, you must report it responsibly and must not exploit it, access data, disrupt systems, disclose it publicly, retain data, copy data or use it for any purpose other than responsible reporting.",
          "We may suspend or terminate any account involved in unauthorised security testing or platform interference.",
        ],
      },
      {
        heading: "43. Suspension and Termination",
        paragraphs: [
          "We may suspend, restrict, throttle, disable, delete or terminate access to any account, workspace, user, sender, activation, export, integration, feature, plan or credit balance if we reasonably believe there is:",
          "We may act immediately and without prior notice where necessary to protect Velocity Vision, customers, users, recipients, infrastructure, third-party providers, payment systems, AI systems, sender systems, legal compliance, platform integrity or our business.",
          "After termination, you may lose access to your workspace, Generated Outputs, Customer Data, reports, integrations and credits.",
          "We may retain limited records where required or reasonably necessary for legal, tax, audit, security, billing, dispute, fraud prevention, compliance, enforcement or legitimate business purposes.",
        ],
        bullets: [
          "legal risk;",
          "security risk;",
          "payment failure;",
          "chargeback risk;",
          "fraud risk;",
          "platform abuse;",
          "policy breach;",
          "data misuse;",
          "deliverability risk;",
          "complaint activity;",
          "regulatory concern;",
          "sanctions risk;",
          "harmful content;",
          "unlawful outreach;",
          "infrastructure risk;",
          "AI misuse;",
          "third-party provider risk;",
          "reputational risk;",
          "risk to us, customers, recipients, third-party providers or the public.",
        ],
      },
      {
        heading: "44. Data Export and Deletion",
        paragraphs: [
          "Where available, you may export certain Customer Data during an active subscription, subject to plan limits, technical limits, security checks, payment status and policy compliance.",
          "We are not required to provide exports after termination, suspension, non-payment, chargeback, legal restriction, security concern, account closure or platform enforcement, except where required by law or expressly agreed in writing.",
          "Deletion requests are handled in accordance with the Privacy Policy, Data Processing Agreement and applicable law.",
          "Some records may be retained where required or reasonably necessary for legal, tax, audit, security, billing, dispute, fraud prevention, compliance or enforcement purposes.",
        ],
      },
      {
        heading: "45. Service Levels",
        paragraphs: [
          "Any service level, support target, uptime target or response target applies only where expressly stated in the Service Level Agreement or a signed written agreement accepted by Global Solutions Management LLC.",
          "Unless expressly agreed otherwise, service levels do not apply to:",
          "Service credits, if any, are the sole and exclusive remedy for failure to meet an applicable service level and are subject to the terms, exclusions and claim process in the Service Level Agreement.",
        ],
        bullets: [
          "beta features;",
          "trials;",
          "free plans;",
          "third-party services;",
          "customer systems;",
          "customer integrations;",
          "customer-side misconfiguration;",
          "internet issues;",
          "email provider issues;",
          "AI provider issues;",
          "payment provider issues;",
          "hosting provider issues;",
          "force majeure events;",
          "external service events;",
          "misuse;",
          "unsupported use;",
          "suspended accounts;",
          "accounts with overdue payments;",
          "regulatory restrictions;",
          "sanctions restrictions;",
          "maintenance;",
          "security interventions;",
          "deliverability outcomes;",
          "outreach results;",
          "Generated Outputs.",
        ],
      },
      {
        heading: "46. Disclaimers",
        paragraphs: [
          "Velocity Vision is provided on an “as is” and “as available” basis to the maximum extent permitted by law.",
          "We do not warrant that the platform will be uninterrupted, error-free, secure against every threat, compatible with every system, available in every location, suitable for every jurisdiction, suitable for every industry or capable of meeting every customer requirement.",
          "We do not warrant or guarantee:",
          "No information provided through Velocity Vision is professional advice. You should obtain appropriate legal, tax, accounting, financial, regulatory, technical or professional advice where needed.",
        ],
        bullets: [
          "data-quality scoring;",
          "sender verification results;",
          "Generated Outputs;",
          "AI suggestions;",
          "reply classification;",
          "pipeline values;",
          "profitability estimates;",
          "export formatting;",
          "integrations;",
          "translations;",
          "campaign performance;",
          "deliverability;",
          "inbox placement;",
          "sender reputation;",
          "domain reputation;",
          "replies;",
          "meetings;",
          "sales;",
          "funding;",
          "revenue;",
          "legal compliance;",
          "regulatory compliance;",
          "recipient response;",
          "business outcomes;",
          "avoidance of spam filters;",
          "avoidance of complaints;",
          "avoidance of regulatory inquiry.",
        ],
      },
      {
        heading: "47. Limitation of Liability",
        paragraphs: [
          "To the maximum extent permitted by law, the total aggregate liability of the Protected Parties arising out of or relating to Velocity Vision, these Terms or any incorporated policy is limited to the amounts paid by Customer to Global Solutions Management LLC for the platform during the twelve months immediately before the event giving rise to the claim.",
          "If Customer used Velocity Vision for free or paid no fees during that period, the total aggregate liability of the Protected Parties is limited to USD 100 to the maximum extent permitted by law.",
          "To the maximum extent permitted by law, the Protected Parties are not liable for indirect, incidental, special, consequential, exemplary, enhanced or punitive damages, or for loss of profits, revenue, goodwill, opportunity, data, use, contracts, customers, business interruption, deliverability, sender reputation, domain reputation, anticipated savings, business value, reputation, wasted expenditure, replacement services, regulatory exposure, loss of access, loss of credits or loss arising from customer-side use.",
          "The limitations apply whether the claim is based on contract, tort, negligence, strict liability, statute, equity or any other legal theory, even if a Protected Party has been advised of the possibility of such damages.",
          "Customer agrees that the limitations of liability are an essential basis of the bargain and apply even if any limited remedy fails of its essential purpose.",
          "Nothing in these Terms excludes or limits liability where liability cannot lawfully be excluded or limited.",
        ],
      },
      {
        heading: "48. No Personal Liability of Owners, Managers, Directors, Officers or Other Protected Parties",
        paragraphs: [
          "To the maximum extent permitted by law, Customer agrees that it will bring any claim relating to Velocity Vision, these Terms, Customer’s account, Customer’s workspace, Customer Data, Generated Outputs, billing, suspension, termination, outreach activity or platform use only against Global Solutions Management LLC and not against any owner, member, manager, director, officer, employee, contractor, consultant, agent, representative, affiliate, licensor, supplier, service provider, subprocessor, payment provider, infrastructure provider, AI provider, hosting provider or professional adviser personally.",
          "Customer waives, to the maximum extent permitted by law, any right to seek personal liability from any Protected Party other than Global Solutions Management LLC for acts or omissions connected with Velocity Vision, except where such waiver is prohibited by mandatory law.",
        ],
      },
      {
        heading: "49. Indemnity",
        paragraphs: [
          "Customer agrees to defend, indemnify and hold harmless the Protected Parties from and against all claims, demands, investigations, complaints, proceedings, losses, liabilities, damages, penalties, fines, settlements, costs and expenses, including reasonable legal fees, arising from or related to:",
          "We may control the defence of any matter subject to indemnity. Customer must cooperate with us and must not settle any claim in a way that imposes obligations, admissions, restrictions or liability on any Protected Party without our prior written consent.",
        ],
        bullets: [
          "Customer’s account;",
          "Customer’s users;",
          "Customer’s workspaces;",
          "Customer Data;",
          "uploaded content;",
          "prompts;",
          "Generated Outputs;",
          "outreach activity;",
          "sender identity;",
          "contact lists;",
          "client activity;",
          "agency workspaces;",
          "end-client instructions;",
          "Customer’s breach of these Terms;",
          "Customer’s breach of law;",
          "infringement or alleged infringement of third-party rights;",
          "unlawful marketing;",
          "data protection violations;",
          "privacy violations;",
          "suppression or opt-out failures;",
          "regulated activity;",
          "customer-side systems;",
          "third-party integrations connected by Customer;",
          "payment disputes;",
          "chargebacks;",
          "tax obligations;",
          "regulatory requests;",
          "law enforcement requests;",
          "recipient complaints;",
          "data subject requests;",
          "misuse of the platform.",
        ],
      },
      {
        heading: "50. Force Majeure and External Service Events",
        paragraphs: [
          "Global Solutions Management LLC will not be liable for any delay, failure, interruption, suspension, loss, degradation, unavailability, data processing delay, delivery failure, support delay, billing disruption, feature limitation or non-performance caused by events, circumstances or conditions beyond its reasonable control.",
          "Force Majeure Events include, without limitation:",
          "Where a Force Majeure Event occurs, we may take any action reasonably necessary to protect Velocity Vision, customers, users, recipients, infrastructure, data, third-party providers, payment systems, sender systems, platform integrity or our business. This may include suspending, limiting, delaying, disabling, modifying, throttling, rerouting or terminating access to any account, workspace, feature, sender connection, integration, activation, export, AI-assisted function, billing function or support channel.",
          "Force Majeure Events do not create any right to a refund, credit, service credit, damages, compensation, chargeback, termination payment or extension unless expressly required by law or expressly stated in a separate signed written agreement accepted by Global Solutions Management LLC.",
          "Force Majeure Events do not relieve Customer of payment obligations for fees already incurred, subscriptions already activated, credits already made available, taxes, chargebacks, usage charges, indemnity obligations, confidentiality obligations, data compliance obligations, acceptable use obligations, outreach compliance obligations or obligations that by their nature should continue.",
          "We are not required to continue providing the platform, any feature, any integration, any sender connection, any AI-assisted function, any activation capability or any third-party-dependent service where doing so would create legal, regulatory, security, financial, operational, reputational, sanctions, payment, infrastructure, deliverability or third-party provider risk.",
          "If a Force Majeure Event continues for more than 30 days, we may terminate, suspend, restructure, migrate, modify or discontinue any affected account, workspace, plan, integration, feature or service without liability.",
          "We will use commercially reasonable efforts, where practical and lawful, to reduce the impact of a Force Majeure Event. However, we are not required to accept substitute performance, alternative payment methods, alternative technical arrangements, additional legal risk, increased operational burden, third-party policy breaches, security risk, sanctions risk or non-contractual performance in order to overcome a Force Majeure Event.",
          "This section applies in addition to, and does not limit, our rights under the sections on Third-Party Services, Suspension and Termination, Disclaimers, Limitation of Liability, Service Levels, Security and Customer Responsibilities.",
        ],
        bullets: [
          "acts of God, natural disasters, fire, flood, storm, earthquake, extreme weather, epidemic, pandemic, public health emergency or quarantine restriction;",
          "war, invasion, armed conflict, terrorism, sabotage, civil unrest, riot, insurrection, national emergency or military action;",
          "government action, regulatory action, court order, sanctions, export controls, import restrictions, embargoes, trade restrictions, law changes, enforcement action, licensing restrictions or orders from any public authority;",
          "interruption, failure, degradation or restriction of internet infrastructure, telecommunications networks, data centres, cloud providers, hosting providers, CDN providers, DNS providers, domain registrars, email providers, payment processors, banking networks, card networks, authentication providers, analytics providers, AI providers, API providers, CRM providers, translation providers, monitoring providers or other third-party services;",
          "third-party platform changes, API changes, rate limits, account restrictions, policy changes, technical restrictions, suspension decisions, deliverability decisions, spam filtering, blacklist events, sender reputation issues, domain reputation issues, email provider enforcement or external platform behaviour outside our reasonable control;",
          "cyberattack, denial-of-service attack, malware, ransomware, credential compromise, security incident, vulnerability exploitation, unauthorised access, infrastructure attack or malicious third-party activity;",
          "labour disputes, strikes, lockouts, shortages, supply-chain failures, utility failures, power failures, hardware failures, software defects, emergency maintenance or inability to obtain necessary services, equipment, personnel, permissions, licences or infrastructure;",
          "payment disruption, chargeback network disruption, banking failure, processor outage, fraud controls, tax authority restriction, currency restriction, foreign exchange restriction or inability to process payments through ordinary channels;",
          "any other event, circumstance or cause beyond our reasonable control, whether foreseeable or unforeseeable, that prevents, delays, restricts, degrades or materially increases the burden, risk or cost of providing the platform.",
        ],
      },
      {
        heading: "51. No Guarantee of Global Availability",
        paragraphs: [
          "Velocity Vision may be accessed from multiple countries, but not all features, plans, data types, integrations, outreach activities, AI functions, payment methods, templates or activation tools are lawful, available or appropriate in every jurisdiction.",
          "We may restrict, geoblock, suspend, modify or refuse access to Velocity Vision or any feature in any country, region, state, province, territory or sector where we reasonably believe there is legal, regulatory, sanctions, technical, payment, security, operational or reputational risk.",
          "Customer is responsible for ensuring that its use of Velocity Vision is lawful in every jurisdiction relevant to Customer, its users, its data, its recipients, its senders, its clients, its campaigns and its business.",
        ],
      },
      {
        heading: "52. Local Law and Mandatory Rights",
        paragraphs: [
          "These Terms apply to the maximum extent permitted by applicable law.",
          "If mandatory law in a jurisdiction gives Customer rights that cannot be excluded, restricted or modified, these Terms do not exclude those rights, but all exclusions, limitations, disclaimers, indemnities and protections continue to apply to the maximum extent permitted by that law.",
          "Where a provision cannot be enforced as written in a particular jurisdiction, it will be interpreted, narrowed or reformed only to the minimum extent necessary to make it enforceable, and the rest of the provision and these Terms remain effective.",
        ],
      },
      {
        heading: "53. No Third-Party Beneficiaries",
        paragraphs: [
          "These Terms are for the benefit of Customer, Global Solutions Management LLC and the Protected Parties.",
          "No end client, recipient, contact, prospect, agency client, user, customer customer, supplier or other third party has rights under these Terms unless expressly stated in a signed written agreement accepted by Global Solutions Management LLC.",
        ],
      },
      {
        heading: "54. No Fiduciary, Partnership or Agency Relationship",
        paragraphs: [
          "Nothing in these Terms creates a partnership, joint venture, fiduciary relationship, employment relationship, franchise, agency relationship or representative authority between Customer and Global Solutions Management LLC.",
          "Customer has no authority to bind Global Solutions Management LLC or represent that Velocity Vision has approved, endorsed, reviewed, guaranteed or cleared any Customer activity.",
        ],
      },
      {
        heading: "55. Injunctive Relief",
        paragraphs: [
          "Customer agrees that breach of provisions relating to intellectual property, confidentiality, platform misuse, security abuse, unlawful access, reverse engineering, misuse of data, unlawful disclosure, competitor misuse, model training misuse or prohibited use may cause irreparable harm.",
          "We may seek injunctive or equitable relief without needing to prove actual damages or post a bond, where permitted by law.",
        ],
      },
      {
        heading: "56. Assignment",
        paragraphs: [
          "Customer may not assign, transfer or delegate these Terms, Customer’s account, workspace, plan, credits or rights to use Velocity Vision without our prior written consent.",
          "We may assign or transfer these Terms, accounts, customer relationships, data processing arrangements and platform operations in connection with a merger, acquisition, restructuring, financing, sale of assets, corporate reorganisation, transfer of business, change of control or platform migration.",
        ],
      },
      {
        heading: "57. Governing Law and Jurisdiction",
        paragraphs: [
          "These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles.",
          "Subject to any mandatory law that cannot be waived, the state and federal courts located in Delaware have exclusive jurisdiction over disputes arising out of or relating to these Terms or Velocity Vision.",
          "Customer and Global Solutions Management LLC each waive any objection to jurisdiction, venue or inconvenient forum in those courts.",
          "Despite the above, Global Solutions Management LLC may seek injunctive relief, debt recovery, payment enforcement, intellectual property enforcement, confidentiality enforcement, security enforcement or urgent protective relief in any court or forum of competent jurisdiction.",
        ],
      },
      {
        heading: "58. Optional Arbitration at Our Election",
        paragraphs: [
          "To the maximum extent permitted by law, Global Solutions Management LLC may elect to have any dispute, claim or controversy arising out of or relating to Velocity Vision, these Terms, Customer’s account, Customer’s workspace, Customer Data, Generated Outputs, payment, suspension or termination resolved by confidential binding arbitration instead of court proceedings.",
          "If arbitration is elected, the arbitration will take place in Delaware, in English, before a single arbitrator, under commercially reasonable arbitration rules selected by Global Solutions Management LLC, unless mandatory law requires otherwise.",
          "Nothing in this section prevents Global Solutions Management LLC from seeking injunctive relief, debt recovery, enforcement of intellectual property rights, confidentiality protection, security protection or urgent protective relief in court.",
        ],
      },
      {
        heading: "59. Class Action and Jury Trial Waiver",
        paragraphs: [
          "To the maximum extent permitted by law, Customer and Global Solutions Management LLC agree that disputes will be resolved only on an individual basis and not as part of any class, collective, consolidated, representative or group action.",
          "To the maximum extent permitted by law, Customer and Global Solutions Management LLC waive any right to a jury trial in any dispute arising out of or relating to these Terms or Velocity Vision.",
        ],
      },
      {
        heading: "60. Limitation Period",
        paragraphs: [
          "To the maximum extent permitted by law, any claim arising out of or relating to Velocity Vision, these Terms, a workspace, billing, credits, Generated Outputs, Customer Data, outreach activity, suspension or termination must be brought within one year after the event giving rise to the claim.",
          "Claims brought after that period are permanently barred, unless a longer period is required by mandatory law.",
        ],
      },
      {
        heading: "61. Notices",
        paragraphs: [
          "We may provide notices by posting on the website, posting in the platform, sending email to the account contact, sending billing notices, displaying checkout notices or using other reasonable communication methods.",
          "Customer is responsible for keeping contact details current and monitoring notices.",
          "Legal notices to Global Solutions Management LLC must be submitted through the Contact page using the route that matches the request, unless a separate signed written agreement specifies another notice method.",
        ],
      },
      {
        heading: "62. Severability",
        paragraphs: [
          "If any provision of these Terms is held invalid, unlawful or unenforceable, the remaining provisions remain in full force.",
          "The invalid provision will be interpreted, narrowed or replaced to achieve the original intent as closely as permitted by law.",
        ],
      },
      {
        heading: "63. No Waiver",
        paragraphs: [
          "Failure to enforce any provision of these Terms is not a waiver of that provision or any other provision.",
          "Any waiver must be in writing and expressly accepted by Global Solutions Management LLC.",
        ],
      },
      {
        heading: "64. Entire Agreement",
        paragraphs: [
          "These Terms and all incorporated documents form the entire agreement between Customer and Global Solutions Management LLC regarding access to and use of Velocity Vision, unless a separate signed written agreement expressly states otherwise.",
          "Customer acknowledges that it has not relied on any statement, representation, promise, assurance, forecast, projection, demo, example, output, estimate or marketing statement not expressly included in these Terms or a signed written agreement accepted by Global Solutions Management LLC.",
        ],
      },
      {
        heading: "65. Interpretation",
        paragraphs: [
          "Headings are for convenience only and do not affect interpretation.",
          "Words such as “including”, “includes”, “for example” and “without limitation” are illustrative and do not limit the words that follow.",
          "References to law include amendments, replacements and successor laws.",
          "References to Customer include Customer’s users, employees, contractors, agents, agencies, clients and representatives where the context allows.",
          "Any rule of interpretation that ambiguity is interpreted against the drafting party does not apply to these Terms.",
        ],
      },
      {
        heading: "66. Survival",
        paragraphs: [
          "Any provision that by its nature should survive suspension, termination, expiry or account closure will survive, including provisions relating to ownership, Customer Data responsibility, payment obligations, taxes, confidentiality, prohibited use, privacy, data processing, disclaimers, limitation of liability, no personal liability, indemnity, dispute resolution, governing law, class action waiver, jury trial waiver, records retention and enforcement.",
        ],
      },
      {
        heading: "67. Contact",
        paragraphs: [
          "For legal notices, questions about these Terms or policy-related requests, use the Contact page and select the route that matches your request.",
          "Global Solutions Management LLC Delaware, United States Operator of Velocity Vision",
        ],
      },
    ],
  },
  "client-services-agreement": {
    title: "Customer Agreement",
    effectiveDate: "30 June 2026",
    lastUpdated: "1 July 2026",
    version: "6.0",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          `Platform: ${PLATFORM}. Operator: ${ENTITY}.`,
          `This Customer Agreement governs paid plans, subscriptions, credits, top-ups, paid workspaces, agency workspaces, billing, commercial use, support access and related paid features of the ${PLATFORM} platform.`,
          `This Customer Agreement supplements the Platform Terms of Service. By purchasing, subscribing to, renewing, upgrading, topping up, accessing or using any paid feature of ${PLATFORM}, Customer agrees to this Customer Agreement, the Platform Terms of Service and all incorporated policies.`,
          `This document may be displayed in your browser's preferred language using an automated machine-translation layer, including GTranslate, Google Translate or similar translation technology. Translations are provided for convenience only. The English version controls if there is any conflict, ambiguity, inconsistency, error or difference between versions.`,
        ],
      },
      {
        heading: "1. Definitions",
        paragraphs: [
          `In this Customer Agreement:`,
          `"Velocity Vision", "Platform", "Service", "we", "us" or "our" means the ${PLATFORM} platform operated by Global Solutions Management LLC.`,
          `"Global Solutions Management LLC" means Global Solutions Management LLC, a company incorporated in the State of Delaware, United States.`,
          `"Customer", "you" or "your" means the person, company, agency, organisation, partnership, charity, trust, public body, fund, brand, client, estate, project or other legal entity that purchases, subscribes to, renews, upgrades, tops up, administers or uses any paid ${PLATFORM} feature.`,
          `"User" means any person who accesses or uses ${PLATFORM} through, under or in connection with Customer's account, workspace, invitation, login, role, permission, integration, client workspace or agency workspace.`,
          `"Workspace" means any account area, dashboard, Data Vault, client workspace, agency workspace, project space, business workspace or other environment made available through ${PLATFORM}.`,
          `"Plan" means a paid subscription, package, workspace tier, agency tier, credit package, top-up, promotional package, trial conversion, founder plan, annual plan, monthly plan, custom plan or other commercial access arrangement offered by ${PLATFORM}.`,
          `"Credits" means platform usage units used for chargeable actions such as AI-assisted generation, outreach packs, social posts, press releases, video scripts, follow-up assets, multilingual variants, data preparation, processing, exports, activation or other chargeable platform actions.`,
          `"Customer Data" means any data, file, record, list, note, instruction, prompt, content, contact, company record, recipient data, uploaded material, imported material, generated material, exported material, client material, sender information, billing information or workspace content provided, uploaded, imported, entered, generated, activated or used by or for Customer through ${PLATFORM}.`,
          `"Generated Outputs" means AI-assisted or system-generated drafts, templates, outreach copy, social posts, press releases, video scripts, follow-up messages, campaign briefs, summaries, data observations, quality checks, reports, prompts, pipeline notes, translations, multilingual variants, recommendations or other materials produced through ${PLATFORM}.`,
          `"Activation" means any customer-controlled action that sends, exports, publishes, schedules, prepares, triggers, connects, applies, downloads, moves, uses or otherwise operationalises Customer Data or Generated Outputs.`,
          `"Protected Parties" means Global Solutions Management LLC and its present and former owners, members, managers, directors, officers, employees, contractors, consultants, agents, representatives, affiliates, licensors, suppliers, service providers, subprocessors, payment providers, infrastructure providers, AI providers, hosting providers, professional advisers, successors and assigns.`,
        ],
      },
      {
        heading: "2. Agreement Purpose",
        paragraphs: [
          `This Customer Agreement applies to Customers who purchase, subscribe to, renew, upgrade, top up, access or use paid features of ${PLATFORM}.`,
          `This is a software and workspace agreement. It does not create an agency retainer, managed marketing service, outsourced campaign service, professional advisory engagement, legal compliance engagement, tax engagement, financial advisory engagement, deliverability consulting engagement, data brokerage engagement, email service provider-of-record relationship or revenue guarantee.`,
          `${PLATFORM} is self-serve software. Customer is responsible for configuring, reviewing, approving, activating and lawfully using the platform.`,
          `No managed service, professional service, legal review, compliance sign-off, human campaign review, customer-side approval, deliverability consulting, marketing agency service, advisory engagement or outsourced business service is included unless expressly stated in a separate signed written statement of work accepted by Global Solutions Management LLC.`,
        ],
      },
      {
        heading: "3. Relationship with Platform Terms",
        paragraphs: [
          `This Customer Agreement supplements and does not replace the Platform Terms of Service.`,
          `The Platform Terms of Service apply to all access, accounts, workspaces, users, data, AI-assisted features, Generated Outputs, acceptable use, outreach activity, privacy, data processing, third-party services, suspension, disclaimers, limitations of liability, indemnities, governing law, no personal liability, dispute terms and enforcement.`,
          `If there is a conflict between this Customer Agreement and the Platform Terms of Service, this Customer Agreement controls only for the specific commercial billing, Plan, Credit, renewal or subscription issue. The Platform Terms of Service continue to control all platform conduct, data, security, AI, outreach, acceptable use, compliance, suspension, liability, indemnity, confidentiality, no personal liability and enforcement matters unless expressly overridden in a signed written agreement accepted by Global Solutions Management LLC.`,
          `Customer purchase orders, procurement terms, vendor portal terms, customer policies, customer contract templates, email footers, onboarding notes, unsigned documents, unilateral terms, tender documents or other customer-side terms do not modify this Customer Agreement unless expressly accepted in writing by Global Solutions Management LLC.`,
          `No employee, contractor, chatbot, support agent, reseller, adviser, customer, agency or third party has authority to vary this Customer Agreement unless the variation is in a written agreement expressly accepted by Global Solutions Management LLC.`,
        ],
      },
      {
        heading: "4. Business Use Only",
        paragraphs: [
          `${PLATFORM} is provided for lawful business, professional, commercial, agency, organisational and entrepreneurial use only. It is not intended for personal, household or consumer use.`,
          `By purchasing or using a paid Plan, Customer confirms that it is acting in a business, professional, commercial, agency, organisational or entrepreneurial capacity and not as a consumer.`,
          `If Customer purchases or uses ${PLATFORM} on behalf of a company, agency, partnership, client, charity, trust, public body, fund, estate, project, brand or other organisation, the person accepting this Customer Agreement represents and warrants that they have authority to bind that organisation.`,
          `If Customer does not agree to this Customer Agreement, or if the person accepting does not have authority to bind Customer, Customer must not purchase, subscribe to, access or use paid features of ${PLATFORM}.`,
        ],
      },
      {
        heading: "5. No Consumer Use",
        paragraphs: [
          `${PLATFORM} is not designed for consumer contracting, household use, personal messaging, personal address books, private family records, consumer credit activity or individual domestic use.`,
          `If Customer accesses ${PLATFORM} in a jurisdiction where mandatory consumer laws may apply despite this business-use restriction, nothing in this Customer Agreement excludes rights that cannot legally be excluded. However, we may suspend, restrict or terminate any account that we reasonably believe is being used as a consumer account, personal account or household account.`,
        ],
      },
      {
        heading: "6. Contract Formation and Electronic Acceptance",
        paragraphs: [
          `Customer accepts this Customer Agreement by creating an account, clicking to accept, subscribing, purchasing a Plan, purchasing Credits, topping up, renewing, upgrading, accessing a paid Workspace, joining an invited Workspace, using paid features, uploading data, generating outputs, activating features, connecting integrations or otherwise using ${PLATFORM}.`,
          `Electronic acceptance, checkbox acceptance, checkout completion, payment, renewal, Workspace access and continued use each form a binding agreement to the maximum extent permitted by law.`,
          `Our platform records, billing records, checkout records, payment processor records, authentication records, usage logs, IP logs, email records, acceptance timestamps, Workspace records and audit logs may be used as evidence of acceptance, access, use, billing, renewal, Credit usage, activation, cancellation, compliance events and enforcement decisions.`,
          `Customer agrees that electronic records and platform logs are admissible and reliable evidence to the maximum extent permitted by law.`,
        ],
      },
      {
        heading: "7. Plans and Workspace Access",
        paragraphs: [
          `A Plan may include Workspace access, Data Vault usage, templates, AI-assisted generation, governed activation, cadence planning, reply organisation, follow-up support, pipeline tools, reporting, exports, agency workspaces, support access, Credits and other platform features.`,
          `Available features, pricing, currencies, limits, support levels, Credit allocations, renewal terms and usage rights may differ by Plan, region, account status, payment status, risk profile, checkout configuration, promotional offer or written order.`,
          `Starter, Growth, Agency Workspace, founder, promotional, annual, monthly, beta, trial and custom Plans may have different rights, restrictions, limits and pricing.`,
          `Workspace access is subject to successful payment, verification, compliance with all platform policies and our right to suspend or restrict access under this Customer Agreement and the Platform Terms of Service.`,
          `We may change, rename, restructure, replace, withdraw or limit Plans at any time. Changes may apply immediately where required for legal, security, payment, provider, technical or operational reasons, or at renewal where commercially appropriate.`,
          `No product description, pricing page, support message, public page, roadmap, screenshot, onboarding note or help article guarantees that any Plan, price, feature, Credit allocation, integration or support level will remain available indefinitely.`,
        ],
      },
      {
        heading: "8. Plan Limits and Fair Use",
        paragraphs: [
          `Plans may include limits on users, workspaces, client workspaces, data storage, uploads, exports, Credits, generated assets, AI-assisted actions, activation volume, sender connections, campaigns, support access, integrations, file sizes, API usage, rate limits or other usage measures.`,
          `Customer must not attempt to bypass Plan limits, fair-use limits, usage controls, billing rules, activation gates, safety controls, sender controls, verification controls or Credit consumption logic.`,
          `We may apply, modify or enforce fair-use limits where usage is excessive, abusive, technically burdensome, commercially unreasonable, inconsistent with Plan design, harmful to the platform, harmful to third-party providers or materially increases our cost of providing the Service.`,
          `We may throttle, restrict, suspend, require upgrade, charge additional fees or terminate access where Customer exceeds Plan limits or uses the platform in a way that creates unreasonable technical, legal, security, operational, provider, payment, AI-cost or reputational risk.`,
        ],
      },
      {
        heading: "9. Credits, Top-Ups and Usage",
        paragraphs: [
          `Credits are platform usage units. Credits are not cash balances, bank deposits, stored-value instruments, electronic money, gift cards, prepaid cards, securities, financial products, refundable currency or legal tender.`,
          `Credits may be consumed by AI-assisted generation, outreach packs, social posts, press releases, video scripts, follow-up assets, multilingual variants, data preparation, processing, activation, exports or other chargeable platform actions depending on the Plan and product configuration.`,
          `Credit consumption may vary by action type, feature, file size, data volume, output type, language, AI intensity, integration, campaign type, Workspace configuration, safety checks, retry logic, third-party provider requirements or future product changes.`,
          `Unused, expired, promotional, test, founder, bonus or goodwill Credits may be subject to Plan-specific rules and may expire, be withdrawn, be limited, be corrected or be removed.`,
          `Credits have no cash value, are not transferable, are not redeemable for cash, are not refundable unless expressly required by law and cannot be exchanged outside the platform.`,
          `We may correct obvious Credit errors, pricing errors, duplicate grants, fraudulent grants, abuse, miscalculations, technical errors, promotional misuse or billing mistakes.`,
          `Stored data may remain available when Credits run out, but chargeable actions may pause until Credits are added, billing is restored or the Plan is upgraded.`,
        ],
      },
      {
        heading: "10. AI-Heavy Actions",
        paragraphs: [
          `Campaign Credits may power AI-heavy actions across the Workspace, including outreach packs, social posts, press releases, video scripts, follow-up assets, campaign variants, data preparation and multilingual versions.`,
          `Customer acknowledges that Credit consumption for AI-assisted features may depend on third-party AI provider costs, infrastructure costs, model selection, output volume, translation requirements, retry logic, safety checks, file size, data complexity and product configuration.`,
          `We may change Credit consumption rules, Plan allowances, AI action pricing or feature availability to reflect infrastructure cost, AI provider changes, abuse prevention, legal risk, safety controls, product changes or commercial viability.`,
          `Credits provide access to platform actions and AI-assisted generation. They do not guarantee replies, meetings, sales, revenue, deliverability, campaign performance, legal compliance, recipient response, output accuracy or commercial outcome.`,
        ],
      },
      {
        heading: "11. Payment Authorisation",
        paragraphs: [
          `By purchasing, subscribing, renewing, upgrading, topping up or using paid features, Customer authorises Global Solutions Management LLC and its payment processors to charge the payment method provided for subscriptions, renewals, upgrades, top-ups, overages, taxes, payment-provider charges and other applicable fees.`,
          `Customer must provide accurate billing, payment, tax, company and contact information and keep it up to date.`,
          `Customer represents and warrants that it is authorised to use the payment method provided and that all payments are lawful.`,
          `We may use third-party payment processors. Payment processors may have their own terms, privacy notices, risk controls, fraud checks, account restrictions, processing delays, currency conversion rates and fees.`,
          `We are not responsible for payment processor outages, payment failures, bank declines, card issuer decisions, foreign exchange charges, card fees, banking fees, payment network issues or payment provider restrictions outside our reasonable control.`,
        ],
      },
      {
        heading: "12. Pricing, Currency and Taxes",
        paragraphs: [
          `Prices may be displayed in one or more currencies. Currency conversion tools, estimates or localised price displays are provided for convenience only.`,
          `The final amount charged may depend on checkout currency, payment processor rates, card issuer rates, bank rates, taxes, location, exchange-rate changes and payment-provider charges.`,
          `Customer is responsible for all taxes, VAT, GST, sales tax, use tax, withholding, duties, levies, assessments, bank fees, card fees, foreign transaction fees, exchange-rate effects and payment-provider charges unless we are legally required to collect them.`,
          `If Customer is required by law to withhold tax from payments, Customer must gross up the payment so that Global Solutions Management LLC receives the full amount that would have been received without withholding, unless prohibited by mandatory law.`,
          `We may collect taxes where required or where we reasonably determine collection is appropriate. Tax treatment may depend on Customer's location, billing details, tax status, usage, local law and payment processor configuration.`,
          `Customer is responsible for providing valid tax registration details, exemption certificates or other tax information where applicable.`,
        ],
      },
      {
        heading: "13. Renewals",
        paragraphs: [
          `Unless expressly stated otherwise at checkout or in a signed written agreement, subscription Plans renew automatically according to the billing cycle shown at purchase.`,
          `Customer authorises us and our payment processors to charge the payment method on file for renewal fees, taxes and applicable charges.`,
          `Customer is responsible for cancelling before the renewal date if it does not want to renew.`,
          `Failure to use the platform, failure to activate campaigns, dissatisfaction with results, non-deliverability, non-use of Credits, change of business plans, user error, customer-side configuration problems, customer data issues or lack of commercial outcome does not cancel renewal obligations or create a refund right.`,
        ],
      },
      {
        heading: "14. Cancellation",
        paragraphs: [
          `Customer may cancel a subscription through the available billing settings or by any cancellation method we expressly make available.`,
          `Cancellation stops future renewal but does not automatically refund past charges, current billing periods, used Credits, unused Credits, top-ups, setup fees, annual fees, promotional fees or fees for services already activated, unless required by law or expressly stated in writing by Global Solutions Management LLC.`,
          `Access may continue until the end of the paid period unless immediate termination, suspension, downgrade or restriction is required for non-payment, chargeback, fraud, legal risk, security risk, provider risk, sanctions risk, policy breach or platform protection.`,
          `If a Plan is cancelled, downgraded or paused, access to features, Credits, activation, exports, users, agency workspaces, integrations, stored data or support may change at the end of the paid period or earlier where permitted under this Customer Agreement or the Platform Terms of Service.`,
        ],
      },
      {
        heading: "15. Refunds",
        paragraphs: [
          `Unless required by law or expressly stated in writing by Global Solutions Management LLC, all fees, subscriptions, renewals, top-ups, Credits, annual Plans, monthly Plans, promotional packages, founder packages, agency packages, setup fees and paid features are non-refundable once the paid period begins, Credits are made available, access is activated or services are used.`,
          `Refunds are not provided for:`,
        ],
        bullets: [
          "failure to use the platform;",
          "unused Credits;",
          "used Credits;",
          "expired Credits;",
          "cancellation after renewal;",
          "customer-side configuration issues;",
          "failure to generate desired outputs;",
          "dissatisfaction with Generated Outputs;",
          "lack of replies;",
          "lack of leads;",
          "lack of meetings;",
          "lack of sales;",
          "lack of revenue;",
          "deliverability outcomes;",
          "sender reputation issues;",
          "email provider restrictions;",
          "third-party outages;",
          "customer data quality issues;",
          "unlawful or unusable customer data;",
          "suspension caused by Customer;",
          "termination caused by Customer;",
          "breach of this Customer Agreement or platform policies.",
          "Where a refund is granted as a goodwill gesture, it does not create a future entitlement, waiver, admission, obligation or precedent.",
        ],
      },
      {
        heading: "16. Failed Payments, Overdue Amounts and Collection",
        paragraphs: [
          `If payment fails, is declined, reversed, disputed, charged back or becomes overdue, we may suspend, restrict, downgrade, terminate or block access to the account, Workspace, Credits, exports, activation, integrations, agency workspaces and paid features.`,
          `Customer remains responsible for all fees, taxes, usage charges, renewal charges, overages, payment-provider fees, chargeback fees, collection costs and legal costs incurred in recovering unpaid amounts to the maximum extent permitted by law.`,
          `We may use internal or external collection processes, payment processors, legal advisers or debt recovery providers to recover unpaid amounts.`,
          `Suspension, termination, non-use, non-deliverability, customer-side configuration issues or dissatisfaction with Generated Outputs does not remove Customer's obligation to pay fees already incurred.`,
          `Customer may not withhold payment, set off amounts, reverse payment or initiate a chargeback because of a dispute, complaint, alleged claim or dissatisfaction, except where mandatory law gives Customer a non-waivable right.`,
        ],
      },
      {
        heading: "17. Chargebacks and Payment Disputes",
        paragraphs: [
          `Customer must contact us promptly if it believes there is a billing error. Customer agrees to work with us in good faith before initiating a chargeback, payment reversal, payment dispute or card dispute.`,
          `Unfounded, abusive, fraudulent or unresolved chargebacks may result in suspension, termination, recovery action, loss of Credits, account restrictions and refusal of future service.`,
          `We may retain account, billing, usage, checkout, payment and transaction records as reasonably necessary to investigate payment disputes, prevent fraud, comply with law and enforce this Customer Agreement.`,
          `Customer remains responsible for fees, taxes and charges incurred before suspension or termination.`,
        ],
      },
      {
        heading: "18. Trials, Promotions and Founder Offers",
        paragraphs: [
          `We may offer trials, previews, promotions, discounts, founder offers, bonus Credits, goodwill Credits, beta access or early-access tools.`,
          `These offers are discretionary, may be limited, may be withdrawn, may expire, may be changed and may be subject to additional terms.`,
          `Trial, founder, promotional, bonus, test or goodwill Credits have no cash value and may be removed, corrected, limited or withdrawn where there is abuse, error, non-payment, cancellation, expiry or policy breach.`,
          `Promotional pricing may apply only for the period stated. After the promotional period, standard pricing may apply unless Customer cancels before renewal.`,
        ],
      },
      {
        heading: "19. Beta, Preview and Experimental Features",
        paragraphs: [
          `Some features may be in beta, preview, founder release, limited release, early access or experimental mode.`,
          `Beta and experimental features may be incomplete, unstable, inaccurate, unavailable, insecure, unsupported, rate-limited, changed or withdrawn at any time.`,
          `Beta and experimental features are provided as-is and are excluded from service level commitments, uptime commitments, support targets and refund rights unless expressly stated otherwise.`,
          `Customer should not rely on beta or experimental features for business-critical, regulated, legal, compliance, financial, safety-critical or high-risk use.`,
        ],
      },
      {
        heading: "20. Customer Obligations",
        paragraphs: [
          `Customer is responsible for Customer Data, instructions, configuration, users, senders, clients, Generated Outputs, approval decisions, activation decisions, follow-up actions, pipeline records, exports, integrations and use of the platform.`,
          `Customer must:`,
        ],
        bullets: [
          "ensure all uploaded data can lawfully be processed and used for the intended purpose;",
          "maintain lawful basis, consent, permission, legitimate interest or other required justification where applicable;",
          "provide privacy notices where required;",
          "maintain suppression lists, unsubscribe records and opt-out records where required;",
          "review Generated Outputs before use;",
          "ensure sender identity is accurate and not misleading;",
          "ensure outreach content is lawful, truthful and substantiated;",
          "comply with anti-spam, privacy, data protection, advertising, consumer protection, platform, sector-specific, AI, export control, sanctions and local laws;",
          "maintain internal approvals and evidence where required;",
          "supervise all users and client workspaces;",
          "prevent misuse of the platform.",
          "Customer must not use Velocity Vision to bypass legal obligations, recipient rights, opt-outs, unsubscribe requests, suppression lists, platform rules, sender controls, safety controls, Credit rules or Plan limits.",
        ],
      },
      {
        heading: "21. Global Outreach Compliance",
        paragraphs: [
          `Customer is solely responsible for compliance with all laws, rules, regulations, regulatory guidance, platform terms and industry standards that apply to outreach, prospecting, lead generation, direct marketing, email, SMS, messaging, social outreach, telephone contact, retargeting, advertising, tracking and follow-up in every relevant jurisdiction.`,
          `This includes, where applicable:`,
        ],
        bullets: [
          "consent requirements;",
          "legitimate interest requirements;",
          "soft opt-in requirements;",
          "opt-out and unsubscribe requirements;",
          "sender identification requirements;",
          "physical address requirements;",
          "suppression-list requirements;",
          "subject-line and header requirements;",
          "commercial-claim substantiation;",
          "recipient-location rules;",
          "sector-specific marketing rules;",
          "vulnerable-recipient rules;",
          "business-to-business marketing rules;",
          "business-to-consumer marketing rules;",
          "agency-managed campaign rules;",
          "platform and provider rules.",
          `${PLATFORM} does not validate consent, approve lawful basis, certify recipient lists, guarantee compliance, provide legal clearance, monitor all messages, act as sender of record or assume responsibility for Customer outreach.`,
          `Customer must not use ${PLATFORM} to bypass, ignore, suppress, conceal or frustrate recipient rights, unsubscribe rights, opt-out requests, suppression obligations, platform rules or legal restrictions.`,
        ],
      },
      {
        heading: "22. Compliance Evidence",
        paragraphs: [
          `We may require Customer to provide evidence of lawful basis, consent, source, suppression handling, sender authority, recipient permission, client authority, data ownership, opt-out processing, campaign approval, regulated-sector permission or other compliance evidence where we reasonably believe there is legal, regulatory, security, payment, abuse, deliverability, reputational or operational risk.`,
          `Failure to provide satisfactory evidence may result in suspension, restriction, export hold, activation hold, sender hold, account review, termination or refusal of future service.`,
          `Any request for evidence does not make us responsible for Customer's compliance and does not mean that we approve, validate or certify Customer's data, campaign, outreach, sender setup or Generated Outputs.`,
        ],
      },
      {
        heading: "23. Customer-Controlled Activation",
        paragraphs: [
          `${PLATFORM} is designed around AI-powered assistance and customer-controlled activation.`,
          `Customer remains responsible for deciding what is sent, exported, published, scheduled, activated, copied, used or relied on.`,
          `Customer must review, edit, approve and verify Generated Outputs before using them.`,
          `Customer must not represent that ${PLATFORM} has approved, reviewed, verified, legally cleared, compliance-checked or guaranteed any Generated Output, campaign, recipient list, data source, template, claim, message, deliverability result or commercial outcome.`,
        ],
      },
      {
        heading: "24. AI-Assisted Features and Generated Outputs",
        paragraphs: [
          `${PLATFORM} may include AI-assisted tools that help draft, structure, summarise, classify, translate, segment, organise, review, suggest or generate content and workflow actions.`,
          `Generated Outputs are drafts only.`,
          `Customer is responsible for ensuring that all Generated Outputs are accurate, lawful, non-deceptive, non-infringing, appropriate for the recipient, appropriate for the jurisdiction, appropriate for the channel, appropriate for the industry, consistent with Customer's brand and policies, and compliant with applicable laws, regulations, professional duties and platform rules.`,
          `Generated Outputs may be incomplete, inaccurate, outdated, repetitive, biased, unsuitable, non-compliant, unsafe, offensive, misleading or similar to outputs generated for other users.`,
          `We do not guarantee uniqueness, copyrightability, legal clearance, factual accuracy, commercial value, compliance, suitability, performance, deliverability or any outcome from Generated Outputs.`,
          `${PLATFORM} does not provide legal, tax, accounting, financial, medical, employment, investment, regulatory, insurance, professional or compliance advice. Customer must not rely on AI outputs as a substitute for qualified professional review.`,
        ],
      },
      {
        heading: "25. AI Legal Role Allocation",
        paragraphs: [
          `Customer is responsible for determining whether its use of ${PLATFORM} makes Customer a deployer, user, provider, distributor, importer, operator, controller, business, employer, regulated entity or other legal role under applicable AI, privacy, marketing, consumer protection, professional or sector-specific laws.`,
          `${PLATFORM} provides AI-assisted software tools and workflow support. Unless expressly agreed in writing, Global Solutions Management LLC does not assume Customer's legal role, regulated status, professional obligations, deployment obligations, customer-facing obligations, human oversight obligations, impact assessment obligations, transparency obligations, risk management obligations, monitoring obligations or recordkeeping obligations.`,
          `Customer must not use ${PLATFORM} in any way that would make Global Solutions Management LLC responsible for Customer's regulated AI system, high-risk AI deployment, automated decision system, profiling activity, employment decision, credit decision, housing decision, education decision, insurance decision, medical decision, legal decision or other regulated decision.`,
          `Customer is responsible for human oversight, review, approval, transparency notices, end-user disclosures, logs, monitoring, impact assessments and compliance records where required by applicable AI, privacy, employment, consumer protection, sector-specific or professional laws.`,
        ],
      },
      {
        heading: "26. Regulated, High-Risk and Restricted Uses",
        paragraphs: [
          `${PLATFORM} must not be used for regulated, high-risk, sensitive or legally restricted use unless Customer has all required authorisations and the use is expressly permitted under Customer's Plan and applicable written agreement.`,
          `Restricted uses include, without limitation, uses involving:`,
        ],
        bullets: [
          "medical advice or diagnosis;",
          "legal advice;",
          "financial advice;",
          "investment recommendations;",
          "insurance underwriting;",
          "credit eligibility;",
          "employment decisions;",
          "housing decisions;",
          "education access decisions;",
          "criminal justice decisions;",
          "biometric identification;",
          "children's data;",
          "sensitive personal data;",
          "political targeting;",
          "regulated financial promotions;",
          "regulated healthcare promotions;",
          "gambling;",
          "controlled goods or services;",
          "weapons;",
          "illegal goods or services;",
          "vulnerable-person targeting;",
          "emergency services;",
          "safety-critical systems.",
          `We may restrict or refuse any use that we reasonably consider high-risk, unlawful, unsafe, reputationally harmful, operationally burdensome, incompatible with the platform or unsuitable for ${PLATFORM}.`,
        ],
      },
      {
        heading: "27. Agency Workspace Customers",
        paragraphs: [
          `Agency Workspace Customers may operate multiple client, campaign, brand or business workspaces from one account where their Plan permits it.`,
          `The agency account holder remains the contracting Customer and is responsible for:`,
        ],
        bullets: [
          "client relationships;",
          "client permissions;",
          "client data;",
          "client privacy notices;",
          "client lawful basis;",
          "client approvals;",
          "workspace configuration;",
          "sender setup;",
          "suppression lists;",
          "campaign content;",
          "Generated Outputs;",
          "activation decisions;",
          "exports;",
          "billing allocation;",
          "user access;",
          "compliance obligations;",
          "client disputes;",
          "end-client instructions;",
          "local-law obligations.",
          `${PLATFORM} does not enter into a contract with an agency's end clients unless separately agreed in writing by Global Solutions Management LLC.`,
          "End clients do not receive direct rights against us unless we separately contract with them in writing.",
          `Agency Customers must not represent that ${PLATFORM} has approved, reviewed, endorsed, guaranteed, legally cleared or compliance-cleared any client campaign, data source, outreach list, message, template, Generated Output, sender setup, deliverability result, recipient group or activation.`,
          "The agency account holder is liable for all end-client activity under the agency account and must indemnify the Protected Parties for claims arising from client workspaces, client data, client outreach, client instructions, agency-managed use or end-client disputes.",
        ],
      },
      {
        heading: "28. Resale, White-Labelling and Client Access",
        paragraphs: [
          `Customer may not resell, white-label, sublicense, rent, lease, broker, provide bureau access to, provide service-provider access to or commercially exploit ${PLATFORM} for third parties unless the applicable Plan expressly permits it or we agree in writing.`,
          `Customer must not remove, obscure or misrepresent ${PLATFORM} branding, legal terms, safety notices, platform notices, AI notices, opt-out prompts, sender prompts or compliance notices unless expressly permitted in writing.`,
          `Client access, team access or agency workspace access remains subject to this Customer Agreement, the Platform Terms of Service and all platform policies.`,
          `Customer is responsible for ensuring that every client, team member, contractor, consultant or user accessing the platform through Customer complies with all applicable terms.`,
        ],
      },
      {
        heading: "29. Account Ownership and Authority Disputes",
        paragraphs: [
          `If there is a dispute about account ownership, Workspace control, administrator authority, payment authority, client ownership, user access or legal entitlement to data, we may freeze, restrict, suspend, preserve or disable the relevant account, Workspace, export, billing access or user access until the dispute is resolved to our satisfaction.`,
          `We are not required to decide internal disputes between shareholders, directors, partners, employees, agencies, clients, contractors or other parties.`,
          `We may rely on billing records, administrator records, legal documents, court orders, company records, account history or other evidence we consider appropriate.`,
          `We are not liable for loss arising from account freezes, access restrictions, export holds or administrative delays caused by ownership or authority disputes.`,
        ],
      },
      {
        heading: "30. Platform Support; No Professional Services",
        paragraphs: [
          `Support may help with product usage, account access, billing questions, workspace navigation, workflow questions and technical issues.`,
          `Unless expressly agreed in a signed written statement of work accepted by Global Solutions Management LLC, support does not include:`,
        ],
        bullets: [
          "managed campaign delivery;",
          "legal review;",
          "tax advice;",
          "financial advice;",
          "accounting advice;",
          "compliance sign-off;",
          "deliverability consulting;",
          "data protection advice;",
          "sender reputation management;",
          "customer-side approvals;",
          "professional services;",
          "human review of campaigns;",
          "manual prospecting;",
          "outsourced marketing services;",
          "guaranteed outcome work.",
          `Any support, examples, templates, help content, onboarding notes, AI outputs or recommendations are provided for general product-use assistance only and do not transfer responsibility from Customer to ${PLATFORM}.`,
        ],
      },
      {
        heading: "31. Statements of Work",
        paragraphs: [
          `If Global Solutions Management LLC separately agrees to provide implementation, migration, onboarding, configuration, training, technical support, custom setup or other services, those services must be set out in a signed written statement of work or written order accepted by Global Solutions Management LLC.`,
          `No statement of work will include legal advice, compliance approval, managed campaign operation, deliverability guarantee, professional advice, tax advice, financial advice, regulated advice or outcome guarantee unless expressly stated and lawfully permitted.`,
          `Customer remains responsible for data, compliance, approvals, outreach, Generated Outputs, sender setup, client permissions and activation decisions even where support, onboarding or implementation assistance is provided.`,
        ],
      },
      {
        heading: "32. No Outcome Guarantee",
        paragraphs: [
          `Commercial outcomes depend on Customer's data quality, sender reputation, domain reputation, message quality, offer strength, lawful permissions, audience behaviour, market conditions, timing, third-party systems, customer response, recipient decisions and external factors outside our control.`,
          `We do not guarantee:`,
        ],
        bullets: [
          "replies;",
          "leads;",
          "meetings;",
          "sales;",
          "conversion;",
          "funding;",
          "investment;",
          "press coverage;",
          "revenue;",
          "profit;",
          "pipeline value;",
          "deliverability;",
          "inbox placement;",
          "sender reputation;",
          "domain reputation;",
          "open rates;",
          "click rates;",
          "recipient response;",
          "legal compliance;",
          "campaign performance;",
          "customer retention;",
          "commercial outcome.",
          "No projection, dashboard, estimate, score, pipeline value, quality status, campaign preview, Generated Output, template, report, example or support message creates an outcome guarantee.",
        ],
      },
      {
        heading: "33. Customer Data and Output Rights",
        paragraphs: [
          `Customer retains ownership of Customer Data and customer-provided content.`,
          `Subject to payment, compliance with this Customer Agreement and the Platform Terms of Service, Customer may use Generated Outputs produced for Customer through ${PLATFORM} for Customer's lawful business purposes.`,
          `We do not guarantee that Generated Outputs are unique, protectable, copyrightable, registrable, non-infringing, accurate, compliant or free from third-party rights.`,
          `Similar or identical outputs may be generated for other users.`,
          `Customer is responsible for reviewing, clearing, approving and lawfully using Generated Outputs before use.`,
          `Platform templates, system prompts, workflow structures, product logic, interface design, scoring logic, safety controls, platform processes and underlying technology remain owned by Global Solutions Management LLC or its licensors and are not transferred to Customer.`,
        ],
      },
      {
        heading: "34. Platform Intellectual Property",
        paragraphs: [
          `Global Solutions Management LLC and its licensors own the ${PLATFORM} platform, software, interfaces, workflows, systems, product logic, templates, prompts, safety controls, designs, documentation, branding, know-how, data models, scoring logic, processes and all related intellectual property.`,
          `Customer receives a limited, revocable, non-exclusive, non-transferable, non-sublicensable right to access and use ${PLATFORM} in accordance with this Customer Agreement, the Platform Terms of Service, the applicable Plan and platform policies.`,
          `Customer must not copy, reproduce, modify, resell, sublicense, frame, mirror, scrape, extract, reverse engineer, decompile, disassemble, replicate or create derivative works from the platform, workflows, templates, interface, product logic, scoring logic, prompts, safety controls or systems except as expressly permitted.`,
        ],
      },
      {
        heading: "35. Competitor and Training Restrictions",
        paragraphs: [
          `Customer must not use ${PLATFORM} to build, train, fine-tune, benchmark, evaluate, test or improve any competing product, AI model, dataset, platform, workflow, template library, automation system, commercial database or outreach tool without our prior written consent.`,
          `Customer must not scrape, copy, extract, monitor, harvest or use platform content, prompts, templates, workflows, outputs, interface patterns, scoring logic, safety logic, product logic or system behaviour for competitive analysis, model training, dataset creation, product replication, reverse engineering or benchmarking.`,
        ],
      },
      {
        heading: "36. Confidentiality",
        paragraphs: [
          `Each party may receive non-public business, technical, operational, pricing, product, security, financial, customer, platform or commercial information from the other.`,
          `Each party must protect confidential information using reasonable care and use it only for the relationship unless disclosure is required by law, court order, regulator request, professional advisers, payment providers, infrastructure providers or service providers bound by confidentiality obligations.`,
          `Customer must not disclose non-public information about ${PLATFORM}, including security controls, platform logic, private roadmap information, beta features, pricing not publicly available, technical processes, non-public documentation, vulnerability information or other confidential information, except as required to use the platform or as required by law.`,
          `Confidentiality obligations survive termination.`,
        ],
      },
      {
        heading: "37. Monitoring, Review and Enforcement",
        paragraphs: [
          `We may, but are not required to, monitor, scan, log, review, analyse, investigate, preserve or restrict accounts, workspaces, Customer Data, Generated Outputs, usage patterns, sender connections, integrations, activation activity, exports, billing activity and platform signals to operate the platform, improve safety, prevent abuse, enforce this Customer Agreement, comply with law, respond to complaints, protect infrastructure, protect recipients, protect third-party providers and protect our business.`,
          `No monitoring, review, automated check, manual check, warning, flag, hold, approval flow or failure to act creates any responsibility for Customer's data, outputs, campaigns, compliance, outreach or legal obligations.`,
          `We may use automated systems, human review, third-party tools and risk scoring to identify suspected abuse, fraud, unlawful activity, security risk, policy breach or platform risk.`,
        ],
      },
      {
        heading: "38. Takedown and Content Removal",
        paragraphs: [
          `We may remove, disable, restrict, quarantine or block any Customer Data, Generated Output, file, campaign, message, sender connection, integration, export or Workspace content that we reasonably believe may violate law, infringe rights, create risk, breach this Customer Agreement, expose the platform to liability or harm third parties.`,
          `We are not liable for loss arising from removal, blocking, disabling, quarantine, moderation, restriction or refusal of content, outputs, campaigns or data where we act to protect the platform, users, recipients, third-party providers, rights holders, regulators or our business.`,
        ],
      },
      {
        heading: "39. Suspension and Restriction",
        paragraphs: [
          `We may suspend, restrict, throttle, downgrade, disable, delete or terminate access to any account, Workspace, user, sender, activation, export, integration, Plan, feature or Credit balance if we reasonably believe there is:`,
        ],
        bullets: [
          "non-payment;",
          "failed payment;",
          "chargeback risk;",
          "fraud risk;",
          "legal risk;",
          "security risk;",
          "platform abuse;",
          "policy breach;",
          "data misuse;",
          "deliverability risk;",
          "complaint activity;",
          "regulatory concern;",
          "sanctions risk;",
          "harmful content;",
          "unlawful outreach;",
          "infrastructure risk;",
          "AI misuse;",
          "third-party provider risk;",
          "reputational risk;",
          "risk to us, customers, recipients, third-party providers or the public.",
          `We may act immediately and without prior notice where necessary to protect ${PLATFORM}, customers, users, recipients, infrastructure, third-party providers, payment systems, AI systems, sender systems, legal compliance, platform integrity or our business.`,
          "Suspension or restriction does not create a refund right and does not relieve Customer of payment obligations already incurred.",
        ],
      },
      {
        heading: "40. Termination",
        paragraphs: [
          `Customer may terminate by cancelling the applicable Plan using the available cancellation method.`,
          `We may terminate this Customer Agreement, any Plan, any account, any Workspace or any paid feature where permitted under this Customer Agreement, the Platform Terms of Service, applicable law or a signed written agreement.`,
          `After termination, Customer may lose access to Workspaces, Generated Outputs, Customer Data, reports, integrations, Credits, support and paid features.`,
          `Termination does not affect fees already incurred, taxes, payment obligations, indemnity obligations, confidentiality obligations, data compliance obligations, acceptable use obligations, outreach compliance obligations or provisions that by their nature survive.`,
        ],
      },
      {
        heading: "41. Data Export and Retention",
        paragraphs: [
          `Where technically available and legally permitted, Customer may export certain Customer Data during an active paid subscription, subject to Plan limits, technical limits, security checks, payment status and policy compliance.`,
          `We are not required to provide exports after termination, suspension, non-payment, chargeback, legal restriction, security concern, account closure or platform enforcement, except where required by law or expressly agreed in writing.`,
          `Customer is responsible for exporting and preserving Customer Data before cancellation, downgrade, suspension or termination.`,
          `We may retain limited records where required or reasonably necessary for legal, tax, audit, security, billing, dispute, fraud prevention, compliance, enforcement or legitimate business purposes.`,
        ],
      },
      {
        heading: "42. Downgrades and Loss of Features",
        paragraphs: [
          `If Customer downgrades, cancels, pauses, fails to pay or moves to a lower Plan, access to features, users, data volumes, exports, agency workspaces, integrations, Credits, support, reports, activation tools and stored data may be reduced, disabled, restricted or removed.`,
          `Customer is responsible for exporting data before downgrading or cancelling where export is available and required.`,
          `We are not liable for loss of functionality, loss of access, loss of Credits, loss of historical reports, loss of integrations or loss of data availability caused by downgrade, cancellation, non-payment, Plan change or termination, except where mandatory law requires otherwise.`,
        ],
      },
      {
        heading: "43. Privacy and Data Processing",
        paragraphs: [
          `The Privacy Policy explains how we collect and use personal information about website visitors, platform users, prospects, customers, billing contacts, support contacts and individuals who interact with us directly.`,
          `The Data Processing Agreement governs personal data that customers upload and that we process as a processor, service provider or equivalent role on Customer's behalf.`,
          `Customer is responsible for determining whether Customer acts as controller, business, processor, service provider, joint controller, independent controller, deployer, provider or another legal role under applicable law.`,
          `Customer is responsible for providing all required privacy notices to its own contacts, customers, prospects, recipients, employees, contractors, end clients and users.`,
          `Customer is responsible for responding to legal rights requests from its own contacts, customers, prospects and end clients unless applicable law requires us to respond directly.`,
          `Customer must not use ${PLATFORM} to avoid, bypass or frustrate privacy, marketing, data protection, platform or recipient rights.`,
        ],
      },
      {
        heading: "44. International Data Transfers",
        paragraphs: [
          `${PLATFORM} may be operated from, supported from, hosted in or accessed from multiple jurisdictions, including the United States and other countries where we or our service providers operate.`,
          `Customer is responsible for ensuring that Customer Data may lawfully be transferred to, accessed from, processed in and stored in all relevant jurisdictions.`,
          `Where required by applicable data protection law, international transfers may be governed by the Data Processing Agreement, applicable standard contractual clauses, transfer addenda, supplementary measures or other lawful transfer mechanisms.`,
          `Customer must not upload or process data through ${PLATFORM} where transfer, access, processing or storage would breach applicable law, contract, professional duty, regulatory obligation or data subject restriction.`,
        ],
      },
      {
        heading: "45. Regulatory, Legal and Third-Party Requests",
        paragraphs: [
          `If we receive a subpoena, court order, regulator request, law enforcement request, data subject request, rights-holder complaint, payment-provider request, email-provider request, third-party platform request, security complaint or legal notice relating to Customer, Customer Data, Customer's users, Customer's outreach, Customer's clients or Customer's Workspace, we may respond, disclose information, preserve records, restrict access, notify Customer or take other action as we consider legally required or reasonably appropriate.`,
          `Customer is responsible for costs, losses, fees, penalties, legal fees and operational burden arising from requests, complaints, investigations or claims caused by Customer Data, Customer outreach, Customer instructions, Customer users, Customer clients, Customer integrations or Customer's use of ${PLATFORM}.`,
          `We are not required to challenge any legal, regulatory, payment-provider, email-provider or third-party request unless required by law or expressly agreed in writing.`,
        ],
      },
      {
        heading: "46. Third-Party Services",
        paragraphs: [
          `${PLATFORM} may rely on, connect to or integrate with third-party providers for hosting, authentication, payments, analytics, email connectivity, AI processing, data storage, monitoring, communications, translation, CRM tools, domain services, DNS, CDNs, logging, support tools or other infrastructure.`,
          `Third-party services are not controlled by Global Solutions Management LLC. They may have their own terms, policies, pricing, security practices, outages, rate limits, account restrictions, suspensions, data practices and compliance requirements.`,
          `We are not responsible for third-party service failures, outages, errors, policy changes, pricing changes, data handling, deliverability decisions, payment interruptions, email provider restrictions, account suspensions, integration failures or external platform behaviour outside our reasonable control.`,
          `Customer is responsible for complying with the terms and policies of any third-party services it connects to or uses with ${PLATFORM}.`,
        ],
      },
      {
        heading: "47. Service Levels",
        paragraphs: [
          `Any service level, support target, uptime target or response target applies only where expressly stated in the Service Level Agreement or a signed written agreement accepted by Global Solutions Management LLC.`,
          `Unless expressly agreed otherwise, service levels do not apply to:`,
        ],
        bullets: [
          "beta features;",
          "trials;",
          "free plans;",
          "third-party services;",
          "customer systems;",
          "customer integrations;",
          "customer-side misconfiguration;",
          "internet issues;",
          "email provider issues;",
          "AI provider issues;",
          "payment provider issues;",
          "hosting provider issues;",
          "force majeure events;",
          "external service events;",
          "misuse;",
          "unsupported use;",
          "suspended accounts;",
          "accounts with overdue payments;",
          "regulatory restrictions;",
          "sanctions restrictions;",
          "maintenance;",
          "security interventions;",
          "deliverability outcomes;",
          "outreach results;",
          "Generated Outputs.",
          "Service credits, if any, are the sole and exclusive remedy for failure to meet an applicable service level and are subject to the terms, exclusions and claim process in the Service Level Agreement.",
        ],
      },
      {
        heading: "48. Force Majeure and External Service Events",
        paragraphs: [
          `Global Solutions Management LLC will not be liable for any delay, failure, interruption, suspension, loss, degradation, unavailability, data processing delay, delivery failure, support delay, billing disruption, feature limitation or non-performance caused by events, circumstances or conditions beyond its reasonable control.`,
          `Force majeure and external service events include, without limitation, natural disasters, public health emergencies, war, terrorism, civil unrest, government action, regulatory action, sanctions, export controls, law changes, court orders, cloud provider failures, hosting failures, DNS failures, CDN failures, payment processor failures, banking failures, AI provider failures, API provider failures, email provider failures, CRM provider failures, internet failures, cyberattacks, denial-of-service attacks, malware, ransomware, labour disputes, supply-chain issues, utility failures, emergency maintenance, third-party policy changes, account restrictions, spam filtering, blacklist events, sender reputation issues, domain reputation issues and any other event beyond our reasonable control.`,
          `Force majeure and external service events do not create any right to a refund, credit, service credit, damages, compensation, chargeback, termination payment or extension unless expressly required by law or expressly stated in a separate signed written agreement accepted by Global Solutions Management LLC.`,
          `Force majeure and external service events do not relieve Customer of payment obligations for fees already incurred, subscriptions already activated, Credits already made available, taxes, chargebacks, usage charges, indemnity obligations, confidentiality obligations, data compliance obligations, acceptable use obligations, outreach compliance obligations or obligations that by their nature should continue.`,
        ],
      },
      {
        heading: "49. No Global Availability Guarantee",
        paragraphs: [
          `${PLATFORM} may be accessed from multiple countries, but not all features, Plans, data types, integrations, outreach activities, AI functions, payment methods, templates or activation tools are lawful, available or appropriate in every jurisdiction.`,
          `We may restrict, geoblock, suspend, modify or refuse access to ${PLATFORM} or any feature in any country, region, state, province, territory or sector where we reasonably believe there is legal, regulatory, sanctions, technical, payment, security, operational or reputational risk.`,
          `Customer is responsible for ensuring that its use of ${PLATFORM} is lawful in every jurisdiction relevant to Customer, its users, its data, its recipients, its senders, its clients, its campaigns and its business.`,
        ],
      },
      {
        heading: "50. Sanctions, Export Control and Anti-Corruption",
        paragraphs: [
          `Customer must comply with all applicable sanctions, export control, trade control, anti-bribery, anti-corruption and anti-money laundering laws.`,
          `Customer must not use ${PLATFORM} if Customer or any User is located in, organised under the laws of, ordinarily resident in, owned or controlled by, or acting on behalf of any person or entity subject to sanctions, embargoes or trade restrictions that would prohibit access to the platform.`,
          `Customer must not use ${PLATFORM} to support prohibited transactions, restricted parties, sanctioned entities, embargoed territories, unlawful exports, unlawful re-exports or unlawful circumvention of trade controls.`,
          `Customer represents and warrants that Customer and its Users are not prohibited from using ${PLATFORM} under applicable sanctions, export control or trade laws.`,
          `We may restrict, suspend or terminate access where sanctions, export control, trade compliance, anti-corruption or payment risk is identified or suspected.`,
        ],
      },
      {
        heading: "51. Disclaimers",
        paragraphs: [
          `${PLATFORM}, paid Plans, Credits, AI-assisted features, Generated Outputs, templates, exports, support and integrations are provided on an "as is" and "as available" basis to the maximum extent permitted by law.`,
          `We do not warrant that the platform, paid features, Credits, AI-assisted tools, Generated Outputs, templates, exports, integrations or support will be uninterrupted, error-free, secure against every threat, compatible with every system, available in every location, suitable for every jurisdiction, suitable for every industry or capable of meeting every customer requirement.`,
          `We do not warrant or guarantee data quality, sender verification results, Generated Outputs, AI suggestions, reply classification, pipeline values, profitability estimates, export formatting, integrations, translations, campaign performance, deliverability, inbox placement, sender reputation, domain reputation, replies, meetings, sales, funding, revenue, legal compliance, regulatory compliance, recipient response, business outcomes, avoidance of spam filters, avoidance of complaints or avoidance of regulatory inquiry.`,
        ],
      },
      {
        heading: "52. Limitation of Liability",
        paragraphs: [
          `To the maximum extent permitted by law, the total aggregate liability of the Protected Parties arising out of or relating to this Customer Agreement, ${PLATFORM}, any Plan, any Credits, any Workspace, any billing issue, any Generated Output, any support interaction or any incorporated policy is limited to the amounts paid by Customer to Global Solutions Management LLC for the platform during the twelve months immediately before the event giving rise to the claim.`,
          `If Customer used ${PLATFORM} for free or paid no fees during that period, the total aggregate liability of the Protected Parties is limited to USD 100 to the maximum extent permitted by law.`,
          `To the maximum extent permitted by law, the Protected Parties are not liable for indirect, incidental, special, consequential, exemplary, enhanced or punitive damages, or for loss of profits, revenue, goodwill, opportunity, data, use, contracts, customers, business interruption, deliverability, sender reputation, domain reputation, anticipated savings, business value, reputation, wasted expenditure, replacement services, regulatory exposure, loss of access, loss of Credits or loss arising from customer-side use.`,
          `The limitations apply whether the claim is based on contract, tort, negligence, strict liability, statute, equity or any other legal theory, even if a Protected Party has been advised of the possibility of such damages.`,
          `Customer agrees that the limitations of liability are an essential basis of the bargain and apply even if any limited remedy fails of its essential purpose.`,
          `Nothing in this Customer Agreement excludes or limits liability where liability cannot lawfully be excluded or limited.`,
        ],
      },
      {
        heading: "53. No Personal Liability of Directors, Managers, Staff or Other Protected Parties",
        paragraphs: [
          `To the maximum extent permitted by law, Customer agrees that it will bring any claim relating to ${PLATFORM}, this Customer Agreement, a Plan, Credits, billing, Customer's account, Customer's Workspace, Customer Data, Generated Outputs, suspension, termination, outreach activity or platform use only against Global Solutions Management LLC and not against any owner, member, manager, director, officer, employee, contractor, consultant, agent, representative, affiliate, licensor, supplier, service provider, subprocessor, payment provider, infrastructure provider, AI provider, hosting provider or professional adviser personally.`,
          `Customer waives, to the maximum extent permitted by law, any right to seek personal liability from any Protected Party other than Global Solutions Management LLC for acts or omissions connected with ${PLATFORM}, except where such waiver is prohibited by mandatory law.`,
          `The Protected Parties are intended third-party beneficiaries of all disclaimers, limitations of liability, indemnities, no-personal-liability provisions, defence rights, confidentiality protections, intellectual property protections and enforcement rights in this Customer Agreement and may rely on and enforce those protections to the maximum extent permitted by law.`,
        ],
      },
      {
        heading: "54. Indemnity",
        paragraphs: [
          `Customer agrees to defend, indemnify and hold harmless the Protected Parties from and against all claims, demands, investigations, complaints, proceedings, losses, liabilities, damages, penalties, fines, settlements, costs and expenses, including reasonable legal fees, arising from or related to:`,
        ],
        bullets: [
          "Customer's account;",
          "Customer's users;",
          "Customer's Workspaces;",
          "Customer Data;",
          "uploaded content;",
          "prompts;",
          "Generated Outputs;",
          "outreach activity;",
          "sender identity;",
          "contact lists;",
          "client activity;",
          "agency workspaces;",
          "end-client instructions;",
          "Customer's breach of this Customer Agreement;",
          "Customer's breach of the Platform Terms of Service;",
          "Customer's breach of law;",
          "infringement or alleged infringement of third-party rights;",
          "unlawful marketing;",
          "data protection violations;",
          "privacy violations;",
          "suppression or opt-out failures;",
          "regulated activity;",
          "customer-side systems;",
          "third-party integrations connected by Customer;",
          "payment disputes;",
          "chargebacks;",
          "tax obligations;",
          "regulatory requests;",
          "law enforcement requests;",
          "recipient complaints;",
          "data subject requests;",
          "misuse of the platform.",
          "We may control the defence of any matter subject to indemnity. Customer must cooperate with us and must not settle any claim in a way that imposes obligations, admissions, restrictions or liability on any Protected Party without our prior written consent.",
          "Customer's indemnity obligations apply to the maximum extent permitted by law, including where claims are brought by customers, end clients, recipients, users, regulators, authorities, payment providers, email providers, data subjects, rights holders, competitors or third-party platforms.",
        ],
      },
      {
        heading: "55. Local Law and Mandatory Rights",
        paragraphs: [
          `This Customer Agreement applies to the maximum extent permitted by applicable law.`,
          `If mandatory law in a jurisdiction gives Customer rights that cannot be excluded, restricted or modified, this Customer Agreement does not exclude those rights, but all exclusions, limitations, disclaimers, indemnities and protections continue to apply to the maximum extent permitted by that law.`,
          `Where a provision cannot be enforced as written in a particular jurisdiction, it will be interpreted, narrowed or reformed only to the minimum extent necessary to make it enforceable, and the rest of the provision and this Customer Agreement remain effective.`,
        ],
      },
      {
        heading: "56. No Third-Party Rights Against Us",
        paragraphs: [
          `End clients, recipients, prospects, contacts, Customer customers, agency clients, users, suppliers, contractors and other third parties do not receive direct rights against Global Solutions Management LLC under this Customer Agreement unless expressly stated in a signed written agreement accepted by Global Solutions Management LLC.`,
          `Customer is responsible for claims, disputes, complaints and obligations arising between Customer and its own clients, users, recipients, prospects, contacts, suppliers, contractors and third parties.`,
        ],
      },
      {
        heading: "57. No Fiduciary, Partnership or Agency Relationship",
        paragraphs: [
          `Nothing in this Customer Agreement creates a partnership, joint venture, fiduciary relationship, employment relationship, franchise, agency relationship, representative authority or professional advisory relationship between Customer and Global Solutions Management LLC.`,
          `Customer has no authority to bind Global Solutions Management LLC or represent that ${PLATFORM} has approved, endorsed, reviewed, guaranteed or cleared any Customer activity.`,
        ],
      },
      {
        heading: "58. Injunctive Relief",
        paragraphs: [
          `Customer agrees that breach of provisions relating to intellectual property, confidentiality, platform misuse, security abuse, unlawful access, reverse engineering, misuse of data, unlawful disclosure, competitor misuse, model training misuse or prohibited use may cause irreparable harm.`,
          `We may seek injunctive or equitable relief without needing to prove actual damages or post a bond, where permitted by law.`,
        ],
      },
      {
        heading: "59. Governing Law and Jurisdiction",
        paragraphs: [
          `This Customer Agreement is governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles.`,
          `Subject to any mandatory law that cannot be waived, the state and federal courts located in Delaware have exclusive jurisdiction over disputes arising out of or relating to this Customer Agreement, ${PLATFORM}, any Plan, Credits, billing, Workspace access, suspension or termination.`,
          `Customer and Global Solutions Management LLC each waive any objection to jurisdiction, venue or inconvenient forum in those courts.`,
          `Despite the above, Global Solutions Management LLC may seek injunctive relief, debt recovery, payment enforcement, intellectual property enforcement, confidentiality enforcement, security enforcement or urgent protective relief in any court or forum of competent jurisdiction.`,
        ],
      },
      {
        heading: "60. Optional Arbitration at Our Election",
        paragraphs: [
          `To the maximum extent permitted by law, Global Solutions Management LLC may elect to have any dispute, claim or controversy arising out of or relating to ${PLATFORM}, this Customer Agreement, Customer's account, Customer's Workspace, Customer Data, Generated Outputs, payment, suspension or termination resolved by confidential binding arbitration instead of court proceedings.`,
          `If arbitration is elected, the arbitration will take place in Delaware, in English, before a single arbitrator, under commercially reasonable arbitration rules selected by Global Solutions Management LLC, unless mandatory law requires otherwise.`,
          `Nothing in this section prevents Global Solutions Management LLC from seeking injunctive relief, debt recovery, enforcement of intellectual property rights, confidentiality protection, security protection or urgent protective relief in court.`,
        ],
      },
      {
        heading: "61. Class Action and Jury Trial Waiver",
        paragraphs: [
          `To the maximum extent permitted by law, Customer and Global Solutions Management LLC agree that disputes will be resolved only on an individual basis and not as part of any class, collective, consolidated, representative or group action.`,
          `To the maximum extent permitted by law, Customer and Global Solutions Management LLC waive any right to a jury trial in any dispute arising out of or relating to this Customer Agreement, ${PLATFORM}, any Plan, Credits, billing, Workspace access, suspension or termination.`,
        ],
      },
      {
        heading: "62. Limitation Period",
        paragraphs: [
          `To the maximum extent permitted by law, any claim arising out of or relating to this Customer Agreement, ${PLATFORM}, a Plan, Credits, billing, a Workspace, Generated Outputs, Customer Data, outreach activity, suspension or termination must be brought within one year after the event giving rise to the claim.`,
          `Claims brought after that period are permanently barred, unless a longer period is required by mandatory law.`,
        ],
      },
      {
        heading: "63. Assignment",
        paragraphs: [
          `Customer may not assign, transfer or delegate this Customer Agreement, Customer's account, Workspace, Plan, Credits or rights to use ${PLATFORM} without our prior written consent.`,
          `We may assign or transfer this Customer Agreement, accounts, customer relationships, data processing arrangements, billing relationships and platform operations in connection with a merger, acquisition, restructuring, financing, sale of assets, corporate reorganisation, transfer of business, change of control or platform migration.`,
        ],
      },
      {
        heading: "64. Notices",
        paragraphs: [
          `We may provide notices by posting on the website, posting in the platform, sending email to the account contact, sending billing notices, displaying checkout notices or using other reasonable communication methods.`,
          `Customer is responsible for keeping contact details current and monitoring notices.`,
          `Legal notices to Global Solutions Management LLC must be submitted through the Contact page using the route that matches the request, unless a separate signed written agreement specifies another notice method.`,
        ],
      },
      {
        heading: "65. Severability",
        paragraphs: [
          `If any provision of this Customer Agreement is held invalid, unlawful or unenforceable, the remaining provisions remain in full force.`,
          `The invalid provision will be interpreted, narrowed or replaced to achieve the original intent as closely as permitted by law.`,
        ],
      },
      {
        heading: "66. No Waiver",
        paragraphs: [
          `Failure to enforce any provision of this Customer Agreement is not a waiver of that provision or any other provision.`,
          `Any waiver must be in writing and expressly accepted by Global Solutions Management LLC.`,
        ],
      },
      {
        heading: "67. Entire Agreement",
        paragraphs: [
          `This Customer Agreement, the Platform Terms of Service and all incorporated documents form the entire agreement between Customer and Global Solutions Management LLC regarding paid access to and commercial use of ${PLATFORM}, unless a separate signed written agreement expressly states otherwise.`,
          `Customer acknowledges that it has not relied on any statement, representation, promise, assurance, forecast, projection, demo, example, output, estimate, support message or marketing statement not expressly included in this Customer Agreement, the Platform Terms of Service or a signed written agreement accepted by Global Solutions Management LLC.`,
        ],
      },
      {
        heading: "68. Interpretation",
        paragraphs: [
          `Headings are for convenience only and do not affect interpretation.`,
          `Words such as "including", "includes", "for example" and "without limitation" are illustrative and do not limit the words that follow.`,
          `References to law include amendments, replacements and successor laws.`,
          `References to Customer include Customer's users, employees, contractors, agents, agencies, clients and representatives where the context allows.`,
          `Any rule of interpretation that ambiguity is interpreted against the drafting party does not apply to this Customer Agreement.`,
        ],
      },
      {
        heading: "69. Survival",
        paragraphs: [
          `Any provision that by its nature should survive suspension, termination, expiry, cancellation, downgrade or account closure will survive, including provisions relating to payment obligations, taxes, Credits, refunds, chargebacks, ownership, Customer Data responsibility, confidentiality, prohibited use, privacy, data processing, disclaimers, limitation of liability, no personal liability, indemnity, dispute resolution, governing law, class action waiver, jury trial waiver, records retention and enforcement.`,
        ],
      },
      {
        heading: "70. Contact",
        paragraphs: [
          `For customer agreement, billing, subscription, Credit or contract questions, ${CONTACT_CTA}`,
          `Global Solutions Management LLC. Delaware, United States. Operator of ${PLATFORM}.`,
        ],
      },
    ],
  },
  "data-processing-agreement": {
    title: "Data Processing Agreement",
    effectiveDate: "30 June 2026",
    lastUpdated: "1 July 2026",
    version: "7.0",
    sections: [
      {
        heading: "1. Definitions",
        paragraphs: [
          "In this Data Processing Agreement:",
          "“DPA” means this Data Processing Agreement.",
          "“Velocity Vision”, “Platform”, “Service”, “we”, “us” or “our” means the Velocity Vision platform operated by Global Solutions Management LLC.",
          "“Global Solutions Management LLC” means Global Solutions Management LLC, a company incorporated in the State of Delaware, United States.",
          "“Customer”, “you” or “your” means the person, company, agency, organisation, partnership, charity, trust, public body, fund, brand, client, estate, project or other legal entity that uses Velocity Vision and determines the purposes and means of processing Customer Personal Data.",
          "“Customer Personal Data” means Personal Data that Customer uploads, imports, enters, provides, generates, activates, exports, processes or otherwise makes available through Velocity Vision and that Global Solutions Management LLC processes on behalf of Customer as Processor, Service Provider, Contractor or equivalent role.",
          "“Personal Data” means any information relating to an identified or identifiable individual, or any equivalent term under applicable Data Protection Laws.",
          "“Data Protection Laws” means all privacy, data protection, cybersecurity, electronic communications, direct marketing, AI-related and similar laws that apply to the processing of Customer Personal Data, including where applicable the GDPR, UK GDPR, Data Protection Act 2018, PECR, Swiss FADP, CCPA/CPRA, US state privacy laws, EU AI Act, ePrivacy rules and other applicable privacy, marketing, AI and data protection laws.",
          "“GDPR” means Regulation (EU) 2016/679.",
          "“UK GDPR” means the UK GDPR as incorporated into UK law.",
          "“CCPA” means the California Consumer Privacy Act as amended by the California Privacy Rights Act and applicable regulations.",
          "“Controller”, “Processor”, “Business”, “Service Provider”, “Contractor”, “Consumer”, “Data Subject”, “Process”, “Processing”, “Sell”, “Share”, “Sensitive Personal Information” and similar terms have the meanings given to them under applicable Data Protection Laws.",
          "“Subprocessor” means any third party engaged by Global Solutions Management LLC to process Customer Personal Data on behalf of Customer in connection with Velocity Vision.",
          "“Security Incident” means a confirmed breach of security leading to accidental or unlawful destruction, loss, alteration, unauthorised disclosure of or access to Customer Personal Data processed by Global Solutions Management LLC on behalf of Customer.",
          "“Restricted Data” means categories of Personal Data that are sensitive, regulated, high-risk or restricted under applicable law, contract, professional duty or platform policy.",
          "“AI Processing” means processing involving AI-assisted tools, AI models, AI infrastructure, AI prompts, AI-generated outputs, AI-assisted classification, AI-assisted review, AI-assisted generation, AI-assisted translation, AI-assisted segmentation or AI-supported workflow features.",
          "“Protected Parties” means Global Solutions Management LLC and its present and former owners, members, managers, directors, officers, employees, staff, contractors, consultants, agents, representatives, affiliates, licensors, suppliers, service providers, subprocessors, payment providers, infrastructure providers, AI providers, hosting providers, professional advisers, successors and assigns.",
        ],
      },
      {
        heading: "2. Purpose and Incorporation",
        paragraphs: [
          "This DPA applies when Global Solutions Management LLC processes Customer Personal Data on behalf of Customer in the course of providing Velocity Vision.",
          "For Customer Personal Data, Customer is the Controller, Business or equivalent determining party, and Global Solutions Management LLC is the Processor, Service Provider, Contractor or equivalent processing party, except where Global Solutions Management LLC processes Personal Data for its own purposes as described in the Privacy Policy.",
          "This DPA is incorporated into and forms part of the agreement between Customer and Global Solutions Management LLC.",
          "If there is a conflict between this DPA and the Platform Terms of Service or Customer Agreement, this DPA controls only for the specific processing of Customer Personal Data. The Platform Terms of Service and Customer Agreement continue to control platform use, billing, credits, intellectual property, acceptable use, suspension, disclaimers, limitation of liability, indemnity, no personal liability, governing law and enforcement, unless expressly overridden by this DPA.",
          "This DPA does not create direct contractual rights for Customer’s data subjects, recipients, prospects, clients, agency clients or other third parties unless mandatory law requires otherwise.",
        ],
      },
      {
        heading: "3. Delaware Operator and No Personal Liability",
        paragraphs: [
          "Velocity Vision is operated by Global Solutions Management LLC, a Delaware limited liability company.",
          "To the maximum extent permitted by law, Customer agrees that any claim relating to this DPA, Customer Personal Data, processing, security, transfers, subprocessors, AI Processing, deletion, audits, regulatory assistance, data subject requests or Security Incidents will be brought only against Global Solutions Management LLC and not personally against any owner, member, manager, director, officer, employee, staff member, contractor, consultant, agent, representative, affiliate, licensor, supplier, service provider, Subprocessor, payment provider, infrastructure provider, AI provider, hosting provider or professional adviser.",
          "The Protected Parties are intended third-party beneficiaries of all disclaimers, limitations of liability, indemnities, no-personal-liability provisions, defence rights, confidentiality protections, audit restrictions, legal request protections and enforcement rights in this DPA and may rely on and enforce those protections to the maximum extent permitted by law.",
          "Nothing in this DPA excludes liability where liability cannot lawfully be excluded.",
        ],
      },
      {
        heading: "4. Independent Controller Processing",
        paragraphs: [
          "Global Solutions Management LLC may process certain Personal Data as an independent Controller, Business or equivalent role for its own legitimate business purposes, including:",
          "Such processing is governed by the Privacy Policy and not by this DPA, except where Data Protection Laws require otherwise.",
        ],
        bullets: [
          "account administration;",
          "billing;",
          "payment processing;",
          "tax records;",
          "fraud prevention;",
          "platform security;",
          "abuse prevention;",
          "sanctions screening;",
          "legal compliance;",
          "support operations;",
          "service communications;",
          "product analytics;",
          "business operations;",
          "corporate records;",
          "dispute handling;",
          "enforcing legal rights.",
        ],
      },
      {
        heading: "5. Processing Details",
        paragraphs: [
          "The subject matter of processing is the provision, operation, maintenance, security and support of Velocity Vision as a self-serve, AI-powered commercial workspace.",
          "The duration of processing is the period during which Customer maintains an account, workspace, subscription, plan, trial, paid feature or other access to Velocity Vision, plus any period required for deletion, backup expiry, legal retention, tax retention, dispute handling, security, fraud prevention, compliance or enforcement.",
          "The nature and purpose of processing is to provide Velocity Vision, including to:",
        ],
        bullets: [
          "host Customer Personal Data;",
          "store Customer Personal Data;",
          "receive uploads, imports and entries;",
          "map fields;",
          "validate fields;",
          "deduplicate records;",
          "quality-check data;",
          "segment records;",
          "generate AI-assisted outputs;",
          "prepare outreach assets;",
          "support templates;",
          "support activation controls;",
          "schedule or route workflow actions;",
          "organise replies;",
          "support follow-up;",
          "support pipeline tracking;",
          "provide reporting;",
          "provide exports;",
          "secure the platform;",
          "monitor abuse;",
          "troubleshoot issues;",
          "support users;",
          "maintain billing and usage records;",
          "operate integrations;",
          "process support requests;",
          "comply with legal obligations.",
        ],
      },
      {
        heading: "6. Types of Personal Data",
        paragraphs: [
          "Customer Personal Data may include:",
          "Customer controls what Customer Personal Data is uploaded, imported, processed, generated, activated or exported through Velocity Vision.",
        ],
        bullets: [
          "names;",
          "email addresses;",
          "telephone numbers;",
          "company names;",
          "job titles;",
          "business contact details;",
          "professional profiles;",
          "location;",
          "country;",
          "region;",
          "language preference;",
          "tags;",
          "notes;",
          "source information;",
          "relationship history;",
          "reply data;",
          "pipeline data;",
          "customer status;",
          "prospect status;",
          "sender information;",
          "campaign information;",
          "suppression status;",
          "opt-out information;",
          "business records;",
          "agency client contact data;",
          "other fields uploaded, imported, generated or configured by Customer.",
        ],
      },
      {
        heading: "7. Categories of Data Subjects",
        paragraphs: [
          "Categories of data subjects may include:",
          "Customer is responsible for ensuring that the categories of data subjects processed through Velocity Vision are lawful and appropriate for the intended use.",
        ],
        bullets: [
          "prospects;",
          "customers;",
          "business contacts;",
          "employees of organisations;",
          "officers of organisations;",
          "contractors;",
          "suppliers;",
          "agency client contacts;",
          "professional contacts;",
          "recipients;",
          "senders;",
          "Customer users;",
          "client users;",
          "other individuals whose data Customer chooses to process through Velocity Vision.",
        ],
      },
      {
        heading: "8. Prohibited and Restricted Data",
        paragraphs: [
          "Customer must not upload, import, process, generate, activate, export or store through Velocity Vision:",
          "Restricted Data may only be processed if expressly authorised in a separate signed written agreement accepted by Global Solutions Management LLC and if Customer has all required legal rights, notices, consents, lawful bases, approvals and safeguards.",
          "We may suspend, restrict, delete, quarantine, return, block, refuse or report processing of data that we reasonably believe is prohibited, restricted, unlawful, unsafe, non-compliant or unsuitable for Velocity Vision.",
        ],
        bullets: [
          "children’s data;",
          "health data;",
          "biometric data;",
          "genetic data;",
          "criminal offence data;",
          "financial account data;",
          "payment card data;",
          "government identifier data;",
          "precise geolocation data;",
          "special category data under GDPR or UK GDPR;",
          "sensitive personal information under CCPA or similar laws;",
          "data subject to professional secrecy or privilege unless Customer is authorised to process it;",
          "data subject to confidentiality obligations that prohibit SaaS processing;",
          "data subject to contractual restrictions that prohibit SaaS processing;",
          "data subject to sector-specific restrictions that prohibit the intended processing;",
          "data unlawfully obtained;",
          "data collected without required notices, consents, permissions or lawful basis;",
          "data that cannot lawfully be transferred to, accessed from or processed by Global Solutions Management LLC or its Subprocessors.",
        ],
      },
      {
        heading: "9. Customer Instructions",
        paragraphs: [
          "Global Solutions Management LLC will process Customer Personal Data only on documented Customer instructions, including instructions given through:",
          "Customer instructs Global Solutions Management LLC to process Customer Personal Data as necessary to provide, secure, support, maintain, improve and operate Velocity Vision in accordance with this DPA, the Platform Terms of Service, the Customer Agreement, the Privacy Policy and applicable product documentation.",
          "We may refuse, suspend, delay or decline any instruction if we reasonably believe it is unlawful, unsafe, technically impractical, outside the platform scope, contrary to Data Protection Laws, contrary to this DPA, contrary to platform policies, harmful to the platform or likely to expose Global Solutions Management LLC, any Protected Party, Customer, data subjects, recipients, third-party providers or other customers to risk.",
          "We will inform Customer if we believe an instruction infringes Data Protection Laws, unless legally prohibited from doing so.",
          "Customer is solely responsible for the legality, accuracy, completeness and appropriateness of its instructions.",
        ],
        bullets: [
          "platform configuration;",
          "uploads;",
          "imports;",
          "field mapping;",
          "settings;",
          "API calls;",
          "integrations;",
          "activation actions;",
          "generation actions;",
          "export actions;",
          "deletion actions;",
          "support requests;",
          "written communications;",
          "use of specific features.",
        ],
      },
      {
        heading: "10. Customer Obligations",
        paragraphs: [
          "Customer is responsible for:",
          "Customer represents and warrants that:",
          "Customer must not use Velocity Vision to avoid, bypass, conceal or frustrate privacy rights, marketing rights, opt-out rights, data subject rights, platform rules or legal restrictions.",
        ],
        bullets: [
          "lawfulness of Customer Personal Data;",
          "accuracy of Customer Personal Data;",
          "quality of Customer Personal Data;",
          "source of Customer Personal Data;",
          "notices to data subjects;",
          "consent records where required;",
          "legitimate interest assessments where required;",
          "suppression lists;",
          "opt-out records;",
          "privacy policies;",
          "data subject response processes;",
          "outreach law compliance;",
          "cross-border transfer assessment;",
          "AI deployment compliance;",
          "client authority;",
          "agency client instructions;",
          "user permissions;",
          "internal approvals;",
          "regulated-sector obligations;",
          "determining whether use of Velocity Vision is lawful in each relevant jurisdiction.",
          "it has all rights, permissions, notices, consents, lawful bases and authorisations required to process Customer Personal Data through Velocity Vision;",
          "its instructions comply with Data Protection Laws;",
          "it will not upload or process prohibited or restricted data unless expressly authorised in writing;",
          "it will not use Velocity Vision for unlawful outreach, unlawful profiling, unlawful automated decision-making, unlawful AI deployment or unlawful marketing;",
          "it will respond to data subject requests unless applicable law requires Global Solutions Management LLC to respond directly.",
        ],
      },
      {
        heading: "11. Processor Obligations",
        paragraphs: [
          "Global Solutions Management LLC will:",
          "Global Solutions Management LLC does not determine the purposes of Customer outreach, Customer marketing, Customer recipient selection, Customer lawful basis, Customer AI deployment, Customer client instructions or Customer activation decisions.",
        ],
        bullets: [
          "process Customer Personal Data only in accordance with documented Customer instructions;",
          "ensure persons authorised to process Customer Personal Data are subject to confidentiality obligations;",
          "implement appropriate technical and organisational measures;",
          "assist Customer with data subject requests where reasonably possible and required by Data Protection Laws;",
          "assist Customer with security, breach, DPIA and regulatory obligations where reasonably possible and required by Data Protection Laws;",
          "use Subprocessors in accordance with this DPA;",
          "provide reasonable information to demonstrate compliance with this DPA;",
          "delete or return Customer Personal Data in accordance with this DPA;",
          "notify Customer of confirmed Security Incidents in accordance with this DPA.",
        ],
      },
      {
        heading: "12. Service Provider and Contractor Terms for US Privacy Laws",
        paragraphs: [
          "Where CCPA, CPRA or similar US state privacy laws apply, Global Solutions Management LLC acts as a Service Provider, Contractor or equivalent role for Customer Personal Data processed on behalf of Customer.",
          "Global Solutions Management LLC will not:",
          "Global Solutions Management LLC will provide the same level of privacy protection required of Service Providers or Contractors under applicable US state privacy laws to the extent those laws apply to Global Solutions Management LLC.",
          "Customer grants Global Solutions Management LLC the right to take reasonable and appropriate steps to ensure Customer Personal Data is processed consistently with Customer’s obligations under applicable privacy laws.",
          "Customer may take reasonable and appropriate steps to stop and remediate unauthorised use of Customer Personal Data, subject to the audit and information limits in this DPA.",
        ],
        bullets: [
          "sell Customer Personal Data;",
          "share Customer Personal Data for cross-context behavioural advertising;",
          "retain, use or disclose Customer Personal Data for any purpose other than the business purposes specified in this DPA or otherwise permitted by applicable law;",
          "retain, use or disclose Customer Personal Data for a commercial purpose other than the business purposes specified in this DPA or otherwise permitted by applicable law;",
          "retain, use or disclose Customer Personal Data outside the direct business relationship between Customer and Global Solutions Management LLC, except as permitted by applicable law;",
          "combine Customer Personal Data with Personal Data received from another source except as permitted by applicable law, including where necessary to detect security incidents, prevent fraud, debug, provide the Service, improve the Service, or perform permitted internal business purposes.",
        ],
      },
      {
        heading: "13. AI Processing",
        paragraphs: [
          "Velocity Vision may use AI-assisted tools and AI Subprocessors to provide features such as data quality review, segmentation support, template generation, outreach pack generation, summaries, follow-up suggestions, translations, multilingual variants, campaign assets, reports, prompt handling and workflow support.",
          "Customer instructs Global Solutions Management LLC to process Customer Personal Data through AI-assisted features when Customer uses, enables or configures those features.",
          "Customer is responsible for:",
          "Global Solutions Management LLC will not use Customer Personal Data to train a publicly available foundation model or general-purpose AI model except where Customer expressly authorises that use or where the data has been aggregated, anonymised or de-identified in accordance with applicable law so that it no longer identifies Customer or data subjects.",
          "AI-generated outputs may contain Personal Data if Customer’s inputs contain Personal Data or if Customer instructs the platform to generate outputs using Personal Data. Customer remains responsible for reviewing, approving, lawfully using and lawfully retaining those outputs.",
        ],
        bullets: [
          "deciding whether Customer Personal Data may lawfully be processed by AI-assisted tools;",
          "deciding whether AI-assisted features are appropriate for the intended purpose;",
          "providing notices where required;",
          "obtaining consent where required;",
          "conducting data protection impact assessments where required;",
          "conducting AI impact assessments where required;",
          "assessing high-risk AI restrictions where required;",
          "assessing automated decision-making restrictions where required;",
          "reviewing AI-generated outputs;",
          "approving outputs before use;",
          "ensuring human oversight;",
          "ensuring compliance with AI, privacy, marketing, consumer protection and sector-specific laws.",
        ],
      },
      {
        heading: "14. AI Legal Role Allocation",
        paragraphs: [
          "Customer is responsible for determining whether its use of Velocity Vision makes Customer a deployer, user, provider, distributor, importer, operator, controller, business, employer, regulated entity or other legal role under applicable AI, privacy, marketing, consumer protection, employment, professional or sector-specific laws.",
          "Velocity Vision provides AI-assisted software tools and workflow support. Unless expressly agreed in writing, Global Solutions Management LLC does not assume Customer’s legal role, regulated status, professional obligations, deployment obligations, customer-facing obligations, human oversight obligations, impact assessment obligations, transparency obligations, risk management obligations, monitoring obligations or recordkeeping obligations.",
          "Customer must not use Velocity Vision in any way that would make Global Solutions Management LLC responsible for Customer’s regulated AI system, high-risk AI deployment, automated decision system, profiling activity, employment decision, credit decision, housing decision, education decision, insurance decision, medical decision, legal decision or other regulated decision.",
          "Customer is responsible for human oversight, review, approval, transparency notices, end-user disclosures, logs, monitoring, impact assessments and compliance records where required by applicable AI, privacy, employment, consumer protection, sector-specific or professional laws.",
        ],
      },
      {
        heading: "15. Automated Decision-Making, Profiling and High-Risk AI",
        paragraphs: [
          "Customer must not use Velocity Vision for legally significant automated decision-making, profiling, eligibility decisions, employment decisions, credit decisions, housing decisions, education access decisions, insurance decisions, healthcare decisions, criminal justice decisions, biometric identification, vulnerable-person targeting or other high-risk AI uses unless expressly authorised in a separate signed written agreement accepted by Global Solutions Management LLC.",
          "Customer remains solely responsible for determining whether its use of Customer Personal Data, AI-assisted features, Generated Outputs, segmentation, scoring, quality review or activation creates profiling, automated decision-making, high-risk AI use, regulated AI use or other legally restricted activity.",
          "We may suspend, restrict or refuse any AI Processing that we reasonably believe creates legal, regulatory, ethical, reputational, security, operational or data protection risk.",
        ],
      },
      {
        heading: "16. De-Identified and Aggregated Data",
        paragraphs: [
          "Global Solutions Management LLC may process aggregated, anonymised or de-identified data to maintain, secure, analyse, improve and develop Velocity Vision, provided the data does not identify Customer or data subjects.",
          "Where Data Protection Laws apply to de-identified data, Global Solutions Management LLC will take reasonable measures to ensure the data cannot reasonably be used to infer information about, or otherwise be linked to, a particular individual, will publicly commit where required to maintain and use the data in de-identified form, and will not attempt to re-identify the data except as permitted by law for testing the effectiveness of de-identification safeguards.",
          "Aggregated, anonymised and de-identified data is not Customer Personal Data where it no longer identifies or reasonably relates to an identifiable individual.",
        ],
      },
      {
        heading: "17. Confidentiality and Access Controls",
        paragraphs: [
          "Global Solutions Management LLC will ensure that personnel authorised to process Customer Personal Data are subject to confidentiality obligations.",
          "Access to Customer Personal Data will be limited to personnel, contractors and Subprocessors who need access for platform operation, support, security, billing, legal compliance, incident response, troubleshooting, maintenance or other permitted purposes.",
          "Customer is responsible for controlling access by its own users, employees, contractors, clients, agency users, administrators and invited users.",
        ],
      },
      {
        heading: "18. Technical and Organisational Measures",
        paragraphs: [
          "Global Solutions Management LLC will maintain technical and organisational measures appropriate to the nature, scope, context and risk of the processing.",
          "Measures may include, as appropriate:",
          "Customer acknowledges that no internet service, SaaS platform, AI service, email integration, hosting provider or cloud environment is completely secure, error-free or immune from attack.",
          "Customer is responsible for:",
        ],
        bullets: [
          "encrypted transmission;",
          "hosted access controls;",
          "role-based permissions;",
          "authentication controls;",
          "administrative access restrictions;",
          "logging;",
          "monitoring;",
          "backups;",
          "vulnerability management;",
          "malware protection;",
          "environment separation;",
          "provider access controls;",
          "operational procedures;",
          "incident response procedures;",
          "confidentiality obligations;",
          "subprocessor controls;",
          "security review of key providers;",
          "reasonable data minimisation within platform operations;",
          "availability and resilience measures appropriate to the Service.",
          "using strong credentials;",
          "managing user permissions;",
          "restricting workspace access;",
          "protecting connected email accounts;",
          "protecting third-party integrations;",
          "securing devices;",
          "securing exports;",
          "training users;",
          "maintaining internal policies;",
          "promptly reporting suspected compromise;",
          "keeping independent copies of important records.",
        ],
      },
      {
        heading: "19. Security Measures Schedule",
        paragraphs: [
          "The security measures under this DPA are designed for the Velocity Vision platform and may evolve over time.",
          "Customer acknowledges that specific security controls may depend on the hosting environment, third-party providers, plan, feature set, integration, account configuration, product maturity, operational needs and risk profile.",
          "Global Solutions Management LLC may update security measures provided the overall level of security is not materially reduced in a way that creates unreasonable risk to Customer Personal Data.",
          "Security measures do not create any guarantee that Customer Personal Data will be immune from every security threat, vulnerability, attack, unauthorised access or incident.",
        ],
      },
      {
        heading: "20. Subprocessors",
        paragraphs: [
          "Customer gives Global Solutions Management LLC general authorisation to appoint Subprocessors to provide Velocity Vision.",
          "Subprocessors may be used for:",
          "Global Solutions Management LLC will impose data protection obligations on Subprocessors that are materially consistent with this DPA and appropriate to the nature of the services provided.",
          "Global Solutions Management LLC remains responsible for Subprocessors’ processing of Customer Personal Data to the extent required by applicable Data Protection Laws and subject to the limitations of liability in the Platform Terms of Service, Customer Agreement and this DPA.",
        ],
        bullets: [
          "hosting;",
          "cloud infrastructure;",
          "data storage;",
          "authentication;",
          "payments;",
          "analytics;",
          "monitoring;",
          "logging;",
          "security;",
          "communications;",
          "support;",
          "email connectivity;",
          "AI Processing;",
          "translation;",
          "CRM tools;",
          "domain services;",
          "backup;",
          "incident response;",
          "platform operations;",
          "other infrastructure and operational services.",
        ],
      },
      {
        heading: "21. Subprocessor Information and Objections",
        paragraphs: [
          "Where legally required, Customer may request current Subprocessor information through the Contact page or applicable Subprocessor information page if made available.",
          "Global Solutions Management LLC may add, replace or remove Subprocessors from time to time.",
          "Where legally required, Global Solutions Management LLC will provide notice of new Subprocessors by posting an updated Subprocessor list, platform notice, email notice or other reasonable method.",
          "If Customer reasonably objects to a new Subprocessor on data protection grounds, Customer must notify Global Solutions Management LLC within the stated notice period, or if no period is stated, within 15 days after notice.",
          "Customer’s sole remedy if an objection cannot reasonably be resolved is to stop using the affected feature or terminate the affected Service in accordance with the Customer Agreement. Objection to a Subprocessor does not create a refund right unless expressly required by law.",
        ],
      },
      {
        heading: "22. Machine Translation",
        paragraphs: [
          "The platform may display public legal pages, interface text or rendered page text using automated machine-translation technology, including GTranslate, Google Translate or similar services.",
          "Machine translation is provided for convenience only. The English version controls.",
          "Machine translation is not intended to translate Customer Personal Data for storage in the platform database unless a specific translation feature is made available and Customer chooses to use it.",
          "Where a translation feature processes Customer Personal Data, that processing is subject to this DPA and applicable Subprocessor terms.",
          "Customer must not rely on machine translation as legal, compliance, regulatory or professional translation.",
        ],
      },
      {
        heading: "23. International Transfers",
        paragraphs: [
          "Customer Personal Data may be processed in the United States, United Kingdom, European Economic Area and other jurisdictions where Global Solutions Management LLC or its Subprocessors operate.",
          "Customer authorises Global Solutions Management LLC and its Subprocessors to process Customer Personal Data in these jurisdictions as necessary to provide Velocity Vision.",
          "Customer is responsible for ensuring that Customer Personal Data may lawfully be transferred to, accessed from, processed in and stored in all relevant jurisdictions.",
          "Where Data Protection Laws require a transfer mechanism, transfers may rely on one or more of the following, as applicable:",
        ],
        bullets: [
          "adequacy decisions;",
          "the European Commission’s standard contractual clauses;",
          "the UK International Data Transfer Addendum;",
          "the UK International Data Transfer Agreement;",
          "Swiss transfer mechanisms;",
          "data privacy frameworks;",
          "approved certification mechanisms;",
          "binding corporate rules;",
          "derogations;",
          "other lawful transfer mechanisms.",
        ],
      },
      {
        heading: "24. Standard Contractual Clauses",
        paragraphs: [
          "Where Customer Personal Data subject to GDPR is transferred to Global Solutions Management LLC or a Subprocessor in a country that does not provide adequate protection, the applicable European Commission standard contractual clauses are incorporated by reference and apply as required by Data Protection Laws.",
          "For transfers from Customer as Controller to Global Solutions Management LLC as Processor, Module Two applies.",
          "For transfers from Customer as Processor to Global Solutions Management LLC as Subprocessor, Module Three applies.",
          "For onward transfers to Subprocessors, Global Solutions Management LLC will use an appropriate lawful transfer mechanism where required.",
          "The details of processing in this DPA form the relevant annexes to the standard contractual clauses to the extent applicable.",
          "If there is a conflict between this DPA and the standard contractual clauses, the standard contractual clauses control only to the extent necessary for the relevant restricted transfer.",
        ],
      },
      {
        heading: "25. UK and Swiss Transfers",
        paragraphs: [
          "Where Customer Personal Data subject to UK GDPR is transferred to Global Solutions Management LLC or a Subprocessor in a country that does not provide adequate protection, the applicable UK transfer mechanism, including the UK International Data Transfer Addendum or UK International Data Transfer Agreement, is incorporated by reference where required.",
          "Where Customer Personal Data subject to Swiss data protection law is transferred to Global Solutions Management LLC or a Subprocessor in a country that does not provide adequate protection, the applicable transfer mechanism will be interpreted to cover Swiss requirements where required.",
          "Customer is responsible for determining whether transfer impact assessments, supplementary measures, notices or additional safeguards are required for Customer’s use case.",
        ],
      },
      {
        heading: "26. Transfer Impact Assessments",
        paragraphs: [
          "Taking into account the nature of processing and information available to Global Solutions Management LLC, we will provide reasonable information to assist Customer with transfer impact assessments where required by Data Protection Laws.",
          "Assistance outside standard documentation, security information, Subprocessor information or platform functionality may be charged at reasonable rates.",
          "Customer remains responsible for determining whether transfers are lawful for its Customer Personal Data, data subjects, industry, jurisdiction and use case.",
        ],
      },
      {
        heading: "27. Data Privacy Framework",
        paragraphs: [
          "If Global Solutions Management LLC or a relevant Subprocessor is certified under an applicable data privacy framework, including the EU-U.S. Data Privacy Framework, UK Extension or Swiss-U.S. Data Privacy Framework, transfers may rely on that framework where legally available.",
          "If a data privacy framework is invalidated, suspended, unavailable or no longer applicable, transfers may rely on standard contractual clauses, UK transfer mechanisms, Swiss transfer mechanisms or another lawful transfer mechanism.",
          "Nothing in this DPA requires Global Solutions Management LLC to maintain certification under any data privacy framework unless expressly agreed in writing.",
        ],
      },
      {
        heading: "28. Data Subject Requests",
        paragraphs: [
          "Taking into account the nature of processing and information available to Global Solutions Management LLC, we will provide reasonable assistance to Customer for data subject access, deletion, correction, portability, objection, restriction, opt-out, consent withdrawal and similar rights requests where required by Data Protection Laws.",
          "Where available, Customer should use platform tools to search, access, export, correct or delete Customer Personal Data.",
          "If Global Solutions Management LLC receives a request directly from a data subject relating to Customer Personal Data, we may redirect the request to Customer unless legally required to respond directly.",
          "Customer is responsible for verifying the identity and authority of requesters, determining whether a request is valid, determining applicable exemptions and responding within legally required timeframes.",
          "Assistance outside standard platform functionality may be charged at reasonable rates.",
        ],
      },
      {
        heading: "29. Regulatory Assistance and DPIAs",
        paragraphs: [
          "Taking into account the nature of processing and information available to Global Solutions Management LLC, we will provide reasonable assistance to Customer where required by Data Protection Laws for:",
          "Customer remains responsible for determining whether a DPIA, AI impact assessment, legitimate interest assessment, transfer impact assessment, prior consultation, regulatory notice or other compliance step is required.",
          "Assistance outside standard documentation or platform functionality may be charged at reasonable rates.",
        ],
        bullets: [
          "data protection impact assessments;",
          "AI impact assessments;",
          "legitimate interest assessments;",
          "prior consultations with regulators;",
          "security assessments;",
          "breach assessments;",
          "records of processing;",
          "regulatory enquiries;",
          "processor compliance information.",
        ],
      },
      {
        heading: "30. Legal, Regulatory and Third-Party Requests",
        paragraphs: [
          "If Global Solutions Management LLC receives a subpoena, court order, regulator request, law enforcement request, data subject request, rights-holder complaint, payment-provider request, email-provider request, AI-provider request, third-party platform request, security complaint or legal notice relating to Customer Personal Data, Customer’s users, Customer’s outreach, Customer’s clients or Customer’s workspace, we may respond, disclose information, preserve records, restrict access, notify Customer or take other action as we consider legally required or reasonably appropriate.",
          "Where legally permitted and commercially reasonable, we may notify Customer of such requests.",
          "We are not required to challenge any legal, regulatory, payment-provider, email-provider, AI-provider or third-party request unless required by law or expressly agreed in writing.",
          "Customer is responsible for costs, losses, fees, penalties, legal fees and operational burden arising from requests, complaints, investigations or claims caused by Customer Personal Data, Customer outreach, Customer instructions, Customer users, Customer clients, Customer integrations or Customer’s use of Velocity Vision.",
        ],
      },
      {
        heading: "31. Security Incidents",
        paragraphs: [
          "Global Solutions Management LLC will notify affected Customers without undue delay after becoming aware of a confirmed Security Incident affecting Customer Personal Data.",
          "Notification may include, where available:",
          "Notification of a Security Incident is not an admission of fault, liability, unlawful conduct or breach of this DPA.",
          "Customer remains responsible for determining whether regulator, data subject, client, recipient, contractual or other notifications are required, unless applicable law requires Global Solutions Management LLC to notify directly.",
          "Customer must notify Global Solutions Management LLC promptly of any suspected or actual compromise involving Customer’s account, users, credentials, devices, exports, connected email accounts, integrations or Customer-side systems.",
        ],
        bullets: [
          "the nature of the Security Incident;",
          "categories of affected data;",
          "approximate number of affected data subjects or records, where known;",
          "likely consequences, where known;",
          "mitigation steps taken or proposed;",
          "recommended Customer actions;",
          "contact route for follow-up.",
        ],
      },
      {
        heading: "32. Security Incident Exclusions",
        paragraphs: [
          "The following are not Security Incidents caused by Global Solutions Management LLC unless directly caused by our breach of this DPA:",
          "Customer remains responsible for incidents arising from Customer-side systems, users, instructions, exports, integrations, sender accounts and data handling.",
        ],
        bullets: [
          "Customer-side credential compromise;",
          "weak passwords;",
          "shared accounts;",
          "unauthorised internal users;",
          "compromised Customer devices;",
          "compromised Customer email accounts;",
          "compromised Customer integrations;",
          "unsafe exports;",
          "Customer-side malware;",
          "Customer misconfiguration;",
          "Customer disclosure;",
          "Customer user error;",
          "agency client misuse;",
          "third-party provider incidents outside our reasonable control;",
          "events caused by Customer instructions.",
        ],
      },
      {
        heading: "33. Return, Deletion and Retention",
        paragraphs: [
          "During the account term, Customer may export or delete certain Customer Personal Data through available platform tools, subject to plan limits, technical limits, security checks, payment status and policy compliance.",
          "After termination, verified deletion request or expiry of the account, Global Solutions Management LLC will delete or return Customer Personal Data within a reasonable period unless retention is required or permitted for:",
          "Backups, logs and archival copies may persist for a limited period before ordinary deletion cycles complete.",
          "Global Solutions Management LLC is not required to delete records that it is legally required or reasonably permitted to retain, provided such retained records are protected in accordance with this DPA and applicable law.",
        ],
        bullets: [
          "legal compliance;",
          "tax;",
          "audit;",
          "security;",
          "billing;",
          "dispute handling;",
          "fraud prevention;",
          "abuse prevention;",
          "sanctions compliance;",
          "regulatory compliance;",
          "backup integrity;",
          "platform integrity;",
          "enforcement;",
          "legitimate business records.",
        ],
      },
      {
        heading: "34. Audit and Information Rights",
        paragraphs: [
          "Global Solutions Management LLC will make available reasonable information necessary to demonstrate compliance with this DPA where required by Data Protection Laws.",
          "Customer must first rely on available documentation, policies, security summaries, Subprocessor information, certifications, audit summaries or written responses.",
          "On-site audits are available only where legally required and only after:",
          "Audits must be limited to once per calendar year unless a confirmed Security Incident affecting Customer Personal Data requires additional audit rights under mandatory law.",
          "Customer may not use audits to access other customers’ data, platform source code, security-sensitive information, confidential information, trade secrets, privileged materials or information that would increase security risk.",
          "We may refuse or limit audit requests that are excessive, abusive, commercially unreasonable, legally privileged, security-sensitive, duplicative, unrelated to Customer Personal Data or not required by Data Protection Laws.",
        ],
        bullets: [
          "reasonable written notice;",
          "a written audit scope;",
          "confidentiality undertakings;",
          "security restrictions;",
          "confirmation that the audit will not compromise other customers, systems, security, confidentiality, trade secrets or platform operations;",
          "reimbursement of reasonable costs;",
          "scheduling during normal business hours.",
        ],
      },
      {
        heading: "35. Records and Logs",
        paragraphs: [
          "Global Solutions Management LLC may maintain platform logs, security logs, access logs, billing logs, usage logs, system logs, audit records and support records for security, operations, fraud prevention, billing, legal compliance, dispute handling, enforcement and platform integrity.",
          "Customer acknowledges that logs may contain limited Personal Data.",
          "Logs are retained for periods determined by operational, legal, security, billing and compliance needs.",
          "Customer is responsible for maintaining its own compliance records, consent records, lawful basis records, suppression records, outreach records, AI deployment records and transfer records.",
        ],
      },
      {
        heading: "36. Agency and Client Workspaces",
        paragraphs: [
          "Where Customer operates as an agency, consultant, reseller, service provider or intermediary for its own clients, Customer remains responsible for:",
          "Global Solutions Management LLC does not contract directly with Customer’s end clients unless expressly agreed in writing.",
          "Customer must ensure that its end clients and client users comply with this DPA, the Platform Terms of Service, Customer Agreement and applicable Data Protection Laws.",
          "Customer indemnifies the Protected Parties for claims arising from agency client data, client instructions, client workspaces, client outreach, client AI deployment or end-client disputes.",
        ],
        bullets: [
          "client authority;",
          "client instructions;",
          "client data;",
          "client privacy notices;",
          "client lawful basis;",
          "client consents;",
          "client suppression lists;",
          "client opt-outs;",
          "client data subject requests;",
          "client outreach compliance;",
          "client AI deployment compliance;",
          "client transfer compliance;",
          "end-client disputes.",
        ],
      },
      {
        heading: "37. Cross-Border and Global Compliance",
        paragraphs: [
          "Velocity Vision may be accessed globally, but not all data types, outreach activities, AI features, transfers, storage locations, integrations or use cases are lawful in every jurisdiction.",
          "Customer is responsible for determining whether use of Velocity Vision is lawful in every country, state, province, territory, sector and recipient location relevant to Customer, Customer Personal Data, Customer users, Customer clients, data subjects, recipients and campaigns.",
          "Customer must not use Velocity Vision where doing so would breach local privacy, marketing, AI, data localisation, secrecy, export control, sanctions, sector-specific or professional rules.",
          "We may restrict, suspend or refuse processing where we reasonably believe there is legal, regulatory, sanctions, security, payment, operational, reputational or third-party provider risk.",
        ],
      },
      {
        heading: "38. Sanctions, Export Control and Restricted Jurisdictions",
        paragraphs: [
          "Customer must not upload, process, transfer, export or make available Customer Personal Data through Velocity Vision in violation of applicable sanctions, export control, trade control, anti-bribery, anti-corruption or anti-money laundering laws.",
          "Customer represents and warrants that neither Customer nor its users are prohibited from using Velocity Vision under applicable sanctions, export control or trade laws.",
          "We may restrict, suspend, delete, block, refuse or terminate processing where sanctions, export control, trade compliance, payment or jurisdictional risk is identified or suspected.",
        ],
      },
      {
        heading: "39. Monitoring and Enforcement",
        paragraphs: [
          "We may, but are not required to, monitor, scan, log, review, analyse, investigate, preserve or restrict accounts, workspaces, Customer Personal Data, Generated Outputs, usage patterns, sender connections, integrations, activation activity, exports, billing activity and platform signals to operate the platform, improve safety, prevent abuse, enforce this DPA, comply with law, respond to complaints, protect infrastructure, protect recipients, protect third-party providers and protect our business.",
          "No monitoring, review, automated check, manual check, warning, flag, hold, approval flow or failure to act creates any responsibility for Customer’s data, outputs, campaigns, compliance, outreach or legal obligations.",
          "We may use automated systems, human review, third-party tools and risk scoring to identify suspected abuse, fraud, unlawful activity, security risk, policy breach or platform risk.",
        ],
      },
      {
        heading: "40. Takedown, Quarantine and Refusal",
        paragraphs: [
          "We may remove, disable, restrict, quarantine, return, delete or block any Customer Personal Data, Generated Output, file, campaign, message, sender connection, integration, export or workspace content that we reasonably believe may violate law, infringe rights, create risk, breach this DPA, expose the platform to liability or harm third parties.",
          "We are not liable for loss arising from removal, blocking, disabling, quarantine, moderation, restriction or refusal of content, outputs, campaigns or data where we act to protect the platform, users, recipients, third-party providers, rights holders, regulators, data subjects or our business.",
        ],
      },
      {
        heading: "41. Liability",
        paragraphs: [
          "Liability under this DPA is subject to the limitations, exclusions and caps in the Platform Terms of Service and Customer Agreement, except to the extent those limitations are prohibited by applicable Data Protection Laws.",
          "To the maximum extent permitted by law, the total aggregate liability of the Protected Parties arising out of or relating to this DPA is included within and does not increase the total aggregate liability cap under the Platform Terms of Service and Customer Agreement.",
          "Nothing in this DPA excludes or limits liability where liability cannot lawfully be excluded or limited.",
        ],
      },
      {
        heading: "42. Indemnity",
        paragraphs: [
          "Customer agrees to defend, indemnify and hold harmless the Protected Parties from and against all claims, demands, investigations, complaints, proceedings, losses, liabilities, damages, penalties, fines, settlements, costs and expenses, including reasonable legal fees, arising from or related to:",
          "We may control the defence of any matter subject to indemnity. Customer must cooperate with us and must not settle any claim in a way that imposes obligations, admissions, restrictions or liability on any Protected Party without prior written consent.",
          "Customer’s indemnity obligations apply to the maximum extent permitted by law, including where claims are brought by customers, end clients, recipients, users, regulators, authorities, payment providers, email providers, AI providers, data subjects, rights holders, competitors or third-party platforms.",
        ],
        bullets: [
          "Customer Personal Data;",
          "Customer instructions;",
          "Customer’s breach of this DPA;",
          "Customer’s breach of Data Protection Laws;",
          "unlawful data collection;",
          "unlawful data sourcing;",
          "unlawful outreach;",
          "lack of consent;",
          "lack of lawful basis;",
          "deficient privacy notices;",
          "suppression failures;",
          "opt-out failures;",
          "data subject requests;",
          "agency client data;",
          "end-client instructions;",
          "regulated data uploaded without authorisation;",
          "prohibited data uploaded without authorisation;",
          "Customer-side security incidents;",
          "Customer integrations;",
          "Customer exports;",
          "Customer AI deployment;",
          "Customer use of Generated Outputs;",
          "international transfer issues caused by Customer’s use case;",
          "regulatory complaints caused by Customer’s data, instructions, outreach or use.",
        ],
      },
      {
        heading: "43. Local Law and Mandatory Rights",
        paragraphs: [
          "This DPA applies to the maximum extent permitted by applicable law.",
          "If mandatory law in a jurisdiction gives Customer or data subjects rights that cannot be excluded, restricted or modified, this DPA does not exclude those rights, but all exclusions, limitations, disclaimers, indemnities and protections continue to apply to the maximum extent permitted by that law.",
          "Where a provision cannot be enforced as written in a particular jurisdiction, it will be interpreted, narrowed or reformed only to the minimum extent necessary to make it enforceable, and the rest of the provision and this DPA remain effective.",
        ],
      },
      {
        heading: "44. Governing Law and Jurisdiction",
        paragraphs: [
          "This DPA is governed by the laws of the State of Delaware, United States, except where Data Protection Laws, standard contractual clauses, UK transfer mechanisms, Swiss transfer mechanisms or mandatory law require another governing law for a specific data protection issue.",
          "Subject to any mandatory law that cannot be waived, the state and federal courts located in Delaware have exclusive jurisdiction over disputes arising out of or relating to this DPA.",
          "Despite the above, Global Solutions Management LLC may seek injunctive relief, debt recovery, payment enforcement, intellectual property enforcement, confidentiality enforcement, security enforcement, data protection enforcement or urgent protective relief in any court or forum of competent jurisdiction.",
        ],
      },
      {
        heading: "45. Order of Precedence for Data Transfer Terms",
        paragraphs: [
          "If standard contractual clauses, UK transfer mechanisms, Swiss transfer mechanisms or mandatory Data Protection Laws apply and conflict with this DPA, those transfer terms or mandatory laws control only to the extent required for the restricted transfer or specific mandatory data protection issue.",
          "All other terms of this DPA, the Platform Terms of Service and Customer Agreement continue to apply to the maximum extent permitted by law.",
        ],
      },
      {
        heading: "46. Changes to this DPA",
        paragraphs: [
          "Global Solutions Management LLC may update this DPA from time to time to reflect product changes, legal developments, security requirements, operational needs, Subprocessor changes, AI provider changes, infrastructure changes, transfer mechanism changes or changes to Data Protection Laws.",
          "Material updates may be notified by posting, email, platform notice or other reasonable method.",
          "Continued use of Velocity Vision after the effective date of an updated DPA means Customer accepts the updated DPA.",
          "If Customer does not agree to an updated DPA, Customer must stop using Velocity Vision and cancel the applicable account or plan.",
        ],
      },
      {
        heading: "47. Term and Survival",
        paragraphs: [
          "This DPA remains in effect for as long as Global Solutions Management LLC processes Customer Personal Data on behalf of Customer.",
          "Provisions that by their nature should survive termination will survive, including provisions relating to confidentiality, deletion, retention, audits, liability, indemnity, no personal liability, international transfers, records, regulatory requests, local law, governing law and enforcement.",
        ],
      },
      {
        heading: "48. Contact",
        paragraphs: [
          "For privacy and data processing enquiries, use the Contact page and select the route that matches your request.",
          "Global Solutions Management LLC Delaware, United States Operator of Velocity Vision",
        ],
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    effectiveDate: "30 June 2026",
    lastUpdated: "30 June 2026",
    version: "2.0",
    sections: [
      {
        heading: "1. Overview",
        paragraphs: [
          `This Privacy Policy explains how ${ENTITY} collects, uses, shares and protects personal information in connection with the ${PLATFORM} website, platform, workspaces, support, billing and related services.`,
          "For customer-uploaded contact data that we process on behalf of customers, the customer is usually the controller and our Data Processing Agreement applies. For account, website, billing, support, security and operational data, we may act as controller or business depending on the law.",
        ],
      },
      {
        heading: "2. Information We Collect",
        paragraphs: [
          "We may collect information directly from users, customers, website visitors, payment providers, authentication providers, support communications, platform usage, cookies, connected services and customer uploads.",
        ],
        bullets: [
          "Account and contact details such as name, email address, company, role and login information.",
          "Billing and transaction information processed by payment providers.",
          "Platform usage data such as pages viewed, features used, uploads, exports, settings, activation actions, logs and support requests.",
          "Customer-uploaded workspace data such as contact records, company records, tags, notes, source fields, replies and pipeline information.",
          "Technical data such as IP address, device, browser, operating system, approximate location, cookies and diagnostics.",
        ],
      },
      {
        heading: "3. How We Use Information",
        paragraphs: [
          "We use personal information to operate, secure, improve and support the platform, provide workspaces, process billing, authenticate users, deliver support, maintain legal records, prevent abuse, communicate service updates and comply with law.",
        ],
        bullets: [
          "To provide Data Vault, quality review, templates, governed activation, replies, follow-up, pipeline, exports and reports.",
          "To process payments, invoices, taxes, plan changes and credits.",
          "To detect security incidents, fraud, abuse, policy breaches and deliverability risk.",
          "To send administrative messages, service notices, security alerts and legally required communications.",
          "To improve product performance, usability, reliability and safety using aggregated, de-identified or limited operational data where appropriate.",
        ],
      },
      {
        heading: "4. Customer-Uploaded Contact Data",
        paragraphs: [
          "Customers control what contact data they upload and how they use it. We process that data to provide the platform according to the customer's instructions and the Data Processing Agreement. Customers are responsible for providing required privacy notices and maintaining lawful bases for their own contacts.",
          "If you are a contact in a customer's workspace, please contact that customer first for access, deletion, opt-out or correction requests. We may redirect requests to the relevant customer unless we are legally required to respond directly.",
        ],
      },
      {
        heading: "5. AI and Generated Outputs",
        paragraphs: [
          "The platform may use AI-enabled services to generate drafts, summaries, outreach assets, classifications, reports, quality suggestions or workflow recommendations. Inputs and outputs may be processed by us and service providers to provide and secure the feature.",
          "Customers should not submit sensitive, regulated or highly confidential data into generation features unless they have confirmed that such use is lawful and appropriate for their plan, settings and risk requirements.",
        ],
      },
      {
        heading: "6. Sharing Information",
        paragraphs: [
          "We may share personal information with service providers, subprocessors, payment processors, hosting providers, authentication providers, analytics providers, communications tools, professional advisers, regulators, law enforcement, acquirers or affiliates where necessary and lawful.",
          "We do not sell customer-uploaded contact data. We do not use customer contact lists to market to those contacts for our own purposes while acting as processor for the customer.",
        ],
      },
      {
        heading: "7. Cookies and Analytics",
        paragraphs: [
          "We use cookies and similar technologies for essential site functions, login sessions, preferences, security, analytics and performance. The Cookie Policy explains cookie categories and how users can manage preferences.",
        ],
      },
      {
        heading: "8. International Transfers",
        paragraphs: [
          "We are operated from the United States and may use providers in multiple countries. Personal information may be transferred to or processed in jurisdictions that may have different data protection laws from your location. Where required, we use recognised transfer mechanisms such as standard contractual clauses, UK addenda, adequacy decisions or other lawful safeguards.",
        ],
      },
      {
        heading: "9. Retention",
        paragraphs: [
          "We retain personal information for as long as necessary to provide the platform, manage accounts, meet legal and tax obligations, resolve disputes, enforce agreements, prevent fraud, maintain security, support audits and comply with law. Customer workspace data may be retained until deleted by the customer, the account is terminated or deletion is requested, subject to backups and legal retention requirements.",
        ],
      },
      {
        heading: "10. Your Rights",
        paragraphs: [
          "Depending on your location, you may have rights to access, correct, delete, restrict, object, port or withdraw consent in relation to personal information. These rights may be limited by law, security, identity verification, customer-controller instructions or our legal obligations.",
          "Requests about customer-uploaded data should normally be directed to the customer that controls the workspace. Requests about your account, website or billing data may be sent to us.",
        ],
      },
      {
        heading: "11. Children's Data and Sensitive Data",
        paragraphs: [
          "The platform is intended for business use and is not directed to children. Customers must not upload children's data, special category data, health data, criminal offence data, payment-card data, government identifiers or other sensitive data unless expressly authorised in writing and lawful for the intended use.",
        ],
      },
      {
        heading: "12. Security and Contact",
        paragraphs: [
          "We use reasonable technical and organisational measures to protect personal information, but no system is completely secure. Customers and users are responsible for account security, strong passwords, device security and prompt reporting of suspected compromise.",
          ...standardContact("privacy rights, data enquiries or security concerns"),
        ],
      },
    ],
  },
  "acceptable-use-policy": {
    title: "Acceptable Use Policy",
    effectiveDate: "30 June 2026",
    lastUpdated: "30 June 2026",
    version: "2.0",
    sections: [
      {
        heading: "1. Purpose",
        paragraphs: [
          `This Acceptable Use Policy protects ${PLATFORM}, customers, recipients, senders, infrastructure and third parties. It applies to all accounts, workspaces, users, agencies, client workspaces, uploads, generated outputs, activations, exports and integrations.`,
        ],
      },
      {
        heading: "2. Lawful Use Only",
        paragraphs: [
          "You may use the platform only for lawful business purposes and in compliance with all applicable laws, regulations, platform policies, provider rules and third-party rights.",
        ],
        bullets: [
          "No unlawful data collection, processing, sale, enrichment, contact or export.",
          "No misleading, deceptive, fraudulent, defamatory, infringing, harassing, discriminatory or harmful activity.",
          "No use that would cause us, our providers or other customers to breach law, contract or policy.",
        ],
      },
      {
        heading: "3. Data and List Restrictions",
        paragraphs: [
          "You must not upload or use data that you cannot lawfully process for the intended purpose. You must not use the platform with illegally obtained, unlawfully scraped, stolen, leaked, purchased-without-lawful-basis, suppressed, do-not-contact or otherwise restricted contact data.",
        ],
      },
      {
        heading: "4. Outreach and Sender Restrictions",
        paragraphs: [
          "You must not use the platform for spam, unlawful unsolicited communications, deceptive headers, misleading subject lines, impersonation, domain spoofing, phishing, credential harvesting, evasion of opt-outs, suppression-list misuse or sending that violates anti-spam, privacy, advertising or communications laws.",
        ],
      },
      {
        heading: "5. Content Restrictions",
        paragraphs: [
          "You must not create, upload, generate, send or promote content that is illegal, exploitative, abusive, hateful, discriminatory, deceptive, sexually exploitative, violent, infringing, malicious, harmful to minors, or targeted at vulnerable people in an inappropriate way.",
        ],
        bullets: [
          "Regulated products or services may require additional permissions and may be refused or restricted.",
          "High-risk sectors such as health, finance, legal, immigration, employment, politics, insurance, credit, education, gambling, weapons, adult content and controlled substances must comply with all applicable sector rules and may be blocked.",
          "You must not use generated outputs to misrepresent facts, qualifications, endorsements, pricing, legal rights, regulatory status or product capabilities.",
        ],
      },
      {
        heading: "6. Platform Abuse and Security",
        paragraphs: [
          "You must not interfere with, probe, scan, disrupt, reverse engineer, overload, copy, scrape, bypass, resell or misuse the platform, infrastructure, source code, APIs, security controls, billing systems, safety checks, sender verification, quality holds or plan limits.",
        ],
      },
      {
        heading: "7. Agency and Client Workspace Conduct",
        paragraphs: [
          "Agencies are responsible for all client workspaces, invited users, client data, sender setup, permissions, approvals and activation decisions. Agencies must not mix client data, misrepresent client authority or use one client's data for another client's benefit without lawful permission.",
        ],
      },
      {
        heading: "8. Monitoring and Enforcement",
        paragraphs: [
          "We may investigate suspected violations and may block uploads, hold records, pause activation, restrict exports, throttle usage, require verification, remove content, suspend senders, disable workspaces, terminate accounts or report unlawful activity where appropriate.",
          "We are not required to monitor all activity, but our failure to act immediately does not waive our rights.",
        ],
      },
      {
        heading: "9. Contact",
        paragraphs: standardContact("acceptable use, abuse reports or compliance concerns"),
      },
    ],
  },
  "marketing-compliance-policy": {
    title: "Marketing Compliance Policy",
    effectiveDate: "30 June 2026",
    lastUpdated: "30 June 2026",
    version: "2.0",
    sections: [
      {
        heading: "1. Customer Responsibility",
        paragraphs: [
          `${PLATFORM} provides tools for governed activation, but customers are solely responsible for ensuring every outreach activity, contact source, message, sender identity, opt-out process and follow-up action complies with all applicable laws.`,
          "Relevant laws may include GDPR, UK GDPR, PECR, ePrivacy rules, CAN-SPAM, CASL, the Australian Spam Act, consumer protection laws, advertising standards, sector-specific rules and local laws in the recipient's jurisdiction.",
        ],
      },
      {
        heading: "2. Lawful Basis and Consent",
        paragraphs: [
          "Before activating any contact, you must confirm that you have a lawful basis or required consent for the message, recipient, channel, jurisdiction and purpose. You must maintain records sufficient to prove consent, legitimate interest, existing relationship, soft opt-in, conspicuous publication, contract or other lawful basis where applicable.",
        ],
      },
      {
        heading: "3. Email and Message Requirements",
        paragraphs: [
          "Commercial messages must comply with applicable identification, transparency, sender, unsubscribe, recordkeeping and content requirements. The platform may assist with templates and fields, but you remain responsible for final compliance.",
        ],
        bullets: [
          "Sender, From, Reply-To and routing information must be accurate and not misleading.",
          "Subject lines and preview text must not be deceptive.",
          "Messages must identify the sender or promoted organisation where required.",
          "Messages must include a valid opt-out or unsubscribe mechanism where required.",
          "Opt-out and unsubscribe requests must be honoured promptly and suppression lists must be maintained.",
          "Postal address, business identity, advertisement disclosures or other notices must be included where required by local law.",
        ],
      },
      {
        heading: "4. Suppression Lists and Opt-Outs",
        paragraphs: [
          "You must maintain suppression lists and opt-out records for your own business and client workspaces. You must not contact individuals who have opted out, withdrawn consent, objected, unsubscribed or otherwise requested no further marketing where that request applies.",
          "Suppression data may only be used for compliance and must not be sold, reused or activated for unrelated marketing.",
        ],
      },
      {
        heading: "5. Data Source and List Hygiene",
        paragraphs: [
          "You must maintain records showing where contact data came from, when it was collected, what notices were provided, what lawful basis applies, whether the recipient opted out, and whether any jurisdiction-specific restrictions apply.",
        ],
        bullets: [
          "Do not use harvested addresses, dictionary-generated addresses, unlawfully scraped data or purchased lists without a lawful basis and appropriate documentation.",
          "Do not rely on platform quality flags as proof of legal permission.",
          "Data marked risky, blocked, duplicate or needs review must be handled before activation according to platform controls and your legal obligations.",
        ],
      },
      {
        heading: "6. B2B, B2C and International Outreach",
        paragraphs: [
          "Rules differ between business and consumer recipients and between countries. A business email address can still be personal data. Some jurisdictions require opt-in consent; others permit limited opt-out marketing subject to strict conditions. You must apply the strictest rule needed for the recipient, channel, message and jurisdiction.",
        ],
      },
      {
        heading: "7. Agency Responsibilities",
        paragraphs: [
          "Agencies must ensure each client has lawful authority for the data and outreach conducted through the client's workspace. Agencies must obtain appropriate client approvals, maintain records, prevent cross-client data mixing and indemnify us for client workspace claims.",
        ],
      },
      {
        heading: "8. Platform Controls Are Not Legal Approval",
        paragraphs: [
          "Sender verification, quality checks, send limits, cadence controls and activation gates are operational safeguards. They are not legal advice, compliance certification, deliverability guarantees or confirmation that a message may lawfully be sent.",
        ],
      },
      {
        heading: "9. Enforcement and Indemnity",
        paragraphs: [
          "We may pause, block, throttle, review, suspend or terminate outreach activity if we believe it creates legal, deliverability, reputational, provider, recipient or platform risk. You must indemnify us for claims, fines, penalties, complaints, investigations, costs or losses arising from your outreach, data, sender use, client activity or non-compliance.",
        ],
      },
      {
        heading: "10. Contact",
        paragraphs: standardContact("marketing compliance questions"),
      },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    effectiveDate: "30 June 2026",
    lastUpdated: "30 June 2026",
    version: "2.0",
    sections: [
      {
        heading: "1. Overview",
        paragraphs: [
          `This Cookie Policy explains how ${PLATFORM} uses cookies and similar technologies on the public website and platform. Cookies help operate the site, keep users signed in, remember preferences, protect security, analyse usage and improve performance.`,
        ],
      },
      {
        heading: "2. Types of Cookies",
        paragraphs: [
          "We may use the following categories of cookies and similar technologies:",
        ],
        bullets: [
          "Essential cookies required for authentication, security, routing, load balancing and basic platform functions.",
          "Preference cookies that remember language, region, currency or interface choices.",
          "Analytics cookies that help us understand website and product usage.",
          "Performance and diagnostics cookies that help detect errors, measure speed and improve reliability.",
          "Marketing cookies only where enabled and lawful, used to understand campaign effectiveness or provide relevant communications.",
        ],
      },
      {
        heading: "3. Third-Party Technologies",
        paragraphs: [
          "Third-party providers may set cookies or similar technologies when they provide hosting, analytics, payments, support, embedded tools, authentication, security, monitoring or communications. Their use may be governed by their own policies as well as our agreements with them.",
        ],
      },
      {
        heading: "4. Managing Cookies",
        paragraphs: [
          "You can control cookies through browser settings and, where available, website consent tools. Blocking some cookies may affect login, security, billing, preferences or platform functionality.",
        ],
      },
      {
        heading: "5. Updates and Contact",
        paragraphs: [
          "We may update this Cookie Policy when our technology, providers, legal requirements or product features change.",
          ...standardContact("cookie or tracking technology questions"),
        ],
      },
    ],
  },
  "platform-security-policy": {
    title: "Platform Security Policy",
    effectiveDate: "30 June 2026",
    lastUpdated: "30 June 2026",
    version: "2.0",
    sections: [
      {
        heading: "1. Security Approach",
        paragraphs: [
          `${PLATFORM} is designed to protect customer workspaces, uploaded data, sender controls, activation workflows, replies, pipeline records and platform integrity using reasonable technical and organisational measures appropriate to a self-serve SaaS platform.`,
          "Security is a shared responsibility. We protect the platform environment; customers must protect their own accounts, users, devices, data, senders and connected services.",
        ],
      },
      {
        heading: "2. Access Controls",
        paragraphs: [
          "We use access controls intended to restrict platform and administrative access to authorised users and personnel. Customer workspaces use account-based permissions, and agency workspaces are designed to separate client data and activity.",
        ],
        bullets: [
          "Customers should use strong passwords and secure authentication practices.",
          "Customers should invite only authorised users and remove access when no longer needed.",
          "Customers are responsible for securing connected email, billing and third-party accounts.",
        ],
      },
      {
        heading: "3. Data Protection Measures",
        paragraphs: [
          "Security measures may include encrypted transmission, secure hosting, permission controls, operational logging, backup procedures, monitoring, vulnerability management, supplier review and incident response processes. Specific controls may change as the platform evolves.",
        ],
      },
      {
        heading: "4. Sender and Activation Governance",
        paragraphs: [
          "The platform may use sender verification, activation gates, quality statuses, risky-record flags, plan limits, cadence controls and audit records to reduce operational and deliverability risk. These safeguards do not remove the customer's responsibility for lawful outreach.",
        ],
      },
      {
        heading: "5. Incident Response",
        paragraphs: [
          "If we become aware of a security incident affecting customer data or platform integrity, we will investigate, take reasonable containment and remediation steps, and notify affected customers where required by law or contract.",
        ],
      },
      {
        heading: "6. Vulnerability Reporting",
        paragraphs: [
          "Customers and researchers must not conduct intrusive testing, scanning, exploitation, social engineering, denial-of-service testing or access to other customers' data without written permission. Security concerns should be reported responsibly.",
        ],
      },
      {
        heading: "7. No Absolute Security Warranty",
        paragraphs: [
          "No internet, cloud or software platform can guarantee absolute security. We do not warrant that unauthorised access, data loss, vulnerability, outage or attack can never occur. Customers should maintain their own backups, compliance processes and business continuity plans.",
        ],
      },
      {
        heading: "8. Contact",
        paragraphs: standardContact("security reports or platform security questions"),
      },
    ],
  },
  "service-level-agreement": {
    title: "Service Level Agreement",
    effectiveDate: "30 June 2026",
    lastUpdated: "30 June 2026",
    version: "2.0",
    sections: [
      {
        heading: "1. Purpose",
        paragraphs: [
          `This Service Level Agreement describes operational service standards for ${PLATFORM}. It is a service target document, not a guarantee of uninterrupted access and not a service-credit agreement unless a signed order form expressly provides service credits.`,
        ],
      },
      {
        heading: "2. Availability Target",
        paragraphs: [
          "For paid production workspaces, we aim to maintain 99% monthly platform availability for core workspace access, excluding scheduled maintenance, emergency maintenance, beta features, third-party outages, customer-side issues, force majeure, security actions, payment suspension, misuse enforcement and external network failures.",
        ],
      },
      {
        heading: "3. Maintenance",
        paragraphs: [
          "We may perform scheduled or emergency maintenance to improve performance, security, reliability or functionality. We will try to provide advance notice for scheduled maintenance where practical. Emergency maintenance may occur without notice.",
        ],
      },
      {
        heading: "4. Support Channels and Targets",
        paragraphs: [
          "Support is provided through designated support channels. Response times are targets and may vary by plan, severity, volume, complexity, holidays, weekends and whether the issue depends on third-party providers.",
        ],
        bullets: [
          "Critical platform access issue affecting multiple paid customers: target initial response within one business day.",
          "Standard product, billing or workspace support: target initial response within two business days.",
          "Feature guidance, exports, data questions or non-critical requests: handled in ordinary support queues.",
        ],
      },
      {
        heading: "5. Customer Responsibilities",
        paragraphs: [
          "Customers must maintain accurate account information, use supported browsers, secure credentials, protect connected accounts, report issues with sufficient detail, follow platform policies and avoid actions that create avoidable incidents or deliverability risk.",
        ],
      },
      {
        heading: "6. Exclusions",
        paragraphs: [
          "Availability and support targets do not apply to preview, beta, seeded demo, qa-seed, experimental, discontinued or free features unless expressly stated. They also do not apply to third-party systems, payment processors, email providers, DNS issues, customer networks, customer data errors or customer misconfiguration.",
        ],
      },
      {
        heading: "7. Contact",
        paragraphs: standardContact("service level or support questions"),
      },
    ],
  },
};

const slugify = (heading: string) =>
  heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const LegalDocumentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const doc = slug ? docs[slug] : null;
  const [activeSection, setActiveSection] = useState("");
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (doc) {
      setOpenSections(new Set(doc.sections.map((_, i) => i)));
    }
  }, [slug, doc]);

  useEffect(() => {
    if (!doc) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [doc, openSections]);

  const toggleSection = (i: number) => {
    const next = new Set(openSections);
    next.has(i) ? next.delete(i) : next.add(i);
    setOpenSections(next);
  };

  if (!doc) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20 text-center">
          <p className="text-muted-foreground">Document not found.</p>
          <Link to="/legal" className="text-accent underline mt-4 inline-block">Back to Legal Centre</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <Link to="/legal" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
              <ArrowLeft size={14} /> Back to Legal Centre
            </Link>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">{doc.title}</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/70">Effective Date:</span> {doc.effectiveDate}</p>
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/70">Last Updated:</span> {doc.lastUpdated}</p>
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/70">Version:</span> {doc.version}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Global Solutions Management LLC — Delaware, United States — operator of Velocity Vision</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-3xl">These online terms are designed for product clarity and operational protection. They should be reviewed by qualified counsel before high-volume paid rollout or enterprise contracting.</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-3xl italic">
              This document may be displayed in your browser's preferred language using an automated
              machine-translation layer (GTranslate / Google Translate). Translations are provided for
              convenience only. The English version controls if there is any conflict between translations.
            </p>
          </motion.div>

          <div className="flex gap-10">
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">Table of Contents</p>
                <nav className="space-y-0.5 border-l border-border/50">
                  {doc.sections.map((s, i) => {
                    const id = slugify(s.heading);
                    const isActive = activeSection === id;
                    return (
                      <a
                        key={i}
                        href={`#${id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!openSections.has(i)) {
                            const next = new Set(openSections);
                            next.add(i);
                            setOpenSections(next);
                          }
                          setTimeout(() => {
                            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 100);
                        }}
                        className={cn(
                          "block pl-4 py-1.5 text-xs leading-snug border-l-2 -ml-px transition-colors",
                          isActive ? "border-accent text-accent font-medium" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                      >
                        {s.heading}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <div className="flex-1 min-w-0 max-w-[760px]">
              <div className="space-y-2">
                {doc.sections.map((s, i) => {
                  const id = slugify(s.heading);
                  const isOpen = openSections.has(i);
                  return (
                    <Collapsible key={i} open={isOpen} onOpenChange={() => toggleSection(i)}>
                      <div ref={(el) => { sectionRefs.current[i] = el; }} id={id} className="scroll-mt-24">
                        <CollapsibleTrigger asChild>
                          <button className="w-full flex items-center gap-2 py-3 text-left group hover:text-accent transition-colors border-b border-border/30">
                            {isOpen ? <ChevronDown size={16} className="text-muted-foreground shrink-0" /> : <ChevronRight size={16} className="text-muted-foreground shrink-0" />}
                            <h2 className="text-base lg:text-lg font-display font-semibold text-foreground group-hover:text-accent transition-colors">{s.heading}</h2>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-3 pb-5 pl-6 space-y-3">
                            {s.paragraphs.map((p, pi) => (
                              <p key={pi} className="text-sm text-foreground/75 leading-relaxed whitespace-pre-line">{p}</p>
                            ))}
                            {s.bullets && (
                              <ul className="space-y-1.5 pl-1">
                                {s.bullets.map((b, bi) => (
                                  <li key={bi} className="flex gap-2 text-sm text-foreground/75 leading-relaxed">
                                    <span className="text-accent mt-1 shrink-0">•</span>
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </motion.div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>

              <div className="mt-16 pt-8 border-t border-border/50">
                <div className="flex items-start gap-3 mb-4">
                  <Building2 size={18} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Velocity Vision</p>
                    <p className="text-xs text-muted-foreground">Operated by Global Solutions Management LLC</p>
                    <p className="text-xs text-muted-foreground">Delaware, United States</p>
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-colors"
                >
                  Use the Contact page →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalDocumentPage;
