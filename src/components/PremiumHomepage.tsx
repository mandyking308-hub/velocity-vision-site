import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCurrency } from "@/hooks/useCurrency";
import { formatPrice, priceFor } from "@/lib/currency";
import { planSlug } from "@/lib/planIntent";
import { authNextForPlan } from "@/lib/safeNext";
import { siBuffer } from "simple-icons";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Database,
  Eye,
  FileCheck2,
  Globe2,
  History,
  Inbox,
  Languages,
  LayoutTemplate,
  Link2,
  ListChecks,
  LockKeyhole,
  Mail,
  Megaphone,
  MessageCircle,
  Newspaper,
  Play,
  Reply,
  Rocket,
  Scale,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundCheck,
  Users,
  WandSparkles,
  Clapperboard,
} from "lucide-react";
import { SIGNUP_PATH } from "@/lib/signupPath";

const capabilityCards = [
  {
    icon: Search,
    title: "Prospecting",
    copy: "Bring in approved business data and organise the people and companies you want to reach.",
  },
  {
    icon: Mail,
    title: "Personalised Outreach",
    copy: "Create editable email sequences and campaign assets from the same brief.",
  },
  {
    icon: Share2,
    title: "Social Publishing",
    copy: "Create channel-ready posts, review them, then hand approved content to Buffer for draft, queue or scheduled publishing.",
    featured: true,
  },
  {
    icon: MessageCircle,
    title: "Replies & Follow-up",
    copy: "Keep responses, reminders and early pipeline activity organised in the same workspace.",
  },
];

const flowSteps = [
  { icon: Database, title: "Your data", copy: "Connect approved sources" },
  { icon: Sparkles, title: "AI prepares", copy: "Strategy and editable assets" },
  { icon: Eye, title: "You approve", copy: "Review, edit and confirm" },
  { icon: Send, title: "You activate", copy: "Governed email or reviewed Buffer handoff" },
  { icon: FileCheck2, title: "Everything is recorded", copy: "Activity, follow-up and outcomes" },
];

const sixSteps = [
  { icon: Link2, number: "01", title: "Connect", copy: "Approved data and accounts." },
  { icon: WandSparkles, number: "02", title: "Create", copy: "Campaign strategy and assets." },
  { icon: Eye, number: "03", title: "Review", copy: "Edit and approve everything." },
  { icon: Rocket, number: "04", title: "Activate", copy: "Send governed email or hand approved social to Buffer." },
  { icon: Reply, number: "05", title: "Respond", copy: "Manage replies, reminders and follow-up." },
  { icon: BarChart3, number: "06", title: "Learn", copy: "Review outcomes and improve the next campaign." },
];

const assetTypes = [
  { icon: Target, label: "Strategy" },
  { icon: LayoutTemplate, label: "Landing & offer" },
  { icon: Mail, label: "Email sequence" },
  { icon: Newspaper, label: "Press release" },
  { icon: Share2, label: "Social pack" },
  { icon: Clapperboard, label: "Video scripts" },
  { icon: Megaphone, label: "Paid ads" },
  { icon: ListChecks, label: "Lead capture" },
];

const governanceCards = [
  { icon: ShieldCheck, title: "Review before activation", copy: "Approve every email and social draft before it moves." },
  { icon: Users, title: "Clear permissions", copy: "Keep roles, access and responsibility visible." },
  { icon: History, title: "Recorded activity", copy: "Maintain a reviewable history of key actions." },
  { icon: UserRoundCheck, title: "Human ownership", copy: "Your team owns decisions, relationships and results." },
];

