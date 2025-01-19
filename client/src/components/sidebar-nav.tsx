import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  FileBox,
  AlertTriangle,
  ClipboardCheck,
  BarChart2,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Templates",
    href: "/templates",
    icon: FileBox,
  },
  {
    title: "Risk Assessment",
    href: "/risk-assessment",
    icon: AlertTriangle,
  },
  {
    title: "Compliance",
    href: "/compliance",
    icon: ClipboardCheck,
  },
  {
    title: "Benchmarking",
    icon: BarChart2,
    subitems: [
      {
        title: "Analytics",
        href: "/benchmarking/analytics",
      },
      {
        title: "Data Sources",
        href: "/benchmarking/data-sources",
      },
    ],
  },
];

export function SidebarNav() {
  const [location] = useLocation();
  const { user, logout } = useUser();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="flex h-screen flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Transfer Pricing Hub</h2>
        <p className="text-sm text-sidebar-foreground/60">Welcome, {user?.username}</p>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItems.includes(item.title);
          const isActive = location.startsWith(item.href || '');

          return (
            <div key={item.title}>
              {item.subitems ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-9 mt-1 space-y-1">
                      {item.subitems.map((subitem) => (
                        <Link key={subitem.href} href={subitem.href}>
                          <a
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-colors",
                              location === subitem.href
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "hover:bg-sidebar-accent/50"
                            )}
                          >
                            {subitem.title}
                          </a>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href!}>
                  <a
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      location === item.href
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </a>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}