import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function NoticeManagementPage() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleNoticeUpload = async () => {
    setIsAnalyzing(true);
    // TODO: Implement notice upload and analysis
    toast({
      title: "Notice Upload",
      description: "This feature is coming soon.",
    });
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notice Management</h1>
        <p className="text-muted-foreground">
          Upload and analyze audit notices and dispute documents
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Notice</h2>
            <Button 
              className="w-full h-32 border-dashed border-2"
              onClick={handleNoticeUpload}
              disabled={isAnalyzing}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8" />
                <div className="text-lg font-semibold">
                  Drop notice here or click to upload
                </div>
                <div className="text-sm text-muted-foreground">
                  Supports PDF and document formats
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Analysis</h2>
            <div className="text-muted-foreground text-center p-8">
              No notices analyzed yet. Upload a notice to get started.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI-Powered Insights</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Our AI system will analyze notices to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Extract key issues and questions</li>
              <li>Identify deadlines and important dates</li>
              <li>Suggest relevant documentation needed</li>
              <li>Provide guidance based on historical data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
