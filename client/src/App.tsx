import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";
import AuthPage from "@/pages/auth-page";

import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import Templates from "@/pages/templates";
import RiskAssessment from "@/pages/risk-assessment";
import Compliance from "@/pages/compliance";
import NotFound from "@/pages/not-found";

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
    <div className="flex h-screen">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto bg-background">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/documents" component={Documents} />
          <Route path="/templates" component={Templates} />
          <Route path="/risk-assessment" component={RiskAssessment} />
          <Route path="/compliance" component={Compliance} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;