import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const ENTITY = "Global Solutions Management LLC, a company incorporated in the State of Delaware, United States, trading as Velocity Influence Agency";

const docs: Record<string, { title: string; lastUpdated: string; sections: { heading: string; content: string }[] }> = {
  "terms-of-service": {
    title: "Platform Terms of Service",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Service Provider", content: `Velocity Influence Agency is a trading name of ${ENTITY}. Throughout this agreement, the terms "Velocity Influence", "the Platform", "we", "our", and "us" refer to Global Solutions Management LLC. These Terms of Service ("Terms") govern your access to and use of the Velocity Influence platform, website, and all related services. By accessing or using the Platform, you agree to be bound by these Terms in their entirety.` },
      { heading: "2. Scope of the Platform", content: "The Platform provides marketing campaign infrastructure and tools including: marketing campaign management and execution; customer relationship management (CRM) tools; campaign analytics and performance tracking; marketing automation tools; and client reporting dashboards. The Platform may be used by businesses running their own marketing campaigns, as well as by agencies or consultants running campaigns on behalf of their clients." },
      { heading: "3. Account Registration", content: "Users must create an account to access the Platform. By registering an account, you agree that: all information provided during registration is accurate, complete, and current; you will maintain the security and confidentiality of your account credentials; you are responsible for all activities that occur under your account, whether or not authorised by you; and you will notify us immediately of any unauthorised access or use of your account. Velocity Influence reserves the right to suspend or terminate accounts that violate these Terms or Platform rules, at our sole discretion." },
      { heading: "4. Customer Responsibilities", content: "As a customer of the Platform, you agree that you are solely responsible for: all marketing data uploaded to the Platform; all campaign content created, distributed, or managed using the Platform; compliance with all applicable marketing, advertising, and data protection laws in the jurisdictions in which you operate. You must ensure that any personal data used in connection with campaigns conducted through the Platform has been obtained lawfully and that you have all necessary consents, permissions, and legal bases to process such data for marketing purposes." },
      { heading: "5. Agency Use of the Platform", content: "Agencies, consultants, and marketing firms may use the Platform to manage and execute marketing campaigns on behalf of their third-party clients using the Agency Plan. In doing so: the agency remains fully and solely responsible for the actions, content, and data of all client workspaces and accounts created under its agency account; Velocity Influence does not enter into any contractual, legal, or commercial relationship with the agency's end clients; the agency is responsible for ensuring that its clients' data and campaign materials comply with all applicable laws; and the agency shall indemnify Velocity Influence against any claims arising from the activities of its client accounts." },
      { heading: "6. Acceptable Use", content: "You agree not to use the Platform to: upload, store, or distribute unlawful marketing lists or contact databases; send spam, unsolicited bulk communications, or messages that violate applicable anti-spam legislation; conduct fraudulent, deceptive, or misleading marketing campaigns; upload malicious software, viruses, harmful code, or any material intended to disrupt the operation of the Platform; harvest, scrape, or collect personal data from the Platform without authorisation; attempt to gain unauthorised access to Platform systems, other user accounts, or connected services; or use the Platform in any manner that infringes the intellectual property rights of any third party. Accounts found to be in violation of these rules may be immediately suspended or permanently terminated without prior notice." },
      { heading: "7. Intellectual Property", content: "The Velocity Influence Platform, including all software, code, design, user interface, branding, logos, and documentation, is and remains the exclusive property of Global Solutions Management LLC and is protected by applicable intellectual property laws. No rights in the Platform are transferred to you other than the limited right to use the Platform in accordance with these Terms. Customers retain full ownership of: their campaign content and creative materials; their marketing data and uploaded assets; their contact lists and audience data. By uploading content to the Platform, you grant Velocity Influence a limited, non-exclusive, royalty-free licence to process, store, and transmit this data solely for the purpose of providing the Platform services. This licence terminates when you delete the content or close your account." },
      { heading: "8. Platform Availability", content: "Velocity Influence aims to provide reliable, continuous service but does not guarantee uninterrupted or error-free access to the Platform. The Platform may experience: scheduled maintenance windows (communicated in advance where practicable); technical updates, upgrades, and improvements; and temporary service interruptions due to unforeseen technical issues. Velocity Influence will take commercially reasonable steps to minimise downtime and will endeavour to provide advance notice of scheduled maintenance. Platform availability commitments for paying customers are set out in the Service Level Agreement." },
      { heading: "9. Third-Party Services", content: "The Platform may integrate with or depend upon third-party services, including but not limited to: payment processors (e.g. Stripe); social media platforms; email delivery providers; analytics and tracking tools; and cloud infrastructure providers. Velocity Influence is not responsible for the performance, availability, or security of third-party services. Your use of third-party services may be subject to additional terms and conditions imposed by the relevant provider." },
      { heading: "10. Limitation of Liability", content: "Velocity Influence provides marketing tools and infrastructure but does not guarantee specific marketing outcomes, campaign performance, or commercial results. Marketing outcomes depend on many factors outside our control, including market conditions, audience behaviour, and the quality of campaign content. To the maximum extent permitted by applicable law: Velocity Influence's total aggregate liability for any and all claims arising under or in connection with these Terms shall not exceed the total amount paid by the customer to Velocity Influence in the twelve (12) months immediately preceding the event giving rise to the claim. Velocity Influence shall not be liable for: loss of profits, revenue, or anticipated savings; loss of data or data corruption; loss of business opportunity or goodwill; or any indirect, incidental, special, consequential, or punitive damages, howsoever arising." },
      { heading: "11. Indemnification", content: "You agree to indemnify, defend, and hold harmless Velocity Influence, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising from or related to: your unlawful marketing practices or non-compliance with applicable laws; your improper collection, use, or processing of personal data; your violation of applicable marketing, advertising, or data protection regulations; content you upload, create, or distribute through the Platform; or your breach of these Terms." },
      { heading: "12. Termination", content: "Velocity Influence may suspend or terminate your account and access to the Platform if: you violate these Terms or any applicable Platform policies; required payments are overdue and remain unpaid after reasonable notice; the Platform is being misused or used in a manner inconsistent with its intended purpose; or we are required to do so by law or regulatory order. Customers may cancel their accounts at any time in accordance with the applicable billing terms. Upon termination: your right to access and use the Platform ceases immediately; you may request a copy of your data within 30 days of termination; after 30 days, your data may be permanently deleted." },
      { heading: "13. Governing Law and Jurisdiction", content: "These Terms of Service shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in the State of Delaware." },
      { heading: "14. Updates to the Terms", content: "Velocity Influence reserves the right to update, modify, or replace these Terms of Service at any time. When material changes are made, we will: post the updated Terms on the Platform with a revised effective date; notify registered users via email or in-platform notification. Your continued use of the Platform following the posting of revised Terms constitutes your acceptance of those changes. If you do not agree with the updated Terms, you must discontinue use of the Platform." },
      { heading: "15. Contact Information", content: "For legal enquiries, questions about these Terms, or to report a concern, please contact us at:\n\nGlobal Solutions Management LLC\nTrading as Velocity Influence Agency\nState of Delaware, United States\n\nEmail: legal@velocityinfluence.com\nGeneral enquiries: hello@velocityinfluence.com" },
      { heading: "16. Acceptance", content: "By creating an account, purchasing a subscription, or upgrading your plan, you confirm that you have read, understood, and agree to be bound by these Terms of Service. Your acceptance is recorded by the Platform, including the timestamp and associated account information, to create a verifiable legal audit trail." },
    ],
  },
  "client-services-agreement": {
    title: "Client Services Agreement",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Parties", content: `This Client Services Agreement ("Agreement") is entered into between ${ENTITY} ("Service Provider") and the customer ("Client") identified in the applicable order form or subscription agreement.` },
      { heading: "2. Scope of Services", content: "The Service Provider agrees to provide marketing campaign management, analytics, reporting, and related professional services as described in the applicable service order. Services may include campaign strategy, execution, performance monitoring, and reporting." },
      { heading: "3. Client Obligations", content: "The Client agrees to provide accurate information, timely feedback, and necessary access to assets and materials required for campaign execution. The Client is responsible for ensuring that all materials provided comply with applicable laws." },
      { heading: "4. Fees and Payment", content: "Fees for services are as set out in the applicable order form or subscription plan. Payments are due within 30 days of invoice date unless otherwise agreed. Late payments may incur interest at 1.5% per month." },
      { heading: "5. Confidentiality", content: "Both parties agree to maintain the confidentiality of any proprietary or confidential information disclosed during the term of this Agreement. This obligation survives termination for a period of two years." },
      { heading: "6. Term and Termination", content: "This Agreement is effective from the date of acceptance and continues for the initial term specified in the order form. Either party may terminate with 30 days written notice. Early termination may be subject to fees for committed services." },
      { heading: "7. Warranties and Disclaimers", content: "The Service Provider warrants that services will be performed in a professional and workmanlike manner. Except as expressly stated, all warranties are disclaimed to the maximum extent permitted by law." },
      { heading: "8. Indemnification", content: "Each party agrees to indemnify and hold harmless the other party from any claims, damages, or expenses arising from a breach of this Agreement or negligent acts." },
    ],
  },
  "data-processing-agreement": {
    title: "Data Processing Agreement",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Purpose", content: `This Data Processing Agreement ("DPA") sets out the terms under which ${ENTITY} ("Processor") processes personal data on behalf of the customer ("Controller") in connection with the provision of marketing services.` },
      { heading: "2. Definitions", content: "\"Personal Data\", \"Processing\", \"Data Subject\", \"Controller\", and \"Processor\" have the meanings given to them under applicable data protection legislation, including the GDPR, UK GDPR, and CCPA where applicable." },
      { heading: "3. Processing Instructions", content: "The Processor shall process personal data only on documented instructions from the Controller, except where required by applicable law. Processing activities include campaign targeting, analytics, and communication delivery." },
      { heading: "4. Security Measures", content: "The Processor implements appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including encryption of data in transit and at rest, access controls, and regular security assessments." },
      { heading: "5. Sub-processors", content: "The Processor may engage sub-processors to assist with processing. The Controller will be notified of new sub-processors and may object within 14 days. Current sub-processors include cloud hosting and analytics providers." },
      { heading: "6. Data Subject Rights", content: "The Processor shall assist the Controller in responding to data subject requests, including rights of access, rectification, erasure, and portability, within the timeframes required by law." },
      { heading: "7. Data Breach Notification", content: "The Processor shall notify the Controller without undue delay upon becoming aware of a personal data breach, and shall provide sufficient information to enable the Controller to meet its notification obligations." },
      { heading: "8. Data Retention", content: "Personal data will be retained only for as long as necessary to fulfil the purposes of processing. Upon termination of the Agreement, the Processor shall delete or return all personal data within 30 days." },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Introduction", content: `${ENTITY} ("we", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your personal information when you use our platform and services.` },
      { heading: "2. Information We Collect", content: "We collect information you provide directly (name, email, company details, payment information), information collected automatically (IP address, browser type, usage data), and information from third parties (social media platforms, analytics providers)." },
      { heading: "3. How We Use Your Information", content: "We use your information to provide and improve our services, process payments, communicate with you, personalise your experience, ensure security, comply with legal obligations, and for analytics and research." },
      { heading: "4. Legal Basis for Processing", content: "We process personal data on the following legal bases: performance of a contract, legitimate interests, consent (where applicable), and compliance with legal obligations." },
      { heading: "5. Data Sharing", content: "We may share your information with service providers who assist in platform operations, professional advisors, law enforcement when required by law, and in connection with business transfers. We do not sell your personal data." },
      { heading: "6. International Transfers", content: "Your data may be transferred to and processed in countries outside your jurisdiction. We ensure appropriate safeguards are in place, including standard contractual clauses where required." },
      { heading: "7. Your Rights", content: "Depending on your jurisdiction, you may have rights to access, correct, delete, restrict processing of, or port your data. You may also withdraw consent or object to processing. Contact us to exercise your rights." },
      { heading: "8. Data Retention", content: "We retain personal data for as long as necessary to fulfil the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements." },
      { heading: "9. Contact", content: "For privacy enquiries, contact our Data Protection Officer at privacy@velocityinfluence.com or write to Global Solutions Management LLC, Delaware, United States." },
    ],
  },
  "acceptable-use-policy": {
    title: "Acceptable Use Policy",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Purpose", content: `This Acceptable Use Policy ("AUP") defines the permitted and prohibited uses of the Velocity Influence platform operated by ${ENTITY}.` },
      { heading: "2. Permitted Uses", content: "The platform may be used for lawful marketing campaign management, audience engagement, analytics, reporting, and communication activities in accordance with your subscription agreement." },
      { heading: "3. Prohibited Conduct", content: "You must not use the platform to: send spam or unsolicited communications; distribute malware or harmful content; harvest personal data without consent; engage in fraud or deceptive practices; violate any applicable laws or regulations; infringe intellectual property rights." },
      { heading: "4. Content Standards", content: "All content uploaded to or created through the platform must be lawful, not misleading, and must not contain hate speech, discriminatory material, or content that could harm minors." },
      { heading: "5. Enforcement", content: "We reserve the right to investigate suspected violations and take appropriate action, including suspending or terminating access, removing content, and reporting to law enforcement where necessary." },
      { heading: "6. Reporting Violations", content: "If you become aware of any misuse of the platform, please report it to compliance@velocityinfluence.com." },
    ],
  },
  "marketing-compliance-policy": {
    title: "Marketing Compliance Policy",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Purpose", content: `This Marketing Compliance Policy outlines the legal and ethical standards that all users of the Velocity Influence platform, operated by ${ENTITY}, must follow when conducting marketing campaigns.` },
      { heading: "2. Anti-Spam Compliance", content: "All email and messaging campaigns must comply with applicable anti-spam laws including CAN-SPAM (US), CASL (Canada), PECR (UK), and the ePrivacy Directive (EU). Recipients must have provided valid consent or have an existing business relationship." },
      { heading: "3. Data Protection", content: "Campaign activities involving personal data must comply with applicable data protection laws including GDPR, UK GDPR, and CCPA. Appropriate consent must be obtained before collecting or processing personal data for marketing purposes." },
      { heading: "4. Advertising Standards", content: "All advertising content must be truthful, not misleading, and comply with relevant advertising standards codes. Claims must be substantiated. Sponsored content and advertisements must be clearly identifiable as such." },
      { heading: "5. Social Media Compliance", content: "Social media campaigns must comply with platform-specific advertising policies and applicable influencer marketing disclosure requirements. Paid partnerships must be transparently disclosed." },
      { heading: "6. Customer Responsibility", content: "Customers are responsible for ensuring that all marketing materials, contact lists, and campaign content they provide or upload comply with applicable laws. We reserve the right to refuse to distribute non-compliant content." },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. What Are Cookies", content: `${ENTITY}, trading as Velocity Influence Agency, uses cookies and similar tracking technologies on our website and platform. Cookies are small text files stored on your device that help us provide and improve our services.` },
      { heading: "2. Types of Cookies We Use", content: "We use: Essential cookies (required for platform functionality), Performance cookies (help us understand how visitors use our site), Functionality cookies (remember your preferences), and Targeting cookies (used to deliver relevant advertisements)." },
      { heading: "3. Third-Party Cookies", content: "Some cookies are placed by third-party services that appear on our pages, including analytics providers (e.g. Google Analytics), social media platforms, and advertising networks." },
      { heading: "4. Managing Cookies", content: "You can control and manage cookies through your browser settings. Most browsers allow you to refuse or delete cookies. Note that disabling certain cookies may affect the functionality of the platform." },
      { heading: "5. Updates to This Policy", content: "We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date." },
    ],
  },
  "platform-security-policy": {
    title: "Platform Security Policy",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Commitment to Security", content: `${ENTITY} is committed to protecting the security, confidentiality, and integrity of customer data processed through the Velocity Influence platform.` },
      { heading: "2. Infrastructure Security", content: "The platform is hosted on enterprise-grade cloud infrastructure with SOC 2 compliance. We employ network segmentation, firewalls, intrusion detection systems, and DDoS protection." },
      { heading: "3. Data Encryption", content: "All data is encrypted in transit using TLS 1.2 or higher. Sensitive data at rest is encrypted using AES-256 encryption. Database backups are encrypted and stored in geographically separate locations." },
      { heading: "4. Access Controls", content: "We implement role-based access control (RBAC) with the principle of least privilege. Multi-factor authentication is required for administrative access. All access is logged and monitored." },
      { heading: "5. Incident Response", content: "We maintain an incident response plan that includes procedures for identification, containment, eradication, recovery, and post-incident review. Customers will be notified of security incidents affecting their data." },
      { heading: "6. Security Assessments", content: "We conduct regular vulnerability assessments and penetration testing. Our security practices are reviewed and updated annually to reflect evolving threats and industry best practices." },
      { heading: "7. Employee Security", content: "All employees undergo background checks and security awareness training. Access to customer data is limited to authorised personnel on a need-to-know basis." },
    ],
  },
  "service-level-agreement": {
    title: "Service Level Agreement",
    lastUpdated: "1 March 2026",
    sections: [
      { heading: "1. Overview", content: `This Service Level Agreement ("SLA") defines the availability and support commitments for the Velocity Influence platform operated by ${ENTITY}.` },
      { heading: "2. Platform Availability", content: "We target 99.9% monthly uptime for the platform, excluding scheduled maintenance windows. Uptime is measured as the percentage of time the platform is accessible and operational during a calendar month." },
      { heading: "3. Scheduled Maintenance", content: "Planned maintenance windows will be communicated at least 48 hours in advance via email notification. Maintenance is typically scheduled during off-peak hours to minimise impact." },
      { heading: "4. Support Response Times", content: "Critical issues (platform unavailable): response within 1 hour. High priority (major feature impaired): response within 4 hours. Medium priority (minor feature impaired): response within 1 business day. Low priority (general enquiry): response within 2 business days." },
      { heading: "5. Support Channels", content: "Support is available via in-platform messaging, email (support@velocityinfluence.com), and for Enterprise customers, dedicated account management with phone support." },
      { heading: "6. Service Credits", content: "If monthly uptime falls below 99.9%, customers may be eligible for service credits. Credits are calculated as a percentage of the monthly fee proportional to the downtime experienced, up to a maximum of 30% of the monthly fee." },
      { heading: "7. Exclusions", content: "This SLA does not apply to outages caused by factors outside our reasonable control, including force majeure events, customer equipment failures, or third-party service disruptions." },
    ],
  },
};

const LegalDocumentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const doc = slug ? docs[slug] : null;

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
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/legal" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
              <ArrowLeft size={14} /> Back to Legal Centre
            </Link>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">{doc.title}</h1>
            <p className="text-sm text-muted-foreground mt-2">Last updated: {doc.lastUpdated}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Global Solutions Management LLC — Delaware, United States — trading as Velocity Influence Agency
            </p>
          </motion.div>

          <div className="mt-10 space-y-8">
            {doc.sections.map((s, i) => (
              <motion.section key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.03 }}>
                <h2 className="text-lg font-display font-semibold text-foreground mb-2">{s.heading}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
              </motion.section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalDocumentPage;
