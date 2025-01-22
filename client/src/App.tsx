import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatBot } from "@/components/chat-bot";

// Import key pages
import Dashboard from "@/pages/dashboard";
import NoticeManagement from "@/pages/controversy/notices";
import AIInsights from "@/pages/ai-insights";
import DocumentUpload from "@/pages/documents/upload";
import Documentation from "@/pages/documentation";
import Compliance from "@/pages/compliance";
import BEPSCompliance from "@/pages/compliance/beps";
import EUATAD from "@/pages/compliance/eu-atad";
import PillarTwo from "@/pages/compliance/pillar-two";
import APAManagement from "@/pages/compliance/apa";
import Controversy from "@/pages/controversy";
import AuditManagement from "@/pages/controversy/audit";
import ControversyDocumentation from "@/pages/controversy/documentation";
import TimelineTracker from "@/pages/controversy/timeline";
import DisputeResolution from "@/pages/controversy/dispute";
import Analytics from "@/pages/analytics";
import Benchmarking from "@/pages/benchmarking";
import BenchmarkAnalytics from "@/pages/benchmarking/analytics";
import DataSources from "@/pages/benchmarking/data-sources";
import RiskAssessment from "@/pages/risk-assessment";
import Integrations from "@/pages/integrations";
import Settings from "@/pages/settings";
import Team from "@/pages/team";
import Templates from "@/pages/templates";
import Documents from "@/pages/documents";
import Collaboration from "@/pages/collaboration";
import Deadlines from "@/pages/deadlines";
import VersionControl from "@/pages/version-control";
import Workflow from "@/pages/workflow";


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
              <Route path="/documentation" component={Documentation} />
              <Route path="/compliance" component={Compliance} />
              <Route path="/compliance/beps" component={BEPSCompliance} />
              <Route path="/compliance/eu-atad" component={EUATAD} />
              <Route path="/compliance/pillar-two" component={PillarTwo} />
              <Route path="/compliance/apa" component={APAManagement} />
              <Route path="/controversy" component={Controversy} />
              <Route path="/controversy/notices" component={NoticeManagement} />
              <Route path="/controversy/audit" component={AuditManagement} />
              <Route path="/controversy/documentation" component={ControversyDocumentation} />
              <Route path="/controversy/timeline" component={TimelineTracker} />
              <Route path="/controversy/dispute" component={DisputeResolution} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/ai-insights" component={AIInsights} />
              <Route path="/benchmarking" component={Benchmarking} />
              <Route path="/benchmarking/analytics" component={BenchmarkAnalytics} />
              <Route path="/benchmarking/data-sources" component={DataSources} />
              <Route path="/risk-assessment" component={RiskAssessment} />
              <Route path="/integrations" component={Integrations} />
              <Route path="/settings" component={Settings} />
              <Route path="/team" component={Team} />
              <Route path="/templates" component={Templates} />
              <Route path="/documents" component={Documents} />
              <Route path="/documents/upload" component={DocumentUpload} />
              <Route path="/collaboration" component={Collaboration} />
              <Route path="/deadlines" component={Deadlines} />
              <Route path="/version-control" component={VersionControl} />
              <Route path="/workflow" component={Workflow} />
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