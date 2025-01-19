import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  FileBox,
  AlertTriangle,
  ClipboardCheck,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

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
];

export function SidebarNav() {
  const [location] = useLocation();
  const { user, logout } = useUser();

  return (
    <div className="flex h-screen flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Transfer Pricing Hub</h2>
        <p className="text-sm text-sidebar-foreground/60">Welcome, {user?.username}</p>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
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