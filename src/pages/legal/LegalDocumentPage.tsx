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
  version: string;
  sections: LegalSection[];
};

const docs: Record<string, LegalDoc> = {
  "terms-of-service": {
    title: "Platform Terms of Service",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    version: "1.0",
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
    version: "1.0",
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
    version: "1.0",
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
    version: "1.0",
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
    version: "1.0",
    sections: [
      {
        heading: "1. Introduction",
        paragraphs: [
          "This Acceptable Use Policy (\"AUP\") outlines the permitted and prohibited uses of the Velocity Influence platform.",
          "All customers, users, and account holders must comply with this policy when using the platform to manage marketing campaigns, upload data, or access platform services.",
        ],
      },
      {
        heading: "2. Service Provider",
        paragraphs: [
          `Velocity Influence Agency is a trading name of ${ENTITY}.`,
          `Throughout this policy, references to "Velocity Influence", "the Platform", "we", "our", and "us" refer to Global Solutions Management LLC.`,
        ],
      },
      {
        heading: "3. Permitted Uses of the Platform",
        paragraphs: [
          "Customers may use the Velocity Influence platform for legitimate marketing and campaign management purposes including:",
        ],
        bullets: [
          "Managing and executing marketing campaigns across supported channels",
          "Analysing marketing performance using platform analytics and reporting tools",
          "Managing marketing contact databases and audience segments",
          "Generating campaign reports and performance dashboards",
          "Collaborating with team members and clients through platform workspaces",
        ],
      },
      {
        heading: "4. Prohibited Activities",
        paragraphs: [
          "Users may not use the platform to engage in any of the following activities:",
        ],
        bullets: [
          "Sending unsolicited spam, bulk communications, or messages that violate applicable anti-spam legislation",
          "Uploading unlawful, illegally obtained, or non-consented contact lists or marketing databases",
          "Distributing malware, viruses, harmful software, or any material intended to disrupt platform operations",
          "Conducting fraudulent, deceptive, or misleading marketing campaigns",
          "Impersonating another individual, organisation, or entity",
          "Harvesting, scraping, or collecting personal data from the platform without authorisation",
          "Infringing the intellectual property rights of any third party",
          "Using the platform in any manner that violates applicable laws or regulations",
        ],
      },
      {
        heading: "5. Marketing List Requirements",
        paragraphs: [
          "Customers uploading marketing contact lists to the platform must ensure that:",
        ],
        bullets: [
          "The data was collected lawfully and in compliance with applicable data protection laws",
          "Individuals have provided appropriate consent where required by law",
          "Marketing communications sent using the data comply with applicable regulations",
          "Contact lists do not contain information obtained through unlawful or deceptive means",
        ],
      },
      {
        heading: "6. Platform Security and Integrity",
        paragraphs: [
          "Customers must not attempt to compromise the security or integrity of the Velocity Influence platform. The following activities are strictly prohibited:",
        ],
        bullets: [
          "Accessing unauthorised areas of the platform or other users' accounts",
          "Bypassing, disabling, or circumventing platform security measures",
          "Exploiting vulnerabilities, bugs, or errors in the platform software",
          "Overloading, flooding, or deliberately disrupting system infrastructure",
          "Reverse engineering, decompiling, or attempting to extract the source code of the platform",
        ],
      },
      {
        heading: "7. Enforcement Actions",
        paragraphs: [
          "Velocity Influence reserves the right to take enforcement actions if this policy is violated. Enforcement actions may include:",
        ],
        bullets: [
          "Issuing a formal warning to the account holder",
          "Temporary suspension of platform access pending investigation",
          "Permanent termination of accounts found to be in violation",
          "Removal of unlawful data, content, or marketing materials from the platform",
          "Reporting illegal activities to relevant law enforcement or regulatory authorities where required",
        ],
      },
      {
        heading: "8. Reporting Violations",
        paragraphs: [
          "Users who become aware of any violations of this Acceptable Use Policy are encouraged to report concerns through the platform's support channels or by contacting us directly.",
          "Reports can be submitted to: compliance@velocityinfluence.com",
          "All reports will be reviewed and investigated in a timely manner. Velocity Influence may take appropriate action based on the findings of any investigation.",
        ],
      },
      {
        heading: "9. Updates to This Policy",
        paragraphs: [
          "Velocity Influence may update this Acceptable Use Policy periodically to reflect changes in platform functionality, legal requirements, or industry standards.",
          "When significant changes are made, customers will be notified via email or in-platform notification. Continued use of the platform after notification constitutes acceptance of the updated policy.",
        ],
      },
      {
        heading: "10. Contact Information",
        paragraphs: [
          "For enquiries related to this Acceptable Use Policy or platform usage, please contact us at:",
          "Global Solutions Management LLC\nTrading as Velocity Influence Agency\nState of Delaware, United States",
          "Compliance enquiries: compliance@velocityinfluence.com\nLegal enquiries: legal@velocityinfluence.com\nGeneral enquiries: hello@velocityinfluence.com",
        ],
      },
    ],
  },
  "marketing-compliance-policy": {
    title: "Marketing Compliance Policy",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    version: "1.0",
    sections: [
      {
        heading: "1. Introduction",
        paragraphs: [
          "This Marketing Compliance Policy defines the requirements customers must follow when using the Velocity Influence platform to conduct marketing campaigns.",
          "The platform provides marketing tools and campaign infrastructure, but customers are solely responsible for ensuring that their marketing activities comply with all applicable laws and regulations.",
        ],
      },
      {
        heading: "2. Service Provider",
        paragraphs: [
          `Velocity Influence Agency is a trading name of ${ENTITY}.`,
          `Throughout this policy, references to "Velocity Influence", "the Platform", "we", "our", and "us" refer to Global Solutions Management LLC.`,
        ],
      },
      {
        heading: "3. Responsibility for Marketing Activities",
        paragraphs: [
          "Customers are solely responsible for all marketing campaigns conducted through the Velocity Influence platform. This includes responsibility for:",
        ],
        bullets: [
          "Campaign messaging, content, and creative materials",
          "Marketing strategies and targeting decisions",
          "Selection and management of marketing audiences and contact lists",
          "Compliance with all applicable marketing, advertising, and data protection laws in every jurisdiction in which campaigns are conducted",
        ],
      },
      {
        heading: "4. Lawful Basis for Marketing Communications",
        paragraphs: [
          "Customers must ensure that they have a lawful basis for contacting individuals through marketing campaigns. A lawful basis may include:",
        ],
        bullets: [
          "Explicit consent obtained from the individual",
          "Legitimate interest where permitted by applicable law",
          "An existing customer or business relationship",
          "Other legal grounds recognised under applicable data protection legislation",
        ],
      },
      {
        heading: "5. Email Marketing Compliance",
        paragraphs: [
          "When conducting email campaigns through the platform, customers must comply with all applicable email marketing regulations. Examples of applicable regulations include:",
        ],
        bullets: [
          "General Data Protection Regulation (GDPR) — European Union",
          "CAN-SPAM Act — United States",
          "Privacy and Electronic Communications Regulations (PECR) — United Kingdom",
          "Canada's Anti-Spam Legislation (CASL) — Canada",
          "ePrivacy Directive — European Union",
        ],
      },
      {
        heading: "6. Data Collection Requirements",
        paragraphs: [
          "Customers must ensure that personal data used for marketing campaigns has been collected lawfully and in accordance with applicable data protection laws. This includes ensuring that:",
        ],
        bullets: [
          "Individuals were informed of how their data would be used at the point of collection",
          "Appropriate privacy notices were provided to data subjects",
          "Consent was obtained where required by applicable law",
          "Data was not obtained through deceptive, fraudulent, or unlawful means",
        ],
      },
      {
        heading: "7. Agency Responsibilities",
        paragraphs: [
          "Agencies using the Velocity Influence platform to conduct campaigns on behalf of their clients must ensure that their clients comply with all applicable marketing laws and regulations.",
          "The agency remains fully responsible for ensuring that all data uploaded to the platform on behalf of its clients is used lawfully and in compliance with this policy.",
          "Velocity Influence does not enter into contractual relationships with the agency's end clients. The agency account holder is solely responsible for all activity conducted through its account and associated workspaces.",
        ],
      },
      {
        heading: "8. Prohibited Marketing Practices",
        paragraphs: [
          "Customers may not use the Velocity Influence platform to conduct any of the following activities:",
        ],
        bullets: [
          "Sending unsolicited bulk spam communications or messages that violate anti-spam legislation",
          "Using illegally obtained or non-consented marketing databases or contact lists",
          "Conducting misleading, deceptive, or fraudulent marketing campaigns",
          "Impersonating individuals, organisations, or brands",
          "Distributing content that promotes illegal activities or violates applicable advertising standards",
          "Engaging in marketing practices that target vulnerable individuals or minors inappropriately",
        ],
      },
      {
        heading: "9. Enforcement and Suspension",
        paragraphs: [
          "Velocity Influence reserves the right to take enforcement actions against accounts that violate this Marketing Compliance Policy. Enforcement actions may include:",
        ],
        bullets: [
          "Issuing a formal warning to the account holder",
          "Suspension of active campaigns pending investigation",
          "Removal of unlawful data, content, or marketing materials from the platform",
          "Temporary or permanent suspension of platform access",
          "Termination of the customer account",
          "Reporting illegal activities to relevant regulatory or law enforcement authorities where required",
        ],
      },
      {
        heading: "10. Updates to This Policy",
        paragraphs: [
          "Velocity Influence may update this Marketing Compliance Policy periodically to reflect changes in legal requirements, industry standards, or platform functionality.",
          "When material changes are made, customers will be notified via email or in-platform notification. Continued use of the platform after notification constitutes acceptance of the updated policy.",
        ],
      },
      {
        heading: "11. Contact Information",
        paragraphs: [
          "For enquiries regarding marketing compliance or legal obligations, please contact us at:",
          "Global Solutions Management LLC\nTrading as Velocity Influence Agency\nState of Delaware, United States",
          "Compliance enquiries: compliance@velocityinfluence.com\nLegal enquiries: legal@velocityinfluence.com\nGeneral enquiries: hello@velocityinfluence.com",
        ],
      },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      {
        heading: "1. Introduction",
        paragraphs: [
          "This Cookie Policy describes how cookies and similar tracking technologies are used when individuals visit the Velocity Influence website or access the platform.",
          "Cookies help improve website functionality, analyse usage patterns, and enhance the overall user experience.",
        ],
      },
      {
        heading: "2. Service Provider",
        paragraphs: [
          `Velocity Influence Agency is a trading name of ${ENTITY}.`,
          `Throughout this policy, references to "Velocity Influence", "we", "our", and "us" refer to Global Solutions Management LLC.`,
        ],
      },
      {
        heading: "3. What Cookies Are",
        paragraphs: [
          "Cookies are small text files that are stored on a user's device (computer, tablet, or mobile phone) when they visit a website.",
          "Cookies allow websites to recognise returning visitors, store certain preferences, and collect information about how the site is used. Cookies may be set by the website itself (first-party cookies) or by third-party services operating on the website.",
        ],
      },
      {
        heading: "4. Types of Cookies We Use",
        paragraphs: [
          "The Velocity Influence website and platform may use the following types of cookies:",
        ],
        bullets: [
          "Essential cookies — required for the basic functionality of the website and platform, such as user authentication and security",
          "Functional cookies — allow the website to remember user preferences and provide enhanced, personalised features",
          "Analytics cookies — help us understand how visitors interact with the website by collecting and reporting usage data",
        ],
      },
      {
        heading: "5. Analytics Cookies",
        paragraphs: [
          "Analytics cookies help us understand how visitors interact with the Velocity Influence website. These cookies collect information such as:",
        ],
        bullets: [
          "Pages visited and content viewed",
          "Time spent on individual pages and the overall session",
          "Navigation behaviour and click patterns",
          "Referring websites or sources that directed visitors to our site",
          "General geographic location based on IP address",
        ],
      },
      {
        heading: "6. Functional Cookies",
        paragraphs: [
          "Functional cookies allow the website and platform to remember user preferences and deliver a more personalised experience. These cookies may store information such as:",
        ],
        bullets: [
          "Login session data to keep users authenticated",
          "Language and regional preferences",
          "Interface settings and display preferences",
          "Previously viewed content or selected options",
        ],
      },
      {
        heading: "7. Managing Cookie Preferences",
        paragraphs: [
          "Users can control and manage cookies through their browser settings. Most browsers allow users to:",
        ],
        bullets: [
          "Accept all cookies",
          "Block all cookies or specific categories of cookies",
          "Delete cookies that are already stored on their device",
          "Configure the browser to notify them when cookies are being set",
        ],
      },
      {
        heading: "8. Third-Party Cookies",
        paragraphs: [
          "Some cookies on the Velocity Influence website may be placed by third-party service providers that assist in delivering our platform and services. These third parties may include:",
        ],
        bullets: [
          "Analytics providers for website traffic analysis and usage reporting",
          "Performance monitoring tools for platform reliability",
          "Payment processors for subscription and billing services",
          "Social media platforms for content sharing and engagement features",
        ],
      },
      {
        heading: "9. Updates to This Policy",
        paragraphs: [
          "Velocity Influence may update this Cookie Policy periodically to reflect changes in technology, legal requirements, or the types of cookies used on the website.",
          "When significant changes are made, users will be notified via an updated notice on the website. The \"Last Updated\" date at the top of this page will be revised accordingly.",
        ],
      },
      {
        heading: "10. Contact Information",
        paragraphs: [
          "For enquiries related to cookies, website tracking technologies, or this Cookie Policy, please contact us at:",
          "Global Solutions Management LLC\nTrading as Velocity Influence Agency\nState of Delaware, United States",
          "Privacy enquiries: privacy@velocityinfluence.com\nLegal enquiries: legal@velocityinfluence.com\nGeneral enquiries: hello@velocityinfluence.com",
        ],
      },
    ],
  },
  "platform-security-policy": {
    title: "Platform Security Policy",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      {
        heading: "1. Introduction",
        paragraphs: [
          "This Platform Security Policy describes the security practices implemented to protect the Velocity Influence platform, infrastructure, and customer data.",
          "The goal is to maintain a secure and reliable platform for all customers, agencies, and users accessing Velocity Influence services.",
        ],
      },
      {
        heading: "2. Service Provider",
        paragraphs: [
          `Velocity Influence Agency is a trading name of ${ENTITY}.`,
          `Throughout this policy, references to "Velocity Influence", "the Platform", "we", "our", and "us" refer to Global Solutions Management LLC.`,
        ],
      },
      {
        heading: "3. Security Philosophy",
        paragraphs: [
          "Velocity Influence is designed with security as a core principle embedded into all aspects of platform development and operations. Our security practices focus on:",
        ],
        bullets: [
          "Protecting customer data against unauthorised access, loss, or misuse",
          "Maintaining the integrity and reliability of platform systems",
          "Preventing unauthorised access to accounts, infrastructure, and services",
          "Ensuring reliable and consistent service delivery for all customers",
          "Continuously improving security practices in response to evolving threats",
        ],
      },
      {
        heading: "4. Platform Infrastructure Security",
        paragraphs: [
          "The Velocity Influence platform is built on secure infrastructure environments designed to maintain system stability, resilience, and availability. Infrastructure protections include:",
        ],
        bullets: [
          "Secure cloud hosting environments with enterprise-grade reliability",
          "Network security controls including firewalls and traffic filtering",
          "System redundancy and failover mechanisms to minimise service disruption",
          "Infrastructure monitoring for performance and availability tracking",
          "Distributed denial-of-service (DDoS) protection measures",
          "Geographically distributed backups for disaster recovery",
        ],
      },
      {
        heading: "5. Data Protection Measures",
        paragraphs: [
          "Velocity Influence implements appropriate technical and organisational measures to protect stored and transmitted data. These measures include:",
        ],
        bullets: [
          "Encrypted data transmission using TLS 1.2 or higher for all connections",
          "Secure data storage practices with encryption at rest where appropriate",
          "Access control policies restricting data access to authorised personnel",
          "Regular security updates, patches, and vulnerability remediation",
          "Data backup procedures with encrypted storage in geographically separate locations",
        ],
      },
      {
        heading: "6. Access Control and Authentication",
        paragraphs: [
          "Platform access is protected using robust authentication and permission controls to ensure that only authorised users can access platform data and features. Access controls include:",
        ],
        bullets: [
          "Secure login authentication with password complexity requirements",
          "Multi-factor authentication (MFA) for administrative and sensitive access",
          "Role-based access permissions following the principle of least privilege",
          "Restricted access to administrative systems and internal infrastructure",
          "Session management controls including automatic timeout for inactive sessions",
        ],
      },
      {
        heading: "7. Monitoring and Threat Detection",
        paragraphs: [
          "The Velocity Influence platform uses monitoring systems designed to detect potential security threats, unusual system activity, and performance anomalies. Monitoring capabilities include:",
        ],
        bullets: [
          "Continuous system and infrastructure monitoring",
          "Intrusion detection and prevention systems",
          "Automated alerting for suspicious or anomalous activity",
          "Log collection and analysis for security investigation purposes",
          "Regular review of monitoring data to identify emerging threats",
        ],
      },
      {
        heading: "8. Incident Response",
        paragraphs: [
          "Velocity Influence maintains documented procedures to respond to potential security incidents promptly and effectively. Our incident response process includes:",
        ],
        bullets: [
          "Identification and classification of the security incident",
          "Containment measures to limit the impact of the incident",
          "Investigation and root cause analysis",
          "Remediation and recovery actions",
          "Post-incident review and implementation of preventive measures",
        ],
      },
      {
        heading: "9. Customer Security Responsibilities",
        paragraphs: [
          "Customers are responsible for maintaining the security of their own accounts and the data they manage through the platform. Customer responsibilities include:",
        ],
        bullets: [
          "Protecting login credentials and not sharing account passwords",
          "Restricting platform access to authorised personnel within their organisation",
          "Ensuring secure handling and management of their marketing data and contact lists",
          "Promptly notifying Velocity Influence if they believe their account security has been compromised",
          "Keeping their own systems and devices secure when accessing the platform",
        ],
      },
      {
        heading: "10. Updates to This Policy",
        paragraphs: [
          "Velocity Influence may update this Platform Security Policy periodically to reflect changes in security practices, technology, or regulatory requirements.",
          "When significant changes are made, customers will be notified via email or in-platform notification. The \"Last Updated\" date at the top of this page will be revised accordingly.",
        ],
      },
      {
        heading: "11. Contact Information",
        paragraphs: [
          "For security-related enquiries, vulnerability reports, or questions about this Platform Security Policy, please contact us at:",
          "Global Solutions Management LLC\nTrading as Velocity Influence Agency\nState of Delaware, United States",
          "Security enquiries: security@velocityinfluence.com\nLegal enquiries: legal@velocityinfluence.com\nGeneral enquiries: hello@velocityinfluence.com",
        ],
      },
    ],
  },
  "service-level-agreement": {
    title: "Service Level Agreement",
    effectiveDate: "1 March 2026",
    lastUpdated: "1 March 2026",
    sections: [
      {
        heading: "1. Introduction",
        paragraphs: [
          "This Service Level Agreement (\"SLA\") outlines the service standards Velocity Influence aims to maintain for customers using the platform.",
          "This agreement describes platform availability expectations, support procedures, and the shared responsibilities of both Velocity Influence and its customers.",
        ],
      },
      {
        heading: "2. Service Provider",
        paragraphs: [
          `Velocity Influence Agency is a trading name of ${ENTITY}.`,
          `Throughout this agreement, references to "Velocity Influence", "the Platform", "we", "our", and "us" refer to Global Solutions Management LLC.`,
        ],
      },
      {
        heading: "3. Platform Availability",
        paragraphs: [
          "Velocity Influence aims to maintain reliable and consistent access to the platform for all customers. Our target availability goal is:",
        ],
        bullets: [
          "99% platform uptime measured on a monthly basis",
        ],
      },
      {
        heading: "4. Scheduled Maintenance",
        paragraphs: [
          "The platform may occasionally require scheduled maintenance to maintain performance, security, and reliability. During maintenance periods:",
        ],
        bullets: [
          "Access to certain features or services may be temporarily unavailable",
          "Users may receive advance notice where possible to minimise disruption",
          "Maintenance windows are designed to occur during periods of lower platform usage",
          "Emergency maintenance may be performed without advance notice when required to address critical security or stability issues",
        ],
      },
      {
        heading: "5. Incident Response",
        paragraphs: [
          "If a platform incident occurs, Velocity Influence will take reasonable steps to investigate and resolve the issue in a timely manner. Response priorities may depend on the severity and impact of the incident. Examples of incidents include:",
        ],
        bullets: [
          "Platform outages affecting customer access to services",
          "Critical system failures impacting core platform functionality",
          "Security incidents that may affect customer data or platform integrity",
          "Significant performance degradation affecting multiple customers",
        ],
      },
      {
        heading: "6. Support Requests",
        paragraphs: [
          "Customers may submit support requests through designated support channels. Support requests may include issues related to:",
        ],
        bullets: [
          "Platform access and authentication issues",
          "Campaign management tools and workflow functionality",
          "Billing questions, invoice enquiries, and subscription management",
          "System errors, bugs, or unexpected platform behaviour",
          "Feature enquiries and usage guidance",
        ],
      },
      {
        heading: "7. Customer Responsibilities",
        paragraphs: [
          "Customers share responsibility for maintaining service reliability and ensuring a productive experience on the platform. Customers should:",
        ],
        bullets: [
          "Maintain secure login credentials and protect account access",
          "Follow all platform usage policies including the Acceptable Use Policy",
          "Report technical issues, bugs, or security concerns promptly through support channels",
          "Keep their own systems, browsers, and devices up to date when accessing the platform",
          "Provide accurate and complete information when submitting support requests",
        ],
      },
      {
        heading: "8. Service Limitations",
        paragraphs: [
          "Platform performance and availability may be affected by factors outside the control of Velocity Influence. These factors may include:",
        ],
        bullets: [
          "Internet connectivity issues affecting the customer's network or region",
          "Third-party service disruptions from providers integrated with the platform",
          "External infrastructure outages beyond the platform's hosting environment",
          "Force majeure events including natural disasters, conflicts, or government actions",
          "Customer-side hardware or software failures",
        ],
      },
      {
        heading: "9. Updates to the SLA",
        paragraphs: [
          "Velocity Influence may update this Service Level Agreement periodically to reflect improvements to platform infrastructure, changes in operational procedures, or evolving service standards.",
          "When significant updates are made, customers will be notified via email or in-platform notification. The \"Last Updated\" date at the top of this page will be revised accordingly.",
        ],
      },
      {
        heading: "10. Contact Information",
        paragraphs: [
          "For enquiries related to service reliability, platform availability, or support, please contact us at:",
          "Global Solutions Management LLC\nTrading as Velocity Influence Agency\nState of Delaware, United States",
          "Support enquiries: support@velocityinfluence.com\nLegal enquiries: legal@velocityinfluence.com\nGeneral enquiries: hello@velocityinfluence.com",
        ],
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
