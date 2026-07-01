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
    lastUpdated: "30 June 2026",
    version: "2.0",
    sections: [
      {
        heading: "1. Service Provider and Scope",
        paragraphs: [
          `${PLATFORM} is operated by ${ENTITY}. These Platform Terms of Service govern access to and use of the ${PLATFORM} website, application, workspaces, features, software, generated outputs, account tools and related services.`,
          `${PLATFORM} is a self-serve commercial workspace for Data Vault storage, data quality review, templates, governed activation, cadence scheduling, replies, follow-up and pipeline movement. It is not a law firm, compliance adviser, broker, marketing agency, email service provider of record, or guaranteed revenue service.`,
        ],
      },
      {
        heading: "2. Agreement and Document Hierarchy",
        paragraphs: [
          "By creating an account, accessing a workspace, purchasing credits, subscribing to a plan, inviting users or using the platform, you agree to these Terms and all policies incorporated by reference.",
          "If these Terms conflict with a signed order form or separately executed written agreement, the signed document controls for the conflicting commercial term only. The Data Processing Agreement controls for processor obligations. The Acceptable Use Policy and Marketing Compliance Policy always apply to platform conduct and outreach activity.",
        ],
      },
      {
        heading: "3. Accounts, Users and Authority",
        paragraphs: [
          "You must provide accurate account, billing and workspace information and keep credentials secure. You are responsible for all activity under your account, including actions by employees, contractors, invited users, agencies, clients and anyone using your login or workspace access.",
          "If you create an account for an organisation, you represent that you have authority to bind that organisation and to upload, process and activate data on its behalf.",
        ],
        bullets: [
          "You must maintain appropriate internal permissions for every user you invite.",
          "You must promptly remove users who no longer require access.",
          "You must notify us promptly if you suspect unauthorised account access or misuse.",
        ],
      },
      {
        heading: "4. Platform Functionality",
        paragraphs: [
          "The platform may include data upload, mapping, deduplication, quality status assignment, sender verification, safe activation checks, template generation, outreach assets, cadence scheduling, reply organisation, follow-up states, pipeline tracking, billing tools, exports and reporting.",
          "Features may be added, changed, suspended or removed as the product evolves. We may improve safety controls, usage limits, interface flows, billing logic and quality checks at any time to protect the platform, customers, senders, recipients and infrastructure.",
        ],
      },
      {
        heading: "5. Customer Data Responsibility",
        paragraphs: [
          "You retain responsibility for all data you upload, import, paste, generate, enrich, segment, activate or export through the platform. This includes contact lists, company records, email addresses, names, job titles, notes, tags, source information, customer records, client records and any other workspace content.",
          "You represent and warrant that you have all rights, permissions, notices, consents and lawful bases required to collect, store, upload, process, use, contact and retain the data you place into the platform.",
        ],
        bullets: [
          "Do not upload unlawfully obtained data, scraped data without lawful basis, purchased lists that cannot lawfully be used, sensitive personal data unless expressly authorised, or data about minors.",
          "Do not upload data subject to restrictions that prevent processing, outreach, transfer, storage or use inside a SaaS platform.",
          "You must maintain your own records of source, permission, consent, legitimate interest assessment, suppression status and lawful basis where required.",
        ],
      },
      {
        heading: "6. Outreach, Activation and Sender Governance",
        paragraphs: [
          "The platform provides governance controls such as sender verification, quality flags, risky-record checks, plan limits, cadence controls and activation gates. These controls help reduce risk but do not make your outreach lawful by themselves.",
          "You are solely responsible for deciding whether each contact may lawfully be contacted, whether the message is lawful in the recipient's jurisdiction, whether unsubscribe or opt-out obligations apply, and whether your sender identity, content and records meet applicable rules.",
        ],
        bullets: [
          "Sender verification may be required before activation.",
          "We may block, throttle, pause, restrict or review activation if data, sender setup, content, volume, complaint activity or platform signals create risk.",
          "We do not guarantee deliverability, inbox placement, replies, meetings, sales, funding, revenue, pipeline value or any commercial outcome.",
        ],
      },
      {
        heading: "7. AI, Templates and Generated Outputs",
        paragraphs: [
          "Templates and generated outputs are workflow tools. Outputs may include outreach copy, social copy, follow-up steps, summaries, reports, pipeline notes, prompts or other draft materials. Outputs are not legal, tax, accounting, financial, medical, regulatory or professional advice.",
          "You must review, edit and approve outputs before use. You are responsible for ensuring that generated materials are accurate, lawful, non-deceptive, non-infringing, suitable for your audience and compliant with your policies and applicable law.",
        ],
        bullets: [
          "AI outputs are drafts and should be reviewed before use. Velocity Vision does not guarantee replies, sales, deliverability, revenue or legal compliance.",
          "Generated outputs may be incomplete, inaccurate, repetitive or unsuitable for a particular recipient or jurisdiction.",
          "Do not rely on generated outputs as a substitute for professional review where legal, compliance, financial, regulated or sensitive content is involved.",
          "We may use aggregated, de-identified usage signals to improve product quality, safety and reliability, subject to our Privacy Policy and Data Processing Agreement.",
        ],
      },
      {
        heading: "8. Subscriptions, Credits, Billing and Taxes",
        paragraphs: [
          "Plans, credits, top-ups, billing cycles, usage limits, included features and currencies are shown at checkout, in billing settings or in an applicable order form. Credits may be consumed by generation, activation, export, processing or other chargeable product actions depending on the plan.",
          "Stored data may remain available when credits run out, but chargeable actions may pause until credits are added or the plan is upgraded. Unless required by law or expressly stated in writing, fees, subscriptions and credit purchases are non-refundable once the paid period begins or the credits are used or made available.",
        ],
        bullets: [
          "You are responsible for applicable taxes, withholding, duties, exchange-rate effects and payment-provider charges.",
          "We may suspend or limit access for failed payments, chargebacks, fraud signals or overdue invoices.",
          "Plan changes may affect credits, limits, features, workspace access and billing dates.",
        ],
      },
      {
        heading: "9. Agency and Multi-Workspace Use",
        paragraphs: [
          "Agency Workspace users may operate separate client workspaces from one account. Each agency remains solely responsible for its client relationships, client data, client permissions, workspace configuration, sender setup, generated outputs, activation decisions and compliance obligations.",
          `${PLATFORM} does not enter into a contract with an agency's end clients unless separately agreed in writing. The agency account holder is responsible for all end-client activity under the agency account and must indemnify us for claims arising from its client workspaces.`
        ],
      },
      {
        heading: "10. Prohibited Use",
        paragraphs: [
          "You must comply with the Acceptable Use Policy and must not use the platform for unlawful, harmful, deceptive, abusive, high-risk or rights-infringing activity.",
        ],
        bullets: [
          "No spam, unlawful unsolicited messaging, deceptive headers, misleading subject lines, impersonation or sender misrepresentation.",
          "No malware, phishing, credential theft, evasion of platform limits, abusive automation, scraping of the platform, reverse engineering or security testing without permission.",
          "No content or outreach involving illegal goods or services, exploitation, harassment, hate, discrimination, sexual exploitation, regulated activities without authorisation, or vulnerable-person targeting.",
          "No attempt to bypass sender verification, suppression lists, data-quality holds, plan-tier limits, safety checks or compliance controls.",
        ],
      },
      {
        heading: "11. Intellectual Property",
        paragraphs: [
          "We and our licensors own the platform, software, interfaces, workflows, templates, product logic, designs, documentation, branding, systems, safety controls and all related intellectual property. You receive a limited, revocable, non-exclusive, non-transferable right to use the platform according to these Terms.",
          "You retain ownership of your customer data and customer-provided content. Subject to the Data Processing Agreement and Privacy Policy, you grant us the rights necessary to host, process, transmit, secure, back up, display and operate that data to provide the platform.",
        ],
      },
      {
        heading: "12. Third-Party Services and Integrations",
        paragraphs: [
          "The platform may rely on third-party providers for hosting, authentication, analytics, payments, email connectivity, AI processing, data storage, monitoring, communications or other infrastructure. Third-party services may have their own terms, policies, outages, rate limits, errors, suspensions and compliance requirements.",
          "We are not responsible for third-party service failures, policy changes, deliverability decisions, payment processing interruptions, email-provider restrictions or external platform behaviour outside our reasonable control.",
        ],
      },
      {
        heading: "13. Privacy and Data Processing",
        paragraphs: [
          "Our Privacy Policy explains how we collect and use personal information about website visitors, platform users and contacts who interact with us directly. The Data Processing Agreement governs personal data that customers upload and that we process as a processor on the customer's behalf.",
          "You must provide all required privacy notices to your own contacts, customers, prospects and end clients and must respond to their legal rights requests unless we are legally required to respond directly.",
        ],
      },
      {
        heading: "14. Suspension and Termination",
        paragraphs: [
          "We may suspend, restrict, throttle, disable or terminate access to any account, workspace, sender, activation, export or feature if we reasonably believe there is legal risk, security risk, payment failure, platform abuse, policy breach, data misuse, deliverability risk, complaint activity, regulatory concern or harm to us, customers, recipients, infrastructure or third parties.",
          "After termination, you may lose access to the workspace, generated outputs, data, reports and credits. We may retain limited records where required for legal, tax, security, audit, billing, dispute, fraud prevention or compliance purposes.",
        ],
      },
      {
        heading: "15. Disclaimers",
        paragraphs: [
          "The platform is provided on an 'as is' and 'as available' basis to the maximum extent permitted by law. We do not warrant that the platform will be uninterrupted, error-free, secure against every threat, compatible with every system, or suitable for every jurisdiction or use case.",
          "We do not guarantee the accuracy of data-quality scoring, generated outputs, reply classification, pipeline values, profitability estimates, export formatting, integrations, deliverability, inbox placement, legal compliance, commercial performance or revenue outcomes.",
        ],
      },
      {
        heading: "16. Limitation of Liability",
        paragraphs: [
          "To the maximum extent permitted by law, our total aggregate liability arising out of or relating to the platform, these Terms or any incorporated policy is limited to the amounts paid by you to us for the platform during the twelve months immediately before the event giving rise to the claim.",
          "To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, exemplary or punitive damages, or for loss of profits, revenue, goodwill, opportunity, data, use, business interruption, deliverability, reputation or anticipated savings.",
        ],
      },
      {
        heading: "17. Indemnity",
        paragraphs: [
          "You agree to defend, indemnify and hold harmless Global Solutions Management LLC, its owners, officers, employees, contractors, service providers and agents from claims, losses, liabilities, damages, penalties, costs and expenses arising from or related to your account, workspaces, data, content, outreach, client activity, breach of these Terms, breach of law, infringement, unlawful marketing, data protection violation, sender misuse or misuse of the platform.",
        ],
      },
      {
        heading: "18. Governing Law, Changes and Contact",
        paragraphs: [
          "These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles. Courts located in Delaware have exclusive jurisdiction unless a mandatory law requires otherwise.",
          "We may update these Terms and incorporated policies. Material updates may be notified by posting, email or in-platform notice. Continued use after the effective date means acceptance of the updated terms.",
          ...standardContact("legal notices and questions about these Terms"),
        ],
      },
    ],
  },
  "client-services-agreement": {
    title: "Customer Agreement",
    effectiveDate: "30 June 2026",
    lastUpdated: "30 June 2026",
    version: "2.0",
    sections: [
      {
        heading: "1. Agreement Purpose",
        paragraphs: [
          `This Customer Agreement applies to customers who purchase, subscribe to or use paid features of ${PLATFORM}. It supplements the Platform Terms of Service and governs commercial use of the self-serve workspace.`,
          "This is a software and workspace agreement. It does not create an agency retainer, managed marketing service, professional advisory engagement, legal compliance engagement, deliverability guarantee or revenue guarantee unless a separately signed written order expressly says so.",
        ],
      },
      {
        heading: "2. Workspace Access and Plans",
        paragraphs: [
          "A plan may include workspace access, Data Vault usage, templates, generation, governed activation, cadence scheduling, replies, follow-up, pipeline, reporting, exports, support level, agency workspaces and credits. Available features, currencies, limits and pricing may differ by plan, region, account status and checkout configuration.",
        ],
        bullets: [
          "Starter, Growth and Agency Workspace plans may have different limits and rights.",
          "Some features may be in preview, beta, limited release or founder-review mode.",
          "Workspace access is subject to successful payment, verification and compliance with all platform policies.",
        ],
      },
      {
        heading: "3. Credits, Top-Ups and Usage",
        paragraphs: [
          "Credits are platform usage units and are not cash balances, stored-value instruments, bank deposits or refundable currency. Credits may be applied to asset generation, activation, exports, processing or other product actions as described at the time of purchase or in the workspace.",
          "Unused, expired, promotional, test or bonus credits may be subject to plan-specific rules. We may correct obvious credit errors, fraud, abuse, duplicate grants or miscalculations.",
        ],
      },
      {
        heading: "4. Payment, Billing and Taxes",
        paragraphs: [
          "You authorise us and our payment providers to charge the payment method you provide for subscriptions, renewals, top-ups, upgrades, overages, taxes and other agreed charges. You must keep billing details accurate and pay all amounts when due.",
        ],
        bullets: [
          "Prices may be displayed in multiple currencies; taxes and payment-provider charges may apply.",
          "You are responsible for VAT, sales tax, GST, withholding, duties and similar charges unless we are legally required to collect them.",
          "Failed payments, chargebacks, suspected fraud or overdue amounts may result in suspension, downgrade or termination.",
        ],
      },
      {
        heading: "5. Renewals, Cancellation and Refunds",
        paragraphs: [
          "Subscription plans renew according to the billing cycle shown at purchase unless cancelled before renewal. Cancellation stops future renewal but does not automatically refund past charges, current billing periods, used credits or top-ups unless required by law or expressly stated in writing.",
          "If a plan is downgraded, cancelled or paused, access to features, credits, activation, exports, workspaces or stored data may change at the end of the paid period or immediately if required for compliance or non-payment.",
        ],
      },
      {
        heading: "6. Customer Obligations",
        paragraphs: [
          "You are responsible for your data, instructions, configuration, users, senders, clients, generated outputs, approval decisions, activation decisions, follow-up actions and pipeline records. You must operate the workspace lawfully and maintain appropriate internal approvals.",
        ],
        bullets: [
          "You must ensure all uploaded data can lawfully be processed and used for the intended purpose.",
          "You must review generated outputs before use.",
          "You must comply with anti-spam, privacy, data protection, advertising, consumer protection, platform, sector-specific and local laws.",
          "You must maintain suppression lists, unsubscribe records and opt-out records where required.",
        ],
      },
      {
        heading: "7. Agency Workspace Customers",
        paragraphs: [
          "Agency customers may use client workspaces for their own clients. The agency remains the contracting customer and is responsible for end-client permissions, lawful data sourcing, sender setup, approvals, compliance, billing allocation, user access and all activity in each client workspace.",
          "End clients do not receive direct rights against us unless we separately contract with them in writing.",
        ],
      },
      {
        heading: "8. Human Support and Professional Review",
        paragraphs: [
          "Support may help with product usage, account access and workflow questions. Unless expressly agreed in a signed written statement of work, support does not include managed campaign delivery, legal review, tax advice, financial advice, deliverability consulting, compliance sign-off or professional services.",
        ],
      },
      {
        heading: "9. No Outcome Guarantee",
        paragraphs: [
          "Commercial outcomes depend on data quality, sender reputation, message quality, legal permissions, audience behaviour, market conditions, offer strength, timing, customer response and third-party systems. We do not guarantee replies, meetings, sales, conversion, funding, press coverage, revenue, deliverability, inbox placement or pipeline value.",
        ],
      },
      {
        heading: "10. Confidentiality",
        paragraphs: [
          "Each party may receive non-public business, technical, operational, pricing, product or customer information from the other. Each party must protect confidential information using reasonable care and use it only for the relationship unless disclosure is required by law, professional advisers, payment providers or infrastructure providers bound by confidentiality obligations.",
        ],
      },
      {
        heading: "11. Intellectual Property and Output Rights",
        paragraphs: [
          "We own the platform, product logic, templates, workflows, interfaces, software, documentation, safety systems and underlying technology. You retain your customer data and customer-provided content. Subject to payment and compliance, you may use generated outputs for your business purposes after reviewing and approving them.",
          "You may not copy, resell, white-label, reverse engineer or commercially exploit the platform, templates or workflow logic outside your authorised workspace use.",
        ],
      },
      {
        heading: "12. Suspension, Termination and Data Export",
        paragraphs: [
          "We may suspend or terminate access for non-payment, chargeback, security risk, legal risk, platform misuse, high complaint activity, sender abuse, data misuse, policy breach or other conduct that may harm the platform, recipients, customers, infrastructure or third parties.",
          "Where technically available and legally permitted, you may export certain data before termination. We may retain limited records as required for tax, legal, security, billing, dispute, fraud and compliance purposes.",
        ],
      },
      {
        heading: "13. Liability, Indemnity and Governing Law",
        paragraphs: [
          "Liability limits, disclaimers, indemnities, governing law and dispute terms are set out in the Platform Terms of Service and apply to this Customer Agreement. This Agreement is governed by the laws of Delaware, United States, unless mandatory law requires otherwise.",
          ...standardContact("customer agreement, billing or contract questions"),
        ],
      },
    ],
  },
  "data-processing-agreement": {
    title: "Data Processing Agreement",
    effectiveDate: "30 June 2026",
    lastUpdated: "30 June 2026",
    version: "2.0",
    sections: [
      {
        heading: "1. Purpose and Incorporation",
        paragraphs: [
          `This Data Processing Agreement (DPA) forms part of the agreement between the customer and ${ENTITY}. It applies when ${PLATFORM} processes Customer Personal Data on behalf of a customer in the course of providing the platform.`,
          "For Customer Personal Data, the customer is the controller or business and Global Solutions Management LLC is the processor or service provider, except where we process personal data for our own account administration, security, billing, legal or product operations as described in the Privacy Policy.",
        ],
      },
      {
        heading: "2. Processing Details",
        paragraphs: [
          "The subject matter is the provision of a self-serve commercial workspace. The duration is the term of the customer's account plus any legally required retention period. The nature and purpose of processing is to host, store, map, validate, deduplicate, quality-check, segment, generate outputs from, activate, schedule, route, report on, export, secure and support customer data as instructed through the platform.",
        ],
        bullets: [
          "Types of personal data may include names, email addresses, telephone numbers, company names, job titles, business contact details, location, language preference, tags, notes, source information, reply data, pipeline data and other fields uploaded by the customer.",
          "Categories of data subjects may include prospects, customers, business contacts, employees of organisations, agency client contacts, suppliers and other individuals whose data the customer chooses to upload.",
          "Special category data, children's data, criminal offence data, health data, financial account data and government identifiers must not be uploaded unless expressly authorised in writing and lawful for the intended processing.",
        ],
      },
      {
        heading: "3. Customer Instructions",
        paragraphs: [
          "We process Customer Personal Data only on documented customer instructions, including instructions given through platform configuration, uploads, settings, API calls, integrations, activation actions, support requests and written communications. We may refuse or suspend an instruction if we believe it is unlawful, unsafe, outside the platform scope or likely to breach this DPA or platform policies.",
        ],
      },
      {
        heading: "4. Processor Obligations",
        paragraphs: [
          "We will maintain appropriate technical and organisational measures, restrict access to authorised personnel, require confidentiality obligations, assist with customer data protection obligations where reasonably possible, and make available information reasonably necessary to demonstrate compliance with this DPA.",
        ],
        bullets: [
          "We will not sell Customer Personal Data.",
          "We will not use Customer Personal Data for cross-customer targeting or to contact the customer's contacts for our own marketing unless independently permitted by law and outside the processor role.",
          "We may process aggregated or de-identified information to maintain, secure and improve the platform, provided it does not identify the customer or data subjects.",
        ],
      },
      {
        heading: "5. Customer Obligations",
        paragraphs: [
          "The customer is responsible for the lawfulness of Customer Personal Data and all instructions. The customer must maintain appropriate privacy notices, legal bases, consent records, legitimate interest assessments, suppression lists and data subject response processes where required by law.",
        ],
        bullets: [
          "The customer must not upload data it has no right to process.",
          "The customer must ensure outreach and activation decisions are lawful in each relevant jurisdiction.",
          "The customer must respond to data subject requests unless we are legally required to respond directly.",
        ],
      },
      {
        heading: "6. Security Measures",
        paragraphs: [
          "We maintain security measures appropriate to the nature of the platform and the risk of processing. Measures may include encrypted transmission, hosted access controls, role-based permissions, authentication controls, backups, monitoring, logging, vulnerability management, environment separation and operational procedures.",
          "No internet service is completely secure. Customer responsibilities include using strong credentials, restricting user access, protecting connected email accounts, securing devices and promptly reporting suspected compromise.",
        ],
      },
      {
        heading: "7. Subprocessors",
        paragraphs: [
          "We may use subprocessors to provide hosting, storage, authentication, payments, analytics, monitoring, communications, email connectivity, AI processing, in-browser machine translation of the user interface (GTranslate / Google Translate) for display convenience only, support and other infrastructure. We will impose data protection obligations on subprocessors that are materially consistent with this DPA.",
          "Where legally required, the customer gives general authorisation for subprocessors and may request current subprocessor information. If a customer reasonably objects to a new subprocessor, the customer's remedy is to stop using the affected feature or terminate the service if we cannot reasonably resolve the objection.",
          "The translation subprocessor operates client-side on rendered page text solely to display the interface in the viewer's preferred language. It is not used to translate Customer Personal Data for storage, and translated values are not written back to the platform database.",
        ],
      },
      {
        heading: "8. International Transfers",
        paragraphs: [
          "Customer Personal Data may be processed in the United States, United Kingdom, European Economic Area and other jurisdictions where we or our subprocessors operate. Where required, transfers will rely on recognised mechanisms such as adequacy decisions, standard contractual clauses, the UK international data transfer addendum or other lawful transfer mechanisms.",
        ],
      },
      {
        heading: "9. Data Subject Requests and Regulatory Assistance",
        paragraphs: [
          "Taking into account the nature of processing and information available to us, we will provide reasonable assistance to the customer for data subject access, deletion, correction, portability, objection, restriction, security, breach, data protection impact assessment and regulator enquiries. Assistance outside standard platform functionality may be charged at reasonable rates.",
        ],
      },
      {
        heading: "10. Security Incidents",
        paragraphs: [
          "We will notify affected customers without undue delay after becoming aware of a confirmed personal data breach affecting Customer Personal Data. Notice may include available information about the nature of the incident, affected data, likely consequences, mitigation steps and recommended customer actions. The customer remains responsible for any regulator or data subject notification obligations unless the law requires us to notify directly.",
        ],
      },
      {
        heading: "11. Return, Deletion and Retention",
        paragraphs: [
          "During the account term, customers may export or delete certain data through available platform tools. After termination or verified deletion request, we will delete or return Customer Personal Data within a reasonable period unless retention is required for legal, tax, security, billing, dispute, fraud prevention, backup or compliance purposes.",
          "Backups and logs may persist for a limited period before ordinary deletion cycles complete.",
        ],
      },
      {
        heading: "12. Audits and Information",
        paragraphs: [
          "We will make available reasonable information to demonstrate compliance with this DPA. On-site audits are available only where legally required, after reasonable notice, during normal business hours, subject to confidentiality, security restrictions and reimbursement of reasonable costs. Audits must not compromise other customers, platform security or confidential information.",
        ],
      },
      {
        heading: "13. Liability and Contact",
        paragraphs: [
          "Liability under this DPA is subject to the limitations in the Platform Terms of Service and Customer Agreement, except to the extent those limitations are prohibited by applicable law.",
          ...standardContact("privacy and data processing enquiries"),
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
