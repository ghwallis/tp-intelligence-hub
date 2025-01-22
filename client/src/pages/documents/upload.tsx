import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useState } from "react";
import { SentimentAnalysis } from "@/components/sentiment-analysis";
import { DocumentStructureAnalysis } from "@/components/document-structure-analysis";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function DocumentUpload() {
  const [analysisResult, setAnalysisResult] = useState<{
    sentiment?: any;
    structure?: any;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
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

    setIsUploading(true);
    setUploadProgress(0);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      setUploadProgress(100);
      const data = await response.json();

      if (!data.analysis) {
        throw new Error('No analysis data received');
      }

      setAnalysisResult(data.analysis);
      toast({
        title: "Upload Successful",
        description: "Document uploaded and analyzed successfully.",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Document Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload and analyze transfer pricing documentation
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-primary'
            }`}
            onDrop={handleFileUpload}
            onDragOver={handleDragOver}
            onClick={() => {
              if (!isUploading) {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx,.txt';
                input.addEventListener('change', handleFileUpload);
                input.click();
              }
            }}
          >
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              {isUploading ? 'Uploading...' : 'Drag and drop your files here, or click to browse'}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Supported formats: PDF, Word, Text files
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {uploadProgress < 100 
                    ? 'Uploading and analyzing...' 
                    : 'Processing complete'}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult?.sentiment && (
        <SentimentAnalysis analysis={analysisResult.sentiment} />
      )}

      {analysisResult?.structure && (
        <DocumentStructureAnalysis analysis={analysisResult.structure} />
      )}
    </div>
  );
}