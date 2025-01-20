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
  ChevronDown,
  Database,
  LineChart,
  Binary,
  BookOpen,
  HandshakeIcon,
  AlertOctagon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

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
    icon: Scale,
    items: [
      {
        title: "Analytics",
        href: "/benchmarking/analytics",
        icon: LineChart,
      },
      {
        title: "Data Sources",
        href: "/benchmarking/data-sources",
        icon: Database,
      },
    ],
  },
  {
    title: "AI Insights",
    href: "/ai-insights",
    icon: Brain,
  },
  {
    title: "Compliance",
    icon: ShieldCheck,
    items: [
      {
        title: "OECD Pillar Two",
        href: "/compliance/pillar-two",
        icon: Binary,
      },
      {
        title: "BEPS Action Plans",
        href: "/compliance/beps",
        icon: BookOpen,
      },
      {
        title: "EU ATAD",
        href: "/compliance/eu-atad",
        icon: AlertOctagon,
      },
      {
        title: "APA Management",
        href: "/compliance/apa",
        icon: HandshakeIcon,
      },
      {
        title: "Audit Management",
        href: "/compliance/audit",
        icon: AlertTriangle,
      },
    ],
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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    );
  };

  const NavItem = ({ item, nested = false }: { item: any; nested?: boolean }) => {
    const Icon = item.icon;
    const hasItems = item.items && item.items.length > 0;
    const isActive = location === item.href;
    const isExpanded = expandedItems.includes(item.title);

    if (hasItems) {
      return (
        <div>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors font-medium",
              isExpanded
                ? "bg-primary/10 text-primary"
                : "text-foreground/70 hover:bg-primary/5 hover:text-foreground"
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            <Icon className="h-4 w-4" />
            {item.title}
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </Button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.items.map((subItem: any) => (
                <NavItem key={subItem.title} item={subItem} nested />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link href={item.href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors font-medium",
            nested && "text-sm",
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

  const NavSection = ({ title, items }: { title: string; items: any[] }) => (
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
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}