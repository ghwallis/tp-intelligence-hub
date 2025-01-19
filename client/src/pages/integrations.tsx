import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Network, Settings, History } from "lucide-react";
import type { SystemIntegration, IntegrationLog } from "@db/schema";

export default function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<SystemIntegration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations } = useQuery<SystemIntegration[]>({
    queryKey: ["/api/integrations"],
  });

  const { data: selectedIntegrationLogs } = useQuery<IntegrationLog[]>({
    queryKey: [`/api/integrations/${selectedIntegration?.id}/logs`],
    enabled: !!selectedIntegration,
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (data: Partial<SystemIntegration>) => {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsDialogOpen(false);
      toast({
        title: "Integration created",
        description: "The integration was created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async (data: SystemIntegration) => {
      const response = await fetch(`/api/integrations/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integration updated",
        description: "The integration was updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Integrations</h1>
          <p className="text-muted-foreground">
            Manage your external system integrations and connections
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Integration</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Configure a new external system integration
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createIntegrationMutation.mutate({
                  name: formData.get("name") as string,
                  type: formData.get("type") as string,
                  config: {
                    url: formData.get("url"),
                    apiKey: formData.get("apiKey"),
                  },
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Integration Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Integration Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="erp">ERP System</SelectItem>
                    <SelectItem value="tax">Tax System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">API URL</Label>
                <Input id="url" name="url" type="url" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input id="apiKey" name="apiKey" type="password" required />
              </div>
              <DialogFooter>
                <Button type="submit" loading={createIntegrationMutation.isPending}>
                  Create Integration
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations?.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{integration.name}</CardTitle>
                  <CardDescription>
                    {integration.type === "erp" ? "ERP System" : "Tax System"}
                  </CardDescription>
                </div>
                <Badge
                  variant={integration.status === "active" ? "default" : "secondary"}
                >
                  {integration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  <span className="text-sm">
                    {(integration.config as any).url}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedIntegration(integration);
                      // Open logs dialog
                    }}
                  >
                    <History className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateIntegrationMutation.mutate({
                        ...integration,
                        status: integration.status === "active" ? "inactive" : "active",
                      });
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {integration.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedIntegration && selectedIntegrationLogs && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Logs - {selectedIntegration.name}</CardTitle>
            <CardDescription>
              Recent activity and events for this integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedIntegrationLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between border-b py-2"
                >
                  <div>
                    <p className="font-medium">{log.eventType}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={log.status === "success" ? "default" : "destructive"}
                  >
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
