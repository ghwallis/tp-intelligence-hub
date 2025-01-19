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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import type { SystemIntegration } from "@db/schema";

export default function Integrations() {
  const [selectedErp, setSelectedErp] = useState<string>("sap");
  const [connectionType, setConnectionType] = useState<string>("direct");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integration } = useQuery<SystemIntegration>({
    queryKey: ["/api/integrations/current"],
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
      toast({
        title: "Connection Successful",
        description: "Your ERP system has been connected successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ERP Integration</h1>
        <p className="text-muted-foreground">
          Connect your ERP system to enable automated data synchronization
        </p>
      </div>

      <Tabs defaultValue="connect" className="space-y-6">
        <TabsList>
          <TabsTrigger value="connect">Connect ERP</TabsTrigger>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="status">Integration Status</TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Settings</CardTitle>
              <CardDescription>
                Configure your ERP system connection details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createIntegrationMutation.mutate({
                    name: formData.get("name") as string,
                    type: "erp",
                    config: {
                      system: selectedErp,
                      connectionType,
                      url: formData.get("url"),
                      username: formData.get("username"),
                      password: formData.get("password"),
                    },
                  });
                }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>ERP System</Label>
                    <Select
                      value={selectedErp}
                      onValueChange={setSelectedErp}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ERP system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sap">SAP</SelectItem>
                        <SelectItem value="oracle">Oracle</SelectItem>
                        <SelectItem value="dynamics">Microsoft Dynamics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Connection Type</Label>
                    <RadioGroup
                      value={connectionType}
                      onValueChange={setConnectionType}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="direct" id="direct" />
                        <Label htmlFor="direct">Direct Login</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="api" id="api" />
                        <Label htmlFor="api">API Connection</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">Server URL</Label>
                    <Input
                      id="url"
                      name="url"
                      type="url"
                      placeholder="https://erp.company.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Connect ERP System
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure API endpoints and authentication for data synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Financial Data Endpoint</Label>
                  <Input
                    value="/api/v1/financial-data"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label>Transactions Endpoint</Label>
                  <Input
                    value="/api/v1/transactions"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label>Entities Endpoint</Label>
                  <Input
                    value="/api/v1/entities"
                    readOnly
                  />
                </div>
              </div>

              <Button>Save Endpoints</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current status of integrated systems and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>SAP ERP Connection</span>
                </div>
                <span className="text-xs bg-green-500/10 text-green-500 rounded-full px-2 py-1">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span>Data Synchronization</span>
                </div>
                <span className="text-xs bg-yellow-500/10 text-yellow-500 rounded-full px-2 py-1">
                  Pending
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>Webhook Delivery</span>
                </div>
                <span className="text-xs bg-red-500/10 text-red-500 rounded-full px-2 py-1">
                  Failed
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sync Overview</CardTitle>
              <CardDescription>
                Status of data synchronization across different modules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Financial Data</span>
                  <span>89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Transaction Records</span>
                  <span>92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Entity Structure</span>
                  <span>76%</span>
                </div>
                <Progress value={76} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}