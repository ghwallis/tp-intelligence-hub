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
import { motion, AnimatePresence } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const progressVariants = {
  initial: { width: 0 },
  animate: (value: number) => ({
    width: `${value}%`,
    transition: { duration: 0.8, ease: "easeOut" }
  })
};

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
    <motion.div 
      className="p-8 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <motion.h1 
          className="text-3xl font-bold"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          ERP Integration
        </motion.h1>
        <motion.p 
          className="text-muted-foreground"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Connect your ERP system to enable automated data synchronization
        </motion.p>
      </div>

      <Tabs defaultValue="connect" className="space-y-6">
        <TabsList>
          {["connect", "api", "status"].map((tab) => (
            <motion.div
              key={tab}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TabsTrigger value={tab}>
                {tab === "connect" ? "Connect ERP" : 
                 tab === "api" ? "API Configuration" : "Integration Status"}
              </TabsTrigger>
            </motion.div>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="connect" asChild>
            <motion.div {...fadeIn} transition={{ duration: 0.2 }}>
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
                    <motion.div 
                      className="space-y-4"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                      initial="hidden"
                      animate="show"
                    >
                      <motion.div variants={fadeIn} className="space-y-2">
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
                      </motion.div>

                      <motion.div variants={fadeIn} className="space-y-2">
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
                      </motion.div>

                      <motion.div variants={fadeIn} className="space-y-2">
                        <Label htmlFor="url">Server URL</Label>
                        <Input
                          id="url"
                          name="url"
                          type="url"
                          placeholder="https://erp.company.com"
                          required
                        />
                      </motion.div>

                      <motion.div variants={fadeIn} className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          required
                        />
                      </motion.div>

                      <motion.div variants={fadeIn} className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                        />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button type="submit" className="w-full">
                        Connect ERP System
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="api" asChild>
            <motion.div {...fadeIn} transition={{ duration: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>
                    Configure API endpoints and authentication for data synchronization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div 
                    className="space-y-4"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div variants={fadeIn} className="space-y-2">
                      <Label>Financial Data Endpoint</Label>
                      <Input
                        value="/api/v1/financial-data"
                        readOnly
                      />
                    </motion.div>

                    <motion.div variants={fadeIn} className="space-y-2">
                      <Label>Transactions Endpoint</Label>
                      <Input
                        value="/api/v1/transactions"
                        readOnly
                      />
                    </motion.div>

                    <motion.div variants={fadeIn} className="space-y-2">
                      <Label>Entities Endpoint</Label>
                      <Input
                        value="/api/v1/entities"
                        readOnly
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button>Save Endpoints</Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="status" asChild>
            <motion.div {...fadeIn} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>
                      Current status of integrated systems and services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div 
                      className="space-y-4"
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                      initial="hidden"
                      animate="show"
                    >
                      <motion.div 
                        variants={fadeIn}
                        className="flex items-center justify-between"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 1, delay: 0.2 }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </motion.div>
                          <span>SAP ERP Connection</span>
                        </div>
                        <span className="text-xs bg-green-500/10 text-green-500 rounded-full px-2 py-1">
                          Active
                        </span>
                      </motion.div>

                      <motion.div 
                        variants={fadeIn}
                        className="flex items-center justify-between"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          </motion.div>
                          <span>Data Synchronization</span>
                        </div>
                        <span className="text-xs bg-yellow-500/10 text-yellow-500 rounded-full px-2 py-1">
                          Pending
                        </span>
                      </motion.div>

                      <motion.div 
                        variants={fadeIn}
                        className="flex items-center justify-between"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: [-10, 10] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                          >
                            <XCircle className="h-5 w-5 text-red-500" />
                          </motion.div>
                          <span>Webhook Delivery</span>
                        </div>
                        <span className="text-xs bg-red-500/10 text-red-500 rounded-full px-2 py-1">
                          Failed
                        </span>
                      </motion.div>
                    </motion.div>
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
                    <motion.div 
                      className="space-y-6"
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.2
                          }
                        }
                      }}
                      initial="hidden"
                      animate="show"
                    >
                      <motion.div variants={fadeIn} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Financial Data</span>
                          <span>89%</span>
                        </div>
                        <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="absolute h-full bg-primary rounded-full"
                            initial="initial"
                            animate="animate"
                            variants={progressVariants}
                            custom={89}
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={fadeIn} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Transaction Records</span>
                          <span>92%</span>
                        </div>
                        <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="absolute h-full bg-primary rounded-full"
                            initial="initial"
                            animate="animate"
                            variants={progressVariants}
                            custom={92}
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={fadeIn} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Entity Structure</span>
                          <span>76%</span>
                        </div>
                        <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="absolute h-full bg-primary rounded-full"
                            initial="initial"
                            animate="animate"
                            variants={progressVariants}
                            custom={76}
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}