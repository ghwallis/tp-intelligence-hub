import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  FileText,
  BarChart2,
  Scale,
  Brain,
  ShieldCheck,
  GitBranch,
  Network,
  Workflow,
  Clock,
  Users as UsersIcon,
  Settings as SettingsIcon,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Document Upload",
    href: "/documents/upload",
    icon: Upload,
  },
  {
    title: "Document Processing",
    href: "/documents/processing",
    icon: FileSpreadsheet,
  },
  {
    title: "Controversy Management",
    href: "/controversy",
    icon: AlertTriangle,
  },
  {
    title: "Documentation",
    href: "/docs",
    icon: FileText,
  },
];

const insightsNavItems = [
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart2,
  },
  {
    title: "Benchmarking",
    href: "/benchmarking",
    icon: Scale,
  },
  {
    title: "AI Insights",
    href: "/ai-insights",
    icon: Brain,
  },
  {
    title: "Compliance",
    href: "/compliance",
    icon: ShieldCheck,
  },
  {
    title: "Version Control",
    href: "/version-control",
    icon: GitBranch,
  },
];

const systemNavItems = [
  {
    title: "ERP Integration",
    href: "/integrations",
    icon: Network,
  },
  {
    title: "Workflow",
    href: "/workflow",
    icon: Workflow,
  },
  {
    title: "Deadlines",
    href: "/deadlines",
    icon: Clock,
  },
  {
    title: "Collaboration",
    href: "/collaboration",
    icon: MessageSquare,
  },
];

const settingsNavItems = [
  {
    title: "Team",
    href: "/team",
    icon: UsersIcon,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
];

export function SidebarNav() {
  const [location] = useLocation();
  const { user, logout } = useUser();

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const Icon = item.icon;
    const isActive = location === item.href;

    return (
      <Link href={item.href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors font-medium",
            isActive
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "text-foreground/70 hover:bg-primary/5 hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {item.title}
        </Button>
      </Link>
    );
  };

  const NavSection = ({ title, items }: { title: string; items: typeof mainNavItems }) => (
    <div className="space-y-2">
      <h2 className="px-4 text-xs font-semibold text-foreground/50 uppercase tracking-wider">
        {title}
      </h2>
      {items.map((item) => (
        <NavItem key={item.title} item={item} />
      ))}
    </div>
  );

  return (
    <div className="flex h-screen min-w-[240px] flex-col bg-card">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Transfer Pricing Hub
        </h2>
        <p className="text-sm text-foreground/70">
          Welcome, {user?.username}
        </p>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-6 py-2">
          <NavSection title="Main" items={mainNavItems} />
          <Separator className="mx-3 bg-foreground/10" />
          <NavSection title="Insights & Analytics" items={insightsNavItems} />
          <Separator className="mx-3 bg-foreground/10" />
          <NavSection title="System" items={systemNavItems} />
          <Separator className="mx-3 bg-foreground/10" />
          <NavSection title="Settings" items={settingsNavItems} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-foreground/10">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-primary/5"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}