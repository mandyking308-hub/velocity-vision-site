import { Link } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Mail, Briefcase, Scale } from "lucide-react";
import BookingLinkSettings from "@/components/app/BookingLinkSettings";

const items = [
  { title: "Email connections", desc: "Connect your sender and verify SPF / DKIM for deliverability.", icon: Mail, to: "/app/settings/email" },
  { title: "Billing & credits", desc: "Plan, credit balance, invoices, top-ups.", icon: CreditCard, to: "/app/billing" },
  { title: "Workspaces", desc: "Create or switch client workspaces.", icon: Briefcase, to: "/app/workspaces" },
  { title: "Legal Centre", desc: "Terms, privacy, compliance and current acceptance status.", icon: Scale, to: "/legal" },
];

export default function AppSettings() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Workspace, billing, sender and legal.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((i) => (
          <Link key={i.title} to={i.to}>
            <Card className="h-full hover:shadow-md transition">
              <CardHeader>
                <i.icon className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{i.title}</CardTitle>
                <CardDescription>{i.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <BookingLinkSettings />
    </div>
  );
}
