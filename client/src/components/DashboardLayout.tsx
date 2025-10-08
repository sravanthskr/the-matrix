import { Link, useLocation } from "wouter";
import { Home, Mail, MessageSquare, Key, ShieldCheck, CreditCard, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: Home, label: "Home", href: "/dashboard", section: "customization" },
  { icon: Mail, label: "Email", href: "/dashboard/email", section: "customization" },
  { icon: MessageSquare, label: "SMS", href: "/dashboard/sms", section: "customization" },
  { icon: Key, label: "API Keys", href: "/dashboard/api-keys", section: "configuration" },
  { icon: ShieldCheck, label: "Auth Token", href: "/dashboard/auth-token", section: "configuration" },
  { icon: CreditCard, label: "Plan & Billing", href: "/dashboard/billing", section: "application" },
  { icon: MessageCircle, label: "Contact Us", href: "/dashboard/contact", section: "application" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6">
          <div className="text-xl font-semibold text-sidebar-foreground">The Matrix</div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Customization
            </div>
            {menuItems.filter(item => item.section === "customization").map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Configuration
            </div>
            {menuItems.filter(item => item.section === "configuration").map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          <div>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Application
            </div>
            {menuItems.filter(item => item.section === "application").map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-2 rounded-md hover-elevate">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-semibold">
              MM
            </div>
            <div className="text-sm text-sidebar-foreground">Join our slack community</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" data-testid="button-docs">
              Docs
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-ezid">
              EZ1d.io
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">MM</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">Mike Males</div>
              <button className="text-xs text-muted-foreground hover:text-foreground" data-testid="button-logout">
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
