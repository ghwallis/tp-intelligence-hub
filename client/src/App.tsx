import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { SidebarNav } from "@/components/sidebar-nav";
import NoticeManagement from "@/pages/controversy/notices";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 h-screen w-[240px] border-r border-border">
        <SidebarNav />
      </aside>
      <div className="pl-[240px] flex-1">
        <main className="h-screen overflow-y-auto">
          <div className="container py-6">
            <Switch>
              <Route path="/controversy/notices" component={NoticeManagement} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;