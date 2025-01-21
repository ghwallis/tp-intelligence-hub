import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useState } from "react";
import { NoticeAnalysis } from "@/components/notice-analysis";
import { useToast } from "@/hooks/use-toast";

export default function NoticeManagement() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    let file: File | null = null;

    if ('dataTransfer' in event) {
      event.preventDefault();
      file = event.dataTransfer.files[0];
    } else if ('target' in event && event.target.files) {
      file = event.target.files[0];
    }

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/notices/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      toast({
        title: "Upload Successful",
        description: "Notice uploaded and analyzed successfully.",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload notice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notice Management</h1>
          <p className="text-muted-foreground mt-2">
            Upload and analyze transfer pricing audit notices and regulatory communications
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
            onDrop={handleFileUpload}
            onDragOver={handleDragOver}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,.doc,.docx,.txt';
              input.onchange = handleFileUpload;
              input.click();
            }}
          >
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              Drag and drop your notice files here, or click to browse
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Supported formats: PDF, Word, Text files
            </div>
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <NoticeAnalysis analysis={analysisResult} />
      )}
    </div>
  );
}