const faqItems = [
  {
    q: "Is Velocity Vision AI-powered?",
    a: "Yes. AI helps prepare editable email, social, press, video and follow-up drafts and can flag data-quality issues. Customers review, edit and control every output and activation decision. Velocity Vision does not guarantee replies, sales, deliverability, compliance, pipeline or revenue.",
  },
  {
    q: "Is this a self-serve workspace?",
    a: "Yes. Customers upload authorised data, review software flags, prepare editable drafts, verify their sender, approve activation and manage follow-up from their own workspace. Velocity Vision does not provide managed campaigns.",
  },
  {
    q: "Does Velocity Vision scrape contacts or sell lists?",
    a: "No. Velocity Vision does not scrape contact data, sell lists or provide prospect databases. Customers supply their own lawfully obtained business data, maintain suppression and opt-out records, verify their sender and approve every activation.",
  },
  {
    q: "How does social publishing work?",
    a: "Connect your own Buffer account. After reviewing and editing a generated social draft, you can hand it to your Buffer account as a draft, into your queue, or scheduled for later. Velocity does not auto-publish; Buffer's own approval and channel settings still apply.",
  },
  {
    q: "What does activation mean?",
    a: "Activation is a separate customer-controlled step involving campaign content, eligible records, legal acceptance and human approval. Mailbox readiness, unsubscribe handling and daily send limits are checked again when sending.",
  },
  {
    q: "What happens when Campaign Credits run out?",
    a: "Campaign Credits currently fund full campaign-pack generation. When the balance is insufficient for a credit-priced AI action, that generation pauses until eligible credits are added or the plan changes. Live sending is governed separately by paid-plan and sender safety limits.",
  },
  {
    q: "Is Velocity Vision a CRM replacement?",
    a: "Velocity Vision records follow-up states and early opportunities but is not presented as a full CRM replacement. Customers can export records when a broader sales or CRM process is required.",
  },
  {
    q: "Does it support international customers?",
    a: "The website provides supported display currencies and multilingual access. Final currency, tax treatment, payment provider and applicable terms are confirmed before purchase. Customers remain responsible for laws applying to their own data, recipients and activity.",
  },
];

const socialDays = [
  { day: "Mon", date: "19", posts: ["LinkedIn · 09:00"] },
  { day: "Tue", date: "20", posts: ["Buffer queue · 11:30"] },
  { day: "Wed", date: "21", posts: ["Instagram · 13:00"] },
  { day: "Thu", date: "22", posts: ["Buffer queue · 14:30"] },
  { day: "Fri", date: "23", posts: ["Facebook · 10:00"] },
  { day: "Sat", date: "24", posts: [] },
  { day: "Sun", date: "25", posts: [] },
];

const sectionShell = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

function BufferMark({ size = 16 }: { size?: number }) {
  return (
    <svg role="img" aria-label="Buffer" viewBox="0 0 24 24" width={size} height={size} fill={`#${siBuffer.hex}`}>
      <path d={siBuffer.path} />
    </svg>
  );
}

