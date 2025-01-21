import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

type Notice = {
  id: number;
  title: string;
  content: string;
  noticeType: string;
  jurisdiction: string;
  receivedDate: string;
  dueDate: string | null;
  status: string;
  priority: string;
};

type Analysis = {
  summary: string;
  keyIssues: string[];
  suggestedResponses: string[];
  requiredDocuments: string[];
  riskAssessment: {
    level: string;
    factors: string[];
  };
};

export default function NoticeManagement() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const { data: notices = [], isLoading: isLoadingNotices } = useQuery<Notice[]>({
    queryKey: ['/api/notices'],
  });

  const { data: analysis, isLoading: isLoadingAnalysis } = useQuery<Analysis>({
    queryKey: ['/api/notices', selectedNotice?.id, 'analysis'],
    enabled: !!selectedNotice,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/notices/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/notices'] });
      setSelectedNotice(data.notice);
      toast({
        title: "Notice uploaded successfully",
        description: "The notice has been uploaded and content extracted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to upload notice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (noticeId: number) => {
      const response = await fetch(`/api/notices/${noticeId}/analyze`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notices', selectedNotice?.id, 'analysis'] });
      toast({
        title: "Analysis complete",
        description: "The notice has been analyzed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to analyze notice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNoticeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    await uploadMutation.mutateAsync(formData);
  };

  const handleAnalyze = async () => {
    if (!selectedNotice) return;
    setIsAnalyzing(true);
    try {
      await analyzeMutation.mutateAsync(selectedNotice.id);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoadingNotices) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <div className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleNoticeUpload}
                accept=".pdf,.doc,.docx,.txt"
                disabled={uploadMutation.isPending}
              />
              <Button 
                className="w-full h-32 border-dashed border-2"
                disabled={uploadMutation.isPending}
              >
                <div className="flex flex-col items-center gap-2">
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8" />
                  )}
                  <div className="text-lg font-semibold">
                    {uploadMutation.isPending ? "Uploading..." : "Drop notice here or click to upload"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Supports PDF and document formats
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Notices</h2>
            {notices.length > 0 ? (
              <div className="space-y-4">
                {notices.map((notice) => (
                  <Card
                    key={notice.id}
                    className={`p-4 cursor-pointer hover:bg-accent ${
                      selectedNotice?.id === notice.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedNotice(notice)}
                  >
                    <h3 className="font-medium">{notice.title}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      {notice.jurisdiction} • {new Date(notice.receivedDate).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        notice.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                        notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {notice.priority}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                        {notice.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center p-8">
                No notices uploaded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedNotice && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Document Content</h2>
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || analyzeMutation.isPending}
              >
                {isAnalyzing || analyzeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze Content"}
              </Button>
            </div>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {selectedNotice.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedNotice && analysis && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI-Powered Analysis</h2>
            {isLoadingAnalysis ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p className="text-muted-foreground">{analysis.summary}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Key Issues</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.keyIssues.map((issue, index) => (
                      <li key={index} className="text-muted-foreground">{issue}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Suggested Responses</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.suggestedResponses.map((response, index) => (
                      <li key={index} className="text-muted-foreground">{response}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Required Documentation</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.requiredDocuments.map((doc, index) => (
                      <li key={index} className="text-muted-foreground">{doc}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Risk Assessment</h3>
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <div className="font-medium text-sm">Risk Level: {analysis.riskAssessment.level}</div>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {analysis.riskAssessment.factors.map((factor, index) => (
                        <li key={index} className="text-muted-foreground text-sm">{factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}