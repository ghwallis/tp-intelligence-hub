import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Database, Key, LogIn } from "lucide-react";

// Mock data for connected sources
const connectedSources = [
  {
    id: "DS001",
    name: "Capital IQ",
    type: "Direct Access",
    status: "Connected",
    lastSync: "2024-01-09 10:30 AM",
    dataPoints: "15,234",
    companies: "1,500+",
  },
  {
    id: "DS002",
    name: "Custom Dataset",
    type: "File Upload",
    status: "Processing",
    lastSync: "2024-01-09 09:15 AM",
    dataPoints: "5,421",
    companies: "250",
  },
  {
    id: "DS003",
    name: "Bloomberg API",
    type: "API",
    status: "Error",
    lastSync: "2024-01-08 03:45 PM",
    dataPoints: "25,678",
    companies: "2,000+",
  },
];

// Mock data for platform connections
const platformConnections = [
  { name: "Capital IQ", status: "Connected", action: "Disconnect" },
  { name: "Bloomberg Terminal", status: "Session Expired", action: "Reconnect" },
  { name: "FactSet", status: "Not Connected", action: "Connect" },
];

export function DataSources() {
  const [selectedTab, setSelectedTab] = useState("connected");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Benchmarking Data Sources</h2>
          <p className="text-muted-foreground">
            Connect and manage external data sources for benchmarking analysis
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="connected">Connected Sources</TabsTrigger>
          <TabsTrigger value="upload">File Upload</TabsTrigger>
          <TabsTrigger value="api">API Connection</TabsTrigger>
          <TabsTrigger value="login">Direct Login</TabsTrigger>
        </TabsList>

        <TabsContent value="connected">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Connected Data Sources</CardTitle>
                    <CardDescription>
                      Manage your external data sources and synchronization status
                    </CardDescription>
                  </div>
                  <Button>Add Data Source</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Data Points</TableHead>
                      <TableHead>Companies</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connectedSources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell>{source.id}</TableCell>
                        <TableCell>{source.name}</TableCell>
                        <TableCell>{source.type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              source.status === "Connected"
                                ? "default"
                                : source.status === "Processing"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {source.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{source.lastSync}</TableCell>
                        <TableCell>{source.dataPoints}</TableCell>
                        <TableCell>{source.companies}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="grid grid-cols-4 gap-4 mt-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">Total Sources</span>
                      </div>
                      <div className="text-2xl font-bold mt-2">8</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">Companies</span>
                      </div>
                      <div className="text-2xl font-bold mt-2">3,750+</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">Data Points</span>
                      </div>
                      <div className="text-2xl font-bold mt-2">46.3K</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        <span className="font-medium">API Keys</span>
                      </div>
                      <div className="text-2xl font-bold mt-2">5</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Data File</CardTitle>
                <CardDescription>
                  Upload company financial data for benchmarking analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>File Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial Data</SelectItem>
                      <SelectItem value="operational">Operational Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    Drag and drop your file here, or click to browse
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Supported formats: .xlsx, .csv, .json
                  </div>
                  <Button className="mt-4">Select File</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Requirements</CardTitle>
                <CardDescription>
                  Ensure your data file meets these requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">File Format</h4>
                  <p className="text-sm text-muted-foreground">
                    Excel (.xlsx), CSV, or JSON format
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Required Columns</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Company Name</li>
                    <li>Industry Classification</li>
                    <li>Financial Year</li>
                    <li>Revenue</li>
                    <li>Operating Profit</li>
                    <li>Total Assets</li>
                    <li>Operating Expenses</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Data Validation</h4>
                  <p className="text-sm text-muted-foreground">
                    The system will validate your data for:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Data completeness</li>
                    <li>• Format consistency</li>
                    <li>• Value ranges</li>
                    <li>• Duplicate entries</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Configure API connection to external data providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Data Provider</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="capitaliq">Capital IQ</SelectItem>
                        <SelectItem value="bloomberg">Bloomberg</SelectItem>
                        <SelectItem value="factset">FactSet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>Base URL</Label>
                    <Input placeholder="https://api.provider.com/v1" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Available Data Points</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Financial Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="revenue" />
                          <label htmlFor="revenue" className="text-sm">Revenue</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="operating-profit" />
                          <label htmlFor="operating-profit" className="text-sm">Operating Profit</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="total-assets" />
                          <label htmlFor="total-assets" className="text-sm">Total Assets</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="operating-expenses" />
                          <label htmlFor="operating-expenses" className="text-sm">Operating Expenses</label>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Market Data</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="market-cap" />
                          <label htmlFor="market-cap" className="text-sm">Market Capitalization</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="stock-price" />
                          <label htmlFor="stock-price" className="text-sm">Stock Price</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="trading-volume" />
                          <label htmlFor="trading-volume" className="text-sm">Trading Volume</label>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Test Connection</Button>
                  <Button>Save Configuration</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="login">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Direct Login</CardTitle>
                <CardDescription>
                  Connect directly to data provider platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="capitaliq">Capital IQ</SelectItem>
                      <SelectItem value="bloomberg">Bloomberg Terminal</SelectItem>
                      <SelectItem value="factset">FactSet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input type="text" placeholder="Enter username" />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="Enter password" />
                </div>

                <div className="space-y-2">
                  <Label>Two-Factor Authentication</Label>
                  <Input type="text" placeholder="Enter code" />
                </div>

                <Button className="w-full">Connect Platform</Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Status</CardTitle>
                  <CardDescription>Current status of platform connections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platformConnections.map((platform) => (
                      <div
                        key={platform.name}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <div className="space-y-1">
                          <h4 className="font-medium">{platform.name}</h4>
                          <p className="text-sm text-muted-foreground">{platform.status}</p>
                        </div>
                        <Button
                          variant={platform.action === "Connect" ? "default" : "outline"}
                          size="sm"
                        >
                          {platform.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Notice</CardTitle>
                  <CardDescription>Important information about data security</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your login credentials are encrypted and securely stored. We use:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• End-to-end encryption for all data transfers</li>
                    <li>• Secure credential storage using AWS KMS</li>
                    <li>• Automatic session timeout after 30 minutes</li>
                    <li>• Two-factor authentication for added security</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
