import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import DocumentProcessing from "@/pages/document-processing";
import Controversy from "@/pages/controversy";
import NoticeManagement from "@/pages/controversy/notices";
import Documentation from "@/pages/documentation";
import Analytics from "@/pages/analytics";
import Benchmarking from "@/pages/benchmarking";
import BenchmarkingAnalytics from "@/pages/benchmarking/analytics";
import DataSources from "@/pages/benchmarking/data-sources";
import AIInsights from "@/pages/ai-insights";
import Compliance from "@/pages/compliance";
import PillarTwo from "@/pages/compliance/pillar-two";
import BEPSCompliance from "@/pages/compliance/beps";
import EUATAD from "@/pages/compliance/eu-atad";
import APAManagement from "@/pages/compliance/apa";
import AuditManagement from "@/pages/compliance/audit";
import VersionControl from "@/pages/version-control";
import Integrations from "@/pages/integrations";
import Workflow from "@/pages/workflow";
import Deadlines from "@/pages/deadlines";
import Collaboration from "@/pages/collaboration";
import Team from "@/pages/team";
import Settings from "@/pages/settings";
import { SidebarNav } from "@/components/sidebar-nav";
import { ChatBot } from "@/components/chat-bot";
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
              <Route path="/" component={Dashboard} />
              <Route path="/documents/upload" component={Documents} />
              <Route path="/documents/processing" component={DocumentProcessing} />
              <Route path="/controversy" component={Controversy} />
              <Route path="/controversy/notices" component={NoticeManagement} />
              <Route path="/controversy/audit" component={AuditManagement} />
              <Route path="/docs" component={Documentation} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/benchmarking" component={Benchmarking} />
              <Route path="/benchmarking/analytics" component={BenchmarkingAnalytics} />
              <Route path="/benchmarking/data-sources" component={DataSources} />
              <Route path="/ai-insights" component={AIInsights} />
              <Route path="/compliance" component={Compliance} />
              <Route path="/compliance/pillar-two" component={PillarTwo} />
              <Route path="/compliance/beps" component={BEPSCompliance} />
              <Route path="/compliance/eu-atad" component={EUATAD} />
              <Route path="/compliance/apa" component={APAManagement} />
              <Route path="/version-control" component={VersionControl} />
              <Route path="/integrations" component={Integrations} />
              <Route path="/workflow" component={Workflow} />
              <Route path="/deadlines" component={Deadlines} />
              <Route path="/collaboration" component={Collaboration} />
              <Route path="/team" component={Team} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
      <ChatBot />
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