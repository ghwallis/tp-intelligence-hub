import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, HelpCircle, ArrowUpToLine } from "lucide-react";
import { useState } from "react";
import { SentimentAnalysis } from "@/components/sentiment-analysis";
import { DocumentStructureAnalysis } from "@/components/document-structure-analysis";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSelector } from "@/components/language-selector";

export default function DocumentUpload() {
  const [analysisResult, setAnalysisResult] = useState<{
    sentiment?: any;
    structure?: any;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
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
    formData.append('language', selectedLanguage);

    try {
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
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleExportAnalysis = async (format: 'pdf' | 'docx') => {
    if (!analysisResult) return;

    setIsExporting(true);
    try {
      const response = await fetch('/api/documents/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: {
            sentiment: analysisResult.sentiment,
            structure: analysisResult.structure,
            metadata: {
              exportDate: new Date().toISOString(),
              format,
              documentType: 'transfer-pricing-analysis'
            },
            rawAnalysis: analysisResult, // Include the complete analysis
          },
          format,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-analysis.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Analysis exported as ${format.toUpperCase()} successfully.`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || `Failed to export as ${format.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Document Upload</h1>
            <p className="text-muted-foreground mt-2">
              Upload and analyze transfer pricing documentation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
            />
            {analysisResult && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={isExporting}>
                    <ArrowUpToLine className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export Analysis'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportAnalysis('pdf')}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportAnalysis('docx')}>
                    Export as Word
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upload Documents</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p>Upload your transfer pricing documents for AI-powered analysis. We'll analyze the sentiment, structure, and key information automatically.</p>
                </TooltipContent>
              </Tooltip>
            </div>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-2"
              >
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {uploadProgress < 100
                      ? 'Uploading and analyzing...'
                      : 'Processing complete'}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </motion.div>
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          {analysisResult?.sentiment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SentimentAnalysis analysis={analysisResult.sentiment} />
            </motion.div>
          )}

          {analysisResult?.structure && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DocumentStructureAnalysis analysis={analysisResult.structure} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}