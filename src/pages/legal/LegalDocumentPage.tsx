import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronRight, Mail, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ENTITY = "Global Solutions Management LLC, a company incorporated in the State of Delaware, United States, trading as Velocity Influence Agency";

type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalDoc = {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const docs: Record<string, LegalDoc> = {
  "terms-of-service": {
    title: "Platform Terms of Service",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      {
        heading: "1. Service Provider",
        paragraphs: [
          `Velocity Influence Agency is a trading name of ${ENTITY}.`,
          `Throughout this agreement, the terms "Velocity Influence", "the Platform", "we", "our", and "us" refer to Global Solutions Management LLC.`,
          `These Terms of Service ("Terms") govern your access to and use of the Velocity Influence platform, website, and all related services. By accessing or using the Platform, you agree to be bound by these Terms in their entirety.`,
        ],
      },
      {
        heading: "2. Scope of the Platform",
        paragraphs: [
          "The Platform provides marketing campaign infrastructure and tools including:",
        ],
        bullets: [
          "Marketing campaign management and execution",
          "Customer relationship management (CRM) tools",
          "Campaign analytics and performance tracking",
          "Marketing automation tools",
          "Client reporting dashboards",
        ],
      },
      {
        heading: "3. Account Registration",
        paragraphs: [
          "Users must create an account to access the Platform. By registering an account, you agree that:",
        ],
        bullets: [
          "All information provided during registration is accurate, complete, and current",
          "You will maintain the security and confidentiality of your account credentials",
          "You are responsible for all activities that occur under your account, whether or not authorised by you",
          "You will notify us immediately of any unauthorised access or use of your account",
        ],
      },
      {
        heading: "4. Customer Responsibilities",
        paragraphs: [
          "As a customer of the Platform, you agree that you are solely responsible for:",
        ],
        bullets: [
          "All marketing data uploaded to the Platform",
          "All campaign content created, distributed, or managed using the Platform",
          "Compliance with all applicable marketing, advertising, and data protection laws in the jurisdictions in which you operate",
        ],
      },
      {
        heading: "5. Agency Use of the Platform",
        paragraphs: [
          "Agencies, consultants, and marketing firms may use the Platform to manage and execute marketing campaigns on behalf of their third-party clients using the Agency Plan. In doing so:",
        ],
        bullets: [
          "The agency remains fully and solely responsible for the actions, content, and data of all client workspaces and accounts created under its agency account",
          "Velocity Influence does not enter into any contractual, legal, or commercial relationship with the agency's end clients",
          "The agency is responsible for ensuring that its clients' data and campaign materials comply with all applicable laws",
          "The agency shall indemnify Velocity Influence against any claims arising from the activities of its client accounts",
        ],
      },
      {
        heading: "6. Acceptable Use",
        paragraphs: [
          "You agree not to use the Platform to:",
        ],
        bullets: [
          "Upload, store, or distribute unlawful marketing lists or contact databases",
          "Send spam, unsolicited bulk communications, or messages that violate applicable anti-spam legislation",
          "Conduct fraudulent, deceptive, or misleading marketing campaigns",
          "Upload malicious software, viruses, harmful code, or any material intended to disrupt the operation of the Platform",
          "Harvest, scrape, or collect personal data from the Platform without authorisation",
          "Attempt to gain unauthorised access to Platform systems, other user accounts, or connected services",
          "Use the Platform in any manner that infringes the intellectual property rights of any third party",
        ],
      },
      {
        heading: "7. Intellectual Property",
        paragraphs: [
          "The Velocity Influence Platform, including all software, code, design, user interface, branding, logos, and documentation, is and remains the exclusive property of Global Solutions Management LLC and is protected by applicable intellectual property laws.",
          "Customers retain full ownership of:",
        ],
        bullets: [
          "Their campaign content and creative materials",
          "Their marketing data and uploaded assets",
          "Their contact lists and audience data",
        ],
      },
      {
        heading: "8. Platform Availability",
        paragraphs: [
          "Velocity Influence aims to provide reliable, continuous service but does not guarantee uninterrupted or error-free access to the Platform. The Platform may experience:",
        ],
        bullets: [
          "Scheduled maintenance windows (communicated in advance where practicable)",
          "Technical updates, upgrades, and improvements",
          "Temporary service interruptions due to unforeseen technical issues",
        ],
      },
      {
        heading: "9. Third-Party Services",
        paragraphs: [
          "The Platform may integrate with or depend upon third-party services, including but not limited to:",
        ],
        bullets: [
          "Payment processors (e.g. Stripe)",
          "Social media platforms",
          "Email delivery providers",
          "Analytics and tracking tools",
          "Cloud infrastructure providers",
        ],
      },
      {
        heading: "10. Limitation of Liability",
        paragraphs: [
          "Velocity Influence provides marketing tools and infrastructure but does not guarantee specific marketing outcomes, campaign performance, or commercial results.",
          "To the maximum extent permitted by applicable law, Velocity Influence's total aggregate liability shall not exceed the total amount paid by the customer in the twelve (12) months immediately preceding the event giving rise to the claim.",
          "Velocity Influence shall not be liable for:",
        ],
        bullets: [
          "Loss of profits, revenue, or anticipated savings",
          "Loss of data or data corruption",
          "Loss of business opportunity or goodwill",
          "Any indirect, incidental, special, consequential, or punitive damages, howsoever arising",
        ],
      },
      {
        heading: "11. Indemnification",
        paragraphs: [
          "You agree to indemnify, defend, and hold harmless Velocity Influence, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising from or related to:",
        ],
        bullets: [
          "Your unlawful marketing practices or non-compliance with applicable laws",
          "Your improper collection, use, or processing of personal data",
          "Your violation of applicable marketing, advertising, or data protection regulations",
          "Content you upload, create, or distribute through the Platform",
          "Your breach of these Terms",
        ],
      },
      {
        heading: "12. Termination",
        paragraphs: [
          "Velocity Influence may suspend or terminate your account and access to the Platform if:",
        ],
        bullets: [
          "You violate these Terms or any applicable Platform policies",
          "Required payments are overdue and remain unpaid after reasonable notice",
          "The Platform is being misused or used in a manner inconsistent with its intended purpose",
          "We are required to do so by law or regulatory order",
        ],
      },
      {
        heading: "13. Governing Law and Jurisdiction",
        paragraphs: [
          "These Terms of Service shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles.",
          "Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in the State of Delaware.",
        ],
      },
      {
        heading: "14. Updates to the Terms",
        paragraphs: [
          "Velocity Influence reserves the right to update, modify, or replace these Terms of Service at any time. When material changes are made, we will:",
        ],
        bullets: [
          "Post the updated Terms on the Platform with a revised effective date",
          "Notify registered users via email or in-platform notification",
        ],
      },
      {
        heading: "15. Contact Information",
        paragraphs: [
          "For legal enquiries, questions about these Terms, or to report a concern, please contact us at:",
          "Global Solutions Management LLC\nTrading as Velocity Influence Agency\nState of Delaware, United States",
          "Email: legal@velocityinfluence.com\nGeneral enquiries: hello@velocityinfluence.com",
        ],
      },
      {
        heading: "16. Acceptance",
        paragraphs: [
          "By creating an account, purchasing a subscription, or upgrading your plan, you confirm that you have read, understood, and agree to be bound by these Terms of Service.",
          "Your acceptance is recorded by the Platform, including the timestamp and associated account information, to create a verifiable legal audit trail.",
        ],
      },
    ],
  },
  "client-services-agreement": {
    title: "Client Services Agreement",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      {
        heading: "1. Service Provider",
        paragraphs: [
          `Velocity Influence Agency is a trading name of ${ENTITY}.`,
          `Throughout this agreement, the terms "Velocity Influence", "the Agency", "the Platform", "we", "our", and "us" refer to Global Solutions Management LLC.`,
          `This Client Services Agreement ("Agreement") defines the contractual relationship between Velocity Influence and customers who purchase marketing services or subscribe to the Platform.`,
        ],
      },
      {
        heading: "2. Scope of Services",
        paragraphs: [
          "Velocity Influence provides marketing services and campaign infrastructure including:",
        ],
        bullets: [
          "Marketing campaign strategy and planning",
          "Digital advertising management and optimisation",
          "Outreach campaign tools and automation",
          "Marketing automation workflows",
          "Campaign analytics, reporting, and performance dashboards",
        ],
      },
      {
        heading: "3. Customer Responsibilities",
        paragraphs: [
          "Customers are responsible for:",
        ],
        bullets: [
          "Providing accurate and complete campaign information and briefs",
          "Supplying approved marketing materials and brand assets",
          "Ensuring campaign instructions comply with applicable laws and regulations",
          "Reviewing and approving campaign deliverables in a timely manner",
        ],
      },
      {
        heading: "4. Agency Use of the Platform",
        paragraphs: [
          "Agencies and consultants may use Velocity Influence to run campaigns on behalf of their own clients. However:",
        ],
        bullets: [
          "Velocity Influence contracts only with the agency account holder",
          "Velocity Influence has no contractual relationship with the agency's end clients",
          "The agency remains fully responsible for its own client relationships, data, and compliance obligations",
          "The agency shall ensure that all data provided by its clients complies with applicable laws",
        ],
      },
      {
        heading: "5. Campaign Performance Disclaimer",
        paragraphs: [
          "Velocity Influence provides marketing strategy and campaign execution tools. Marketing outcomes depend on multiple external factors including:",
        ],
        bullets: [
          "Market conditions and competitive landscape",
          "Audience behaviour and engagement patterns",
          "Advertising platform algorithms and policy changes",
          "Quality and relevance of campaign content",
          "Budget allocation and campaign duration",
        ],
      },
      {
        heading: "6. Client Data and Marketing Lists",
        paragraphs: [
          "Customers may upload marketing lists or campaign data to the Platform. By uploading data, customers confirm that:",
        ],
        bullets: [
          "They have lawful authority to use and process the data",
          "The data was obtained in compliance with applicable marketing and data protection laws",
          "All necessary consents have been obtained from data subjects where required",
          "The data does not include information obtained through unlawful means",
        ],
      },
      {
        heading: "7. Intellectual Property and Creative Work",
        paragraphs: [
          "Customers retain ownership of:",
        ],
        bullets: [
          "Their marketing content and brand assets",
          "Campaign creative materials provided by the customer",
          "Customer data and contact lists",
        ],
      },
      {
        heading: "8. Fees and Payment Terms",
        paragraphs: [
          "Customers agree to pay all applicable fees associated with their use of the Platform and marketing services. Payments may include:",
        ],
        bullets: [
          "Monthly or annual subscription plan fees",
          "Campaign execution and management fees",
          "Additional marketing services as agreed in service orders",
          "Advertising spend passed through at cost where applicable",
        ],
      },
      {
        heading: "9. Campaign Changes and Approvals",
        paragraphs: [
          "Customers are responsible for reviewing and approving campaign materials before launch. Velocity Influence will present campaign deliverables for approval before execution where practicable.",
          "Velocity Influence is not responsible for delays caused by late approvals, incomplete briefs, or failure to provide required materials. Campaign timelines may be adjusted accordingly.",
        ],
      },
      {
        heading: "10. Confidentiality",
        paragraphs: [
          "Both parties agree to maintain the confidentiality of sensitive business information exchanged during the course of the relationship. Confidential information includes, but is not limited to:",
        ],
        bullets: [
          "Business strategies and plans",
          "Customer lists and contact data",
          "Campaign performance data and analytics",
          "Pricing, financial, and commercial terms",
          "Proprietary methodologies and processes",
        ],
      },
      {
        heading: "11. Limitation of Liability",
        paragraphs: [
          "To the maximum extent permitted by applicable law, Velocity Influence's total aggregate liability for any and all claims arising under or in connection with this Agreement shall not exceed the total fees paid by the customer during the twelve (12) months immediately preceding the event giving rise to the claim.",
          "Velocity Influence shall not be liable for:",
        ],
        bullets: [
          "Loss of profits, revenue, or anticipated savings",
          "Loss of data or data corruption",
          "Loss of business opportunity or goodwill",
          "Any indirect, incidental, special, consequential, or punitive damages, howsoever arising",
        ],
      },
      {
        heading: "12. Indemnification",
        paragraphs: [
          "Customers agree to indemnify, defend, and hold harmless Velocity Influence, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, and expenses arising from:",
        ],
        bullets: [
          "Unlawful marketing practices conducted through the Platform",
          "Improper collection, use, or processing of personal data",
          "Violations of applicable marketing, advertising, or data protection regulations",
          "Campaign content that infringes third-party rights",
        ],
      },
      {
        heading: "13. Termination of Services",
        paragraphs: [
          "Either party may terminate services in accordance with the applicable billing and subscription terms.",
          "Velocity Influence may suspend services if:",
        ],
        bullets: [
          "Payments are overdue and remain unpaid after reasonable notice",
          "Platform policies or these Terms are violated",
          "The Platform is being used in a manner inconsistent with its intended purpose",
          "Required by law or regulatory order",
        ],
      },
      {
        heading: "14. Governing Law",
        paragraphs: [
          "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles.",
          "Any disputes arising under or in connection with this Agreement shall be subject to the exclusive jurisdiction of the state and federal courts located in the State of Delaware.",
        ],
      },
      {
        heading: "15. Contact Information",
        paragraphs: [
          "For contractual or legal enquiries relating to this Agreement, please contact us at:",
          "Global Solutions Management LLC\nTrading as Velocity Influence Agency\nState of Delaware, United States",
          "Email: legal@velocityinfluence.com\nGeneral enquiries: hello@velocityinfluence.com",
        ],
      },
    ],
  },
  "data-processing-agreement": {
    title: "Data Processing Agreement",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      {
        heading: "1. Service Provider",
        paragraphs: [
          `Velocity Influence Agency is a trading name of ${ENTITY}.`,
          `For the purposes of this Data Processing Agreement ("DPA"), the terms "Velocity Influence", "the Platform", "we", "our", and "us" refer to Global Solutions Management LLC.`,
          "This DPA governs how personal data is processed within the Velocity Influence platform and forms part of the contractual agreement between Velocity Influence and its customers.",
        ],
      },
      {
        heading: "2. Definitions",
        paragraphs: [
          "The following terms have the meanings set out below, aligned with internationally recognised data protection frameworks including the GDPR, UK GDPR, and CCPA:",
        ],
        bullets: [
          "Personal Data — any information relating to an identified or identifiable natural person",
          "Processing — any operation performed on personal data, including collection, storage, use, disclosure, and deletion",
          "Data Controller — the party that determines the purposes and means of processing personal data",
          "Data Processor — the party that processes personal data on behalf of the Data Controller",
          "Subprocessor — a third party engaged by the Data Processor to assist with processing activities",
          "Data Subject — an identified or identifiable natural person whose personal data is processed",
        ],
      },
      {
        heading: "3. Roles of the Parties",
        paragraphs: [
          "The relationship between the parties for data protection purposes is as follows:",
        ],
        bullets: [
          "The customer acts as the Data Controller, determining the purposes and means of processing personal data uploaded to the Platform",
          "Velocity Influence acts as the Data Processor, processing personal data on behalf of the customer solely to deliver the Platform services",
        ],
      },
      {
        heading: "4. Scope of Data Processing",
        paragraphs: [
          "Velocity Influence processes personal data solely for the purpose of providing Platform services, including:",
        ],
        bullets: [
          "Campaign management and execution",
          "Customer relationship management (CRM) tools",
          "Marketing analytics and performance tracking",
          "Reporting dashboards and campaign insights",
        ],
      },
      {
        heading: "5. Customer Responsibilities",
        paragraphs: [
          "Customers agree that:",
        ],
        bullets: [
          "They have lawful authority to process and upload personal data to the Platform",
          "They comply with all applicable privacy and data protection laws in the jurisdictions in which they operate",
          "They maintain appropriate privacy notices and legal bases for data subjects whose data is processed through the Platform",
          "They obtain all necessary consents from data subjects where required by law",
        ],
      },
      {
        heading: "6. Security Measures",
        paragraphs: [
          "Velocity Influence implements appropriate technical and organisational measures to protect personal data against unauthorised access, loss, destruction, or damage. These measures include:",
        ],
        bullets: [
          "Encrypted data transmission using TLS 1.2 or higher",
          "Secure authentication and multi-factor access controls",
          "Role-based access control policies with the principle of least privilege",
          "Continuous system monitoring and intrusion detection",
          "Regular security updates, vulnerability assessments, and penetration testing",
          "Encrypted backups stored in geographically separate locations",
        ],
      },
      {
        heading: "7. Subprocessors",
        paragraphs: [
          "Velocity Influence may engage third-party service providers (subprocessors) to assist in delivering the Platform. Examples of subprocessors include:",
        ],
        bullets: [
          "Cloud infrastructure providers for hosting and data storage",
          "Analytics services for campaign performance measurement",
          "Payment processors for subscription and invoice management",
          "Email delivery providers for campaign communications",
        ],
      },
      {
        heading: "8. International Data Transfers",
        paragraphs: [
          "Personal data may be transferred between jurisdictions as necessary to deliver Platform services. Velocity Influence will ensure that international transfers comply with recognised safeguards, including:",
        ],
        bullets: [
          "Standard contractual clauses approved by relevant data protection authorities",
          "Adequacy decisions where applicable",
          "Other recognised international data transfer mechanisms as required by law",
        ],
      },
      {
        heading: "9. Data Breach Notification",
        paragraphs: [
          "Velocity Influence will notify customers without undue delay upon becoming aware of a security incident that may affect personal data processed on the Platform. Notification will include:",
        ],
        bullets: [
          "A description of the nature of the breach",
          "The categories and approximate number of data subjects affected",
          "The likely consequences of the breach",
          "Measures taken or proposed to address and mitigate the breach",
        ],
      },
      {
        heading: "10. Data Retention and Deletion",
        paragraphs: [
          "Personal data will be retained only as long as necessary to provide Platform services and fulfil the purposes for which it was collected.",
          "Upon account termination, customers may request deletion of their stored personal data. Velocity Influence will delete or return all personal data within 30 days of a verified request, except where retention is required by law.",
        ],
      },
      {
        heading: "11. Audit Rights",
        paragraphs: [
          "Customers may request reasonable information regarding the Platform's data protection practices to verify compliance with this DPA.",
          "Velocity Influence may provide compliance documentation, security summaries, or relevant certifications to satisfy audit requests. On-site audits may be arranged at the customer's expense with reasonable advance notice.",
        ],
      },
      {
        heading: "12. Confidentiality",
        paragraphs: [
          "All personnel handling personal data on behalf of Velocity Influence are subject to appropriate confidentiality obligations. Access to personal data is restricted to authorised personnel on a need-to-know basis.",
        ],
      },
      {
        heading: "13. Liability",
        paragraphs: [
          "Liability for data protection matters under this DPA is subject to the limitations described in the Platform Terms of Service and the Client Services Agreement.",
          "Each party shall be liable for damages caused by processing that infringes applicable data protection laws, to the extent attributable to that party's breach of its obligations.",
        ],
      },
      {
        heading: "14. Governing Law",
        paragraphs: [
          "This Data Processing Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles.",
          "Any disputes arising under or in connection with this DPA shall be subject to the exclusive jurisdiction of the state and federal courts located in the State of Delaware.",
        ],
      },
      {
        heading: "15. Contact Information",
        paragraphs: [
          "For privacy or data protection enquiries relating to this DPA, please contact us at:",
          "Global Solutions Management LLC\nTrading as Velocity Influence Agency\nState of Delaware, United States",
          "Data Protection enquiries: privacy@velocityinfluence.com\nLegal enquiries: legal@velocityinfluence.com\nGeneral enquiries: hello@velocityinfluence.com",
        ],
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      {
        heading: "1. Introduction",
        paragraphs: [
          "This Privacy Policy describes how Velocity Influence collects, uses, and protects personal information when individuals interact with our website, platform, and related services.",
          "By accessing or using the Velocity Influence platform or website, you acknowledge that you have read and understood this Privacy Policy.",
        ],
      },
      {
        heading: "2. Service Provider",
        paragraphs: [
          `Velocity Influence Agency is a trading name of ${ENTITY}.`,
          `Throughout this policy, the terms "Velocity Influence", "we", "our", and "us" refer to Global Solutions Management LLC.`,
        ],
      },
      {
        heading: "3. Information We Collect",
        paragraphs: [
          "We collect the following categories of personal data when you interact with our website or platform:",
        ],
        bullets: [
          "Contact information such as name, email address, and phone number",
          "Company and job information including company name, job title, and industry",
          "Account login information including email and password credentials",
          "Marketing campaign data uploaded by customers, including contact lists and audience segments",
          "Usage data from interactions with the platform, including pages visited, features used, and session duration",
          "Technical data such as IP address, browser type, device information, and operating system",
          "Payment and billing information processed through our payment providers",
        ],
      },
      {
        heading: "4. How We Use Information",
        paragraphs: [
          "We use the personal data we collect for the following purposes:",
        ],
        bullets: [
          "Providing access to the Velocity Influence platform and delivering our services",
          "Delivering marketing campaign services and managing campaign infrastructure",
          "Improving platform functionality, performance, and user experience",
          "Responding to enquiries, support requests, and demo bookings",
          "Communicating service updates, product announcements, and account notifications",
          "Processing payments and managing billing and subscriptions",
          "Ensuring platform security, detecting fraud, and preventing abuse",
          "Complying with applicable legal and regulatory obligations",
        ],
      },
      {
        heading: "5. Marketing Communications",
        paragraphs: [
          "You may receive communications from us related to:",
        ],
        bullets: [
          "Service updates and platform changes",
          "Account notifications and security alerts",
          "Marketing insights, industry reports, and thought leadership content",
          "Product announcements and feature releases",
        ],
      },
      {
        heading: "6. Cookies and Tracking Technologies",
        paragraphs: [
          "The Velocity Influence website uses cookies and similar technologies to:",
        ],
        bullets: [
          "Analyse website traffic and visitor behaviour",
          "Improve user experience and platform performance",
          "Remember user preferences and session settings",
          "Deliver relevant content and measure marketing effectiveness",
        ],
      },
      {
        heading: "7. Sharing of Information",
        paragraphs: [
          "We may share personal data with trusted third-party service providers who assist in delivering our platform and services. These may include:",
        ],
        bullets: [
          "Cloud infrastructure providers for hosting and data storage",
          "Analytics providers for platform usage analysis and performance monitoring",
          "Payment processors for subscription and invoice management",
          "Email delivery providers for transactional and campaign communications",
          "Professional advisors including legal, accounting, and compliance consultants",
        ],
      },
      {
        heading: "8. Data Security",
        paragraphs: [
          "Velocity Influence implements appropriate technical and organisational measures to protect personal data against unauthorised access, loss, destruction, or damage. These measures include:",
        ],
        bullets: [
          "Encrypted data transmission using TLS 1.2 or higher",
          "Secure authentication with multi-factor access controls",
          "Role-based access control systems with the principle of least privilege",
          "Continuous system monitoring and intrusion detection",
          "Regular security updates, vulnerability assessments, and penetration testing",
        ],
      },
      {
        heading: "9. International Data Transfers",
        paragraphs: [
          "Personal data may be transferred to and processed in countries outside your jurisdiction as necessary to deliver the Velocity Influence platform and services.",
          "Velocity Influence uses recognised safeguards to ensure appropriate protection of personal data during international transfers, including standard contractual clauses approved by relevant data protection authorities and adequacy decisions where applicable.",
        ],
      },
      {
        heading: "10. Data Retention",
        paragraphs: [
          "Personal data is retained only as long as necessary to fulfil the purposes for which it was collected, provide our services, or comply with applicable legal obligations.",
          "When a customer account is closed, customers may request deletion of their stored personal data. Velocity Influence will process verified deletion requests within 30 days, except where retention is required by law.",
        ],
      },
      {
        heading: "11. Your Privacy Rights",
        paragraphs: [
          "Depending on your jurisdiction, you may have the following rights regarding your personal data:",
        ],
        bullets: [
          "Right of access — to request a copy of the personal data we hold about you",
          "Right to rectification — to request correction of inaccurate or incomplete personal data",
          "Right to erasure — to request deletion of your personal data where there is no compelling reason for continued processing",
          "Right to restriction — to request that we restrict the processing of your personal data in certain circumstances",
          "Right to data portability — to request transfer of your personal data in a structured, commonly used format",
          "Right to object — to object to processing based on legitimate interests or for direct marketing purposes",
        ],
      },
      {
        heading: "12. Third-Party Links",
        paragraphs: [
          "The Velocity Influence platform and website may contain links to external websites and third-party services that are not operated or controlled by us.",
          "Velocity Influence is not responsible for the privacy practices, content, or security of third-party websites. We encourage you to review the privacy policies of any external sites you visit.",
        ],
      },
      {
        heading: "13. Updates to This Policy",
        paragraphs: [
          "Velocity Influence may update this Privacy Policy periodically to reflect changes in our practices, legal requirements, or platform functionality.",
          "When significant changes are made, we will notify registered users via email or in-platform notification and update the \"Last Updated\" date at the top of this page.",
        ],
      },
      {
        heading: "14. Contact Information",
        paragraphs: [
          "For privacy-related enquiries, data subject requests, or questions about this Privacy Policy, please contact us at:",
          "Global Solutions Management LLC\nTrading as Velocity Influence Agency\nState of Delaware, United States",
          "Privacy enquiries: privacy@velocityinfluence.com\nLegal enquiries: legal@velocityinfluence.com\nGeneral enquiries: hello@velocityinfluence.com",
        ],
      },
    ],
  },
  "acceptable-use-policy": {
    title: "Acceptable Use Policy",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Purpose", paragraphs: [`This Acceptable Use Policy ("AUP") defines the permitted and prohibited uses of the Velocity Influence platform operated by ${ENTITY}.`] },
      { heading: "2. Permitted Uses", paragraphs: ["The platform may be used for lawful marketing campaign management, audience engagement, analytics, reporting, and communication activities in accordance with your subscription agreement."] },
      { heading: "3. Prohibited Conduct", paragraphs: ["You must not use the platform to:"], bullets: ["Send spam or unsolicited communications", "Distribute malware or harmful content", "Harvest personal data without consent", "Engage in fraud or deceptive practices", "Violate any applicable laws or regulations", "Infringe intellectual property rights"] },
      { heading: "4. Content Standards", paragraphs: ["All content uploaded to or created through the platform must be lawful, not misleading, and must not contain hate speech, discriminatory material, or content that could harm minors."] },
      { heading: "5. Enforcement", paragraphs: ["We reserve the right to investigate suspected violations and take appropriate action, including suspending or terminating access, removing content, and reporting to law enforcement."] },
      { heading: "6. Reporting Violations", paragraphs: ["If you become aware of any misuse of the platform, please report it to compliance@velocityinfluence.com."] },
    ],
  },
  "marketing-compliance-policy": {
    title: "Marketing Compliance Policy",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Purpose", paragraphs: [`This Marketing Compliance Policy outlines the legal and ethical standards that all users of the Velocity Influence platform, operated by ${ENTITY}, must follow when conducting marketing campaigns.`] },
      { heading: "2. Anti-Spam Compliance", paragraphs: ["All email and messaging campaigns must comply with applicable anti-spam laws including:"], bullets: ["CAN-SPAM (United States)", "CASL (Canada)", "PECR (United Kingdom)", "ePrivacy Directive (European Union)"] },
      { heading: "3. Data Protection", paragraphs: ["Campaign activities involving personal data must comply with applicable data protection laws including GDPR, UK GDPR, and CCPA."] },
      { heading: "4. Advertising Standards", paragraphs: ["All advertising content must be truthful, not misleading, and comply with relevant advertising standards codes. Claims must be substantiated."] },
      { heading: "5. Social Media Compliance", paragraphs: ["Social media campaigns must comply with platform-specific advertising policies. Paid partnerships must be transparently disclosed."] },
      { heading: "6. Customer Responsibility", paragraphs: ["Customers are responsible for ensuring that all marketing materials, contact lists, and campaign content they provide comply with applicable laws."] },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. What Are Cookies", paragraphs: [`${ENTITY}, trading as Velocity Influence Agency, uses cookies and similar tracking technologies on our website and platform.`] },
      { heading: "2. Types of Cookies We Use", paragraphs: ["We use the following types of cookies:"], bullets: ["Essential cookies — required for platform functionality", "Performance cookies — help us understand how visitors use our site", "Functionality cookies — remember your preferences", "Targeting cookies — used to deliver relevant advertisements"] },
      { heading: "3. Third-Party Cookies", paragraphs: ["Some cookies are placed by third-party services that appear on our pages, including analytics providers and social media platforms."] },
      { heading: "4. Managing Cookies", paragraphs: ["You can control and manage cookies through your browser settings. Note that disabling certain cookies may affect platform functionality."] },
      { heading: "5. Updates to This Policy", paragraphs: ["We may update this Cookie Policy from time to time. Any changes will be posted on this page."] },
    ],
  },
  "platform-security-policy": {
    title: "Platform Security Policy",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Commitment to Security", paragraphs: [`${ENTITY} is committed to protecting the security, confidentiality, and integrity of customer data.`] },
      { heading: "2. Infrastructure Security", paragraphs: ["The platform is hosted on enterprise-grade cloud infrastructure with SOC 2 compliance."], bullets: ["Network segmentation and firewalls", "Intrusion detection systems", "DDoS protection"] },
      { heading: "3. Data Encryption", paragraphs: ["All data is encrypted in transit using TLS 1.2 or higher. Sensitive data at rest is encrypted using AES-256 encryption."] },
      { heading: "4. Access Controls", paragraphs: ["We implement role-based access control (RBAC) with the principle of least privilege. Multi-factor authentication is required for administrative access."] },
      { heading: "5. Incident Response", paragraphs: ["We maintain an incident response plan covering identification, containment, eradication, recovery, and post-incident review."] },
      { heading: "6. Security Assessments", paragraphs: ["We conduct regular vulnerability assessments and penetration testing. Practices are reviewed annually."] },
      { heading: "7. Employee Security", paragraphs: ["All employees undergo background checks and security awareness training. Access to customer data is limited to authorised personnel."] },
    ],
  },
  "service-level-agreement": {
    title: "Service Level Agreement",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Overview", paragraphs: [`This Service Level Agreement ("SLA") defines the availability and support commitments for the Velocity Influence platform operated by ${ENTITY}.`] },
      { heading: "2. Platform Availability", paragraphs: ["We target 99.9% monthly uptime for the platform, excluding scheduled maintenance windows."] },
      { heading: "3. Scheduled Maintenance", paragraphs: ["Planned maintenance windows will be communicated at least 48 hours in advance. Maintenance is typically scheduled during off-peak hours."] },
      { heading: "4. Support Response Times", paragraphs: ["Response times by priority level:"], bullets: ["Critical (platform unavailable): response within 1 hour", "High priority (major feature impaired): response within 4 hours", "Medium priority (minor feature impaired): response within 1 business day", "Low priority (general enquiry): response within 2 business days"] },
      { heading: "5. Support Channels", paragraphs: ["Support is available via in-platform messaging, email (support@velocityinfluence.com), and for Enterprise customers, dedicated account management with phone support."] },
      { heading: "6. Service Credits", paragraphs: ["If monthly uptime falls below 99.9%, customers may be eligible for service credits up to a maximum of 30% of the monthly fee."] },
      { heading: "7. Exclusions", paragraphs: ["This SLA does not apply to outages caused by factors outside our reasonable control, including force majeure events, customer equipment failures, or third-party service disruptions."] },
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

  // Open all sections by default
  useEffect(() => {
    if (doc) {
      setOpenSections(new Set(doc.sections.map((_, i) => i)));
    }
  }, [slug]);

  // Intersection observer for active TOC tracking
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
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <Link to="/legal" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
              <ArrowLeft size={14} /> Back to Legal Centre
            </Link>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">{doc.title}</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground/70">Effective Date:</span> {doc.effectiveDate}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground/70">Last Updated:</span> {doc.lastUpdated}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Global Solutions Management LLC — Delaware, United States — trading as Velocity Influence Agency
            </p>
          </motion.div>

          {/* Two-column layout */}
          <div className="flex gap-10">
            {/* Sticky sidebar TOC — hidden on small screens */}
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
                          isActive
                            ? "border-accent text-accent font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                      >
                        {s.heading}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Document content */}
            <div className="flex-1 min-w-0 max-w-[700px]">
              <div className="space-y-2">
                {doc.sections.map((s, i) => {
                  const id = slugify(s.heading);
                  const isOpen = openSections.has(i);
                  return (
                    <Collapsible key={i} open={isOpen} onOpenChange={() => toggleSection(i)}>
                      <div
                        ref={(el) => { sectionRefs.current[i] = el; }}
                        id={id}
                        className="scroll-mt-24"
                      >
                        <CollapsibleTrigger asChild>
                          <button className="w-full flex items-center gap-2 py-3 text-left group hover:text-accent transition-colors border-b border-border/30">
                            {isOpen
                              ? <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                              : <ChevronRight size={16} className="text-muted-foreground shrink-0" />}
                            <h2 className="text-base lg:text-lg font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                              {s.heading}
                            </h2>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="pt-3 pb-5 pl-6 space-y-3"
                          >
                            {s.paragraphs.map((p, pi) => (
                              <p key={pi} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                {p}
                              </p>
                            ))}
                            {s.bullets && (
                              <ul className="space-y-1.5 pl-1">
                                {s.bullets.map((b, bi) => (
                                  <li key={bi} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
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

              {/* Legal footer */}
              <div className="mt-16 pt-8 border-t border-border/50">
                <div className="flex items-start gap-3 mb-4">
                  <Building2 size={18} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Velocity Influence Agency</p>
                    <p className="text-xs text-muted-foreground">A trading name of Global Solutions Management LLC</p>
                    <p className="text-xs text-muted-foreground">Delaware, United States</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Contact for Legal Enquiries</p>
                    <p className="text-xs text-muted-foreground">legal@velocityinfluence.com</p>
                    <p className="text-xs text-muted-foreground">hello@velocityinfluence.com</p>
                  </div>
                </div>
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