function ProductDashboard() {
  return (
    <div className="rounded-[30px] border border-white/25 bg-[#111b67]/80 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
      <div className="grid grid-cols-[92px_1fr] gap-3 rounded-2xl bg-white/95 p-3 text-slate-900 sm:grid-cols-[118px_1fr] sm:p-4">
        <div className="rounded-xl bg-slate-950 p-3 text-[10px] text-white sm:text-xs">
          <p className="mb-4 font-bold">Workspace</p>
          {["Home", "Prospects", "Outreach", "Social", "Replies", "Pipeline", "Reports"].map((item) => (
            <div
              key={item}
              className={`mb-1 rounded-lg px-2 py-2 ${item === "Social" ? "bg-[#3157ff] text-white" : "text-slate-400"}`}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="min-w-0 space-y-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[
              ["Prospects", "1,248"],
              ["Emails", "8,732"],
              ["Replies", "632"],
              ["Follow-ups", "126"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-[9px] text-slate-500 sm:text-[10px]">{label}</p>
                <p className="text-base font-bold text-slate-950 sm:text-xl">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold">Upcoming social handoffs</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-1 text-[9px] font-bold text-pink-600">
                  <BufferMark size={10} /> BUFFER
                </span>
              </div>
              <div className="space-y-2">
                {["Product launch sequence", "Founder insight post", "Campaign proof point"].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-2 text-[9px] sm:text-[10px]">
                    <span className="min-w-0 truncate font-medium">{item}</span>
                    <span className="ml-2 whitespace-nowrap text-slate-500">{["09:00", "13:00", "16:30"][index]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] text-slate-500">Campaign readiness</p>
              <p className="mt-1 text-2xl font-black text-[#3157ff]">82%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[#3157ff] to-[#ff176c]" />
              </div>
              <p className="mt-3 text-[9px] leading-relaxed text-slate-500">Drafts reviewed · sender verified · Buffer connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialWorkspaceVisual() {
  return (
    <div className="relative rounded-[28px] border border-white/30 bg-white p-3 text-slate-900 shadow-2xl sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-4 text-[10px] font-semibold text-slate-500 sm:text-xs">
          <span>Create</span>
          <span className="text-[#3157ff]">Plan</span>
          <span>Drafts</span>
          <span>Campaign pack</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7ff] px-3 py-1.5 text-[10px] font-bold text-[#3157ff]">
          <BufferMark size={12} /> Buffer connected
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[210px_1fr]">
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold">Social draft</p>
            <span className="rounded-full bg-pink-100 px-2 py-1 text-[9px] font-bold text-pink-700">EDITABLE</span>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5 text-[9px]">
            {["LinkedIn", "Instagram", "Facebook", "X"].map((channel) => (
              <span key={channel} className="rounded-full border border-slate-200 bg-white px-2 py-1">{channel}</span>
            ))}
          </div>
          <div className="min-h-28 rounded-xl border border-slate-200 bg-white p-3 text-[10px] leading-relaxed text-slate-600">
            Turn one approved campaign idea into channel-ready social copy. Tailor the message, review every post and keep the whole campaign consistent.
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#3157ff] px-3 py-2.5 text-[10px] font-bold text-white shadow-lg">
            <BufferMark size={13} /> Send approved post to Buffer
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-slate-500">Choose draft, queue or scheduled handoff.</p>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">Weekly social plan</p>
              <p className="text-[9px] text-slate-500">Plan here, publish through your Buffer account</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[9px]">
              <CalendarDays size={11} /> Week
            </div>
          </div>
          <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-slate-200">
            {socialDays.map((day) => (
              <div key={day.day} className="min-h-40 border-r border-slate-200 p-1.5 last:border-r-0 sm:p-2">
                <p className="text-[8px] font-bold text-slate-500 sm:text-[9px]">{day.day}</p>
                <p className="mb-2 text-[10px] font-black sm:text-xs">{day.date}</p>
                <div className="space-y-1.5">
                  {day.posts.map((post) => (
                    <div key={post} className="rounded-lg bg-gradient-to-br from-[#eef2ff] to-[#fff0f6] p-1.5 text-[7px] font-semibold leading-tight text-slate-700 sm:text-[8px]">
                      {post}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["Reviewed", "12"],
              ["Buffer handoffs", "8"],
              ["Needs approval", "4"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <p className="text-[8px] text-slate-500 sm:text-[9px]">{label}</p>
                <p className="text-base font-black text-slate-950 sm:text-lg">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CostCalculator() {
  const { currency } = useCurrency();
  const [email, setEmail] = useState(300);
  const [prospecting, setProspecting] = useState(500);
  const [social, setSocial] = useState(400);
  const [crm, setCrm] = useState(600);

  const total = email + prospecting + social + crm;
  const growth = priceFor("vv_growth_monthly", currency).amount;
  const saving = Math.max(0, total - growth);
  const savingPct = total > 0 ? Math.max(0, Math.round((saving / total) * 100)) : 0;

  const rows = [
    ["Email outreach tools", email, setEmail],
    ["Prospecting / data tools", prospecting, setProspecting],
    ["Social publishing", social, setSocial],
    ["CRM & automation", crm, setCrm],
  ] as const;

  return (
    <section className="py-14 sm:py-16 lg:py-24">
      <div className={sectionShell}>
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#1737ff] via-[#5127df] to-[#ff176c] p-4 shadow-2xl sm:p-6 lg:p-8">
          <div className="grid items-stretch gap-5 lg:grid-cols-[0.75fr_1.05fr_0.9fr]">
            <div className="flex flex-col justify-center p-2 text-white sm:p-4">
              <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
                <Clock3 size={12} /> Calculator
              </span>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl">What is your current outreach stack costing you?</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">Enter your own monthly tool costs and compare them with the current Growth plan.</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-xl sm:p-6">
              <p className="mb-4 font-bold text-slate-950">Your current monthly spend</p>
              <div className="space-y-3">
                {rows.map(([label, value, setter]) => (
                  <label key={label} className="grid grid-cols-[1fr_110px] items-center gap-3 text-sm text-slate-600">
                    <span>{label}</span>
                    <input
                      type="number"
                      min={0}
                      value={value}
                      onChange={(event) => setter(Number(event.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right font-semibold text-slate-950 outline-none transition focus:border-[#3157ff] focus:ring-2 focus:ring-[#3157ff]/15"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="font-bold text-slate-950">Total</span>
                <span className="text-xl font-black text-[#ff176c]">{formatPrice(total, currency)} / month</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#fb1768] p-5 text-white shadow-xl sm:p-6">
              <p className="text-sm font-semibold text-white/80">Growth plan</p>
              <p className="mt-2 text-4xl font-black">{priceFor("vv_growth_monthly", currency).formatted}<span className="text-sm font-semibold text-white/70"> / month</span></p>
              <div className="my-5 h-px bg-white/20" />
              <p className="text-sm text-white/80">Illustrative difference</p>
              <p className="mt-1 text-2xl font-black">{formatPrice(saving, currency)} / month</p>
              {savingPct > 0 && <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#fb1768]">{savingPct}% lower than entered stack</span>}
              <div className="mt-5 space-y-2 text-sm text-white/90">
                {["Campaign workspace", "Email + social workflow", "One campaign-pack system"].map((item) => (
                  <p key={item} className="flex items-center gap-2"><Check size={14} /> {item}</p>
                ))}
              </div>
              <p className="mt-4 text-[10px] leading-relaxed text-white/65">Illustrative comparison only. Actual savings depend on your current tools and usage.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { currency } = useCurrency();
  const plans = [
    {
      name: "Starter",
      sku: "vv_starter_oneoff" as const,
      unit: "one-off",
      copy: "One customer-controlled campaign workflow.",
      bullets: ["25 Campaign Credits", "Full campaign pack", "Governed activation", "Up to 20 sends/day", "30 days access"],
      cta: "Buy Starter",
    },
    {
      name: "Growth",
      sku: "vv_growth_monthly" as const,
      unit: "per month",
      copy: "Ongoing self-serve activity for a growing team.",
      bullets: ["80 Campaign Credits / month", "Reusable templates", "Buffer social handoff", "Up to 50 sends/day", "Reply and pipeline states"],
      cta: "Start Growth",
      featured: true,
    },
    {
      name: "Agency Workspace",
      sku: "vv_agency_monthly" as const,
      unit: "per month",
      copy: "Isolated client workspaces with pooled credits.",
      bullets: ["250 pooled Campaign Credits", "Unlimited client workspaces", "Cross-client visibility", "Up to 100 sends/day", "Everything in Growth"],
      cta: "Start Agency Workspace",
    },
  ];

  return (
    <section className="bg-[#f7f8fc] py-16 lg:py-24">
      <div className={sectionShell}>
        <div className="mb-10 grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-pink-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-pink-700">Pricing</span>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Simple plans. Full product value.</h2>
          </div>
          <div className="lg:text-right">
            <p className="text-sm leading-relaxed text-slate-600">Start with a 14-day Free Preview — no card required, one full campaign pack, no live sending and no automatic paid upgrade.</p>
            <Button asChild variant="outline" className="mt-4 bg-white"><Link to="/pricing">See full pricing <ArrowRight size={16} /></Link></Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-[24px] border p-6 shadow-sm ${plan.featured ? "border-pink-300 bg-gradient-to-b from-[#fff3f8] to-white shadow-xl ring-1 ring-pink-200" : "border-slate-200 bg-white"}`}
            >
              {plan.featured && <span className="absolute -top-3 right-5 rounded-full bg-[#ff176c] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">Most popular</span>}
              <p className="font-bold text-slate-950">{plan.name}</p>
              <div className="mt-3">
                <span className="text-4xl font-black tracking-tight text-slate-950">{priceFor(plan.sku, currency).formatted}</span>
                <span className="ml-1 text-xs text-slate-500">{plan.unit}</span>
              </div>
              <p className="mt-3 min-h-10 text-sm leading-relaxed text-slate-600">{plan.copy}</p>
              <div className="my-5 h-px bg-slate-200" />
              <ul className="mb-6 space-y-2.5 text-sm text-slate-700">
                {plan.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#3157ff]" /> <span>{bullet}</span></li>
                ))}
              </ul>
              <Button asChild className={plan.featured ? "mt-auto bg-[#ff176c] text-white hover:bg-[#e71360]" : "mt-auto"} variant={plan.featured ? "default" : "outline"}>
                <Link to={authNextForPlan(planSlug(plan.sku))}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const left = faqItems.slice(0, 4);
  const right = faqItems.slice(4);

  const renderItems = (items: typeof faqItems, start: number) => (
    <Accordion type="single" collapsible className="rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">
      {items.map((faq, index) => (
        <AccordionItem key={faq.q} value={`faq-${start + index}`}>
          <AccordionTrigger className="text-left text-sm font-bold text-slate-900 hover:no-underline">{faq.q}</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-slate-600">{faq.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <section className="bg-[#f7f8fc] py-16 lg:py-24">
      <div className={sectionShell}>
        <div className="grid gap-8 lg:grid-cols-[0.42fr_1fr]">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3157ff]">FAQ</span>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Straight answers.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">Product control, social publishing, data, activation and billing — explained without the noise.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {renderItems(left, 0)}
            {renderItems(right, 4)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PremiumHomepage() {
  const { currency } = useCurrency();
  const currentGrowth = useMemo(() => priceFor("vv_growth_monthly", currency).formatted, [currency]);

  return (
    <div className="bg-white text-slate-950">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071a75] via-[#2636df] to-[#ff176c] pt-28 text-white lg:pt-32">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-pink-300/20 blur-3xl" />
        <div className={`${sectionShell} relative grid items-center gap-10 pb-16 pt-8 lg:grid-cols-[0.8fr_1.2fr] lg:pb-24 lg:pt-12`}>
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur">
              <Sparkles size={12} /> Customer-controlled campaign workspace
            </span>
            <h1 className="text-4xl font-black leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-6xl xl:text-7xl">
              Find prospects.<br />
              Create outreach.<br />
              <span className="text-[#ff9fc5]">Publish social.</span><br />
              Manage replies.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              One customer-controlled workspace for approved prospect data, personalised email, social campaign creation through Buffer and follow-up.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white font-bold text-[#10228c] hover:bg-white/90">
                <Link to={SIGNUP_PATH}>Start free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/5 font-bold text-white hover:bg-white/10 hover:text-white">
                <Link to="/how-it-works"><Play size={15} /> See how it works</Link>
              </Button>
            </div>
            <p className="mt-5 flex max-w-lg items-start gap-2 text-xs leading-relaxed text-white/70">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" />
              You control what gets approved, sent and handed to Buffer for publishing.
            </p>
          </div>
          <ProductDashboard />
        </div>
      </section>

      <section className="relative -mt-1 bg-[#f7f8fc] py-10 sm:py-12 lg:py-14">
        <div className={sectionShell}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {capabilityCards.map((card) => (
              <div
                key={card.title}
                className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${card.featured ? "border-pink-300 bg-gradient-to-br from-[#fff7fb] to-white ring-1 ring-pink-200" : "border-slate-200 bg-white"}`}
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${card.featured ? "bg-pink-100 text-[#ff176c]" : "bg-[#eef2ff] text-[#3157ff]"}`}>
                  <card.icon size={20} />
                </div>
                <h2 className="text-base font-black text-slate-950">{card.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className={sectionShell}>
          <div className="mx-auto max-w-4xl text-center">
            <span className="mb-3 inline-flex rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3157ff]">Control</span>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">One self-serve product. Clear responsibility at every step.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">AI prepares the work. Your team reviews it. Activation stays explicit. The record stays visible.</p>
          </div>
          <div className="mt-10 grid gap-3 lg:grid-cols-5">
            {flowSteps.map((step, index) => (
              <div key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#eef2ff] to-[#fff0f6] text-[#3157ff]">
                  <step.icon size={19} />
                </div>
                <h3 className="text-sm font-black text-slate-950">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.copy}</p>
                {index < flowSteps.length - 1 && <span className="absolute -right-2 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-300 shadow lg:flex">→</span>}
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-slate-500"><LockKeyhole size={12} className="mr-1 inline" /> You stay in control. Activity is reviewable and auditable.</p>
        </div>
      </section>

      <section className="bg-[#f7f8fc] py-16 sm:py-20 lg:py-24">
        <div className={sectionShell}>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="mb-3 inline-flex rounded-full bg-pink-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-pink-700">Workflow</span>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">From prospect to conversation.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">One campaign moves through a clear sequence instead of bouncing between disconnected tools.</p>
            </div>
            <Button asChild variant="outline" className="hidden bg-white sm:inline-flex"><Link to="/how-it-works">See the full workflow <ArrowRight size={15} /></Link></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {sixSteps.map((step) => (
              <div key={step.number} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black text-[#3157ff]">{step.number}</p>
                <step.icon size={20} className="mt-4 text-[#3157ff]" />
                <h3 className="mt-4 text-sm font-black text-slate-950">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className={sectionShell}>
          <div className="overflow-hidden rounded-[34px] bg-gradient-to-r from-[#0c2ee8] via-[#3432e8] to-[#ff176c] p-5 text-white shadow-2xl sm:p-8 lg:p-10">
            <div className="grid items-center gap-10 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em]">
                  <BufferMark size={13} /> Social + Buffer
                </span>
                <h2 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">Plan social in Velocity. Publish through Buffer.</h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">Create channel-ready posts from the same campaign brief, review them here, then hand approved content to your Buffer account as a draft, into the queue or scheduled for later.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {[
                    "Create a complete multi-channel social pack",
                    "Tailor copy for LinkedIn, Instagram, Facebook and X",
                    "Review and edit every post before handoff",
                    "Keep social aligned with email, PR, video and paid assets",
                    "Choose Buffer draft, queue or scheduled handoff",
                    "Retain customer control over final publishing",
                  ].map((item) => (
                    <p key={item} className="flex items-start gap-2 text-sm text-white/90"><Check size={15} className="mt-0.5 shrink-0 text-[#ffb2d0]" /> {item}</p>
                  ))}
                </div>
                <Button asChild className="mt-7 bg-white font-bold text-[#172bbd] hover:bg-white/90"><Link to="/features">Explore social workflow <ArrowRight size={15} /></Link></Button>
                <p className="mt-4 max-w-lg text-[10px] leading-relaxed text-white/65">Velocity hands reviewed text to your connected Buffer account. Buffer controls final channel publishing, approvals and channel settings.</p>
              </div>
              <SocialWorkspaceVisual />
            </div>

            <div className="mt-9 border-t border-white/20 pt-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black">One brief. A complete campaign pack.</p>
                  <p className="mt-1 text-xs text-white/70">Build the whole campaign together so every channel carries the same message.</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold">8 editable asset types</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                {assetTypes.map((asset) => (
                  <div key={asset.label} className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                    <asset.icon size={16} className="mb-2 text-white" />
                    <p className="text-[11px] font-bold leading-tight">{asset.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className={sectionShell}>
          <div className="grid gap-8 lg:grid-cols-[0.56fr_1fr] lg:items-center">
            <div>
              <span className="mb-3 inline-flex rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3157ff]">Governance</span>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">AI moves quickly. Your team stays in control.</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">Review, permissions and recorded activity keep campaign decisions visible to the people responsible for them.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {governanceCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-slate-200 bg-[#fafbff] p-5 shadow-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#3157ff] shadow-sm"><card.icon size={19} /></div>
                  <h3 className="text-sm font-black text-slate-950">{card.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{card.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CostCalculator />

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className={sectionShell}>
          <div className="grid gap-8 lg:grid-cols-[0.48fr_1fr] lg:items-center">
            <div>
              <span className="mb-3 inline-flex rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3157ff]">Connections</span>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Connect the tools and channels you already use.</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">Bring email, Buffer and follow-up into one customer-controlled campaign workflow.</p>
            </div>
            <div className="rounded-[26px] border border-slate-200 bg-[#f8f9fd] p-5 shadow-sm sm:p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Email</p>
                  <div className="flex flex-wrap gap-2">
                    {["Verified sender", "Connected mailbox", "Unsubscribe controls"].map((label) => <span key={label} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">{label}</span>)}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Social + Buffer</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700"><BufferMark size={12} /> Buffer</span>
                    <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">Channel-ready posts</span>
                    <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">Draft / queue / schedule</span>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Workflow</p>
                  <div className="flex flex-wrap gap-2">
                    {["Data Vault", "Early pipeline", "Exports"].map((label) => <span key={label} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">{label}</span>)}
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-white p-4"><Inbox size={18} className="text-[#3157ff]" /><div><p className="text-xs font-black">One workspace</p><p className="text-[10px] text-slate-500">Campaign creation, activation and follow-up.</p></div></div>
                <div className="flex items-center gap-3 rounded-xl bg-white p-4"><ShieldCheck size={18} className="text-[#3157ff]" /><div><p className="text-xs font-black">Controlled activation</p><p className="text-[10px] text-slate-500">Customer approval remains explicit.</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#fafbff] via-white to-[#fff2f8] py-16 sm:py-20 lg:py-24">
        <div className={sectionShell}>
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr] lg:items-center">
            <div>
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3157ff] shadow-sm"><Globe2 size={12} /> Global by default</span>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Built for teams working across markets.</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">Multilingual access, supported display currencies and an international legal document stack help teams work across markets from the same product.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                [Languages, "Multilingual access", "Automated translation where available"],
                [CreditCard, "Multi-currency pricing", "GBP, USD, EUR, CAD, AUD and MXN"],
                [Scale, "International legal stack", "English legal version controls"],
                [Globe2, "Global workspace", "Accessible to international customers"],
                [ShieldCheck, "Customer controlled", "Local legal responsibility remains yours"],
                [Users, "Businesses + agencies", "Workflows for direct teams and client work"],
              ].map(([Icon, title, copy]) => {
                const Comp = Icon as typeof Globe2;
                return (
                  <div key={title as string} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <Comp size={17} className="text-[#3157ff]" />
                    <p className="mt-3 text-xs font-black text-slate-950">{title as string}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{copy as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <PricingSection />
      <FAQSection />

      <section className="bg-white py-10 sm:py-12">
        <div className={sectionShell}>
          <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#1138ff] via-[#4d2ce7] to-[#ff176c] px-6 py-9 text-white shadow-2xl sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:px-12 lg:py-11">
            <div>
              <p className="text-3xl font-black leading-tight sm:text-4xl">One workspace instead of a stack of disconnected tools.</p>
              <p className="mt-2 text-sm text-white/75">Find. Create. Approve. Send. Publish through Buffer. Follow up.</p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-0 lg:justify-end">
              <Button asChild size="lg" className="bg-white font-black text-[#172bbd] hover:bg-white/90"><Link to={SIGNUP_PATH}>Start free</Link></Button>
              <div className="text-[10px] leading-relaxed text-white/65">14-day preview · no card required<br />Growth from {currentGrowth}/month</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
