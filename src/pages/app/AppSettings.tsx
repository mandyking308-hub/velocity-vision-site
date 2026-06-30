import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Mail, User, Plug, Scale, FileText } from "lucide-react";

const items = [
  { title: "Email connections", desc: "Connect Gmail or Outlook to send follow-ups", icon: Mail, to: "/app/settings/email" },
  { title: "Billing", desc: "Plan, credits, invoices", icon: CreditCard, to: "/app/billing" },
  { title: "Profile", desc: "Your details and avatar", icon: User, to: "#" },
  { title: "Integrations", desc: "Connect your CRM, calendar, social", icon: Plug, to: "#" },
  { title: "Legal", desc: "Terms, privacy and compliance acceptance", icon: Scale, to: "/portal/legal" },
  { title: "Documents", desc: "Contracts and shared files", icon: FileText, to: "/portal/documents" },
];

export default function AppSettings() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Workspace, billing, and integrations.</p>
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
    </div>
  );
}
