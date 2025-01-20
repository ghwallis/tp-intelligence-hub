import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as pdfjsLib from "pdfjs-dist";
import { Card } from "@/components/ui/card";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollaborationPanel } from "@/components/collaboration-panel";

interface DocumentViewerProps {
  documentId: number;
  content: string;
  title: string;
  type: "text" | "pdf" | "excel";
}

export function DocumentViewer({ documentId, content, title, type }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const getOfficeOnlineUrl = () => {
    const downloadUrl = `${window.location.origin}/api/documents/${documentId}/download`;
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(downloadUrl)}`;
  };

  useEffect(() => {
    if (type === "pdf" && content) {
      // Initialize PDF.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      // Load the PDF
      const loadingTask = pdfjsLib.getDocument(content);
      loadingTask.promise.then((pdf) => {
        setPdfDocument(pdf);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [content, type]);

  useEffect(() => {
    if (pdfDocument && canvasRef.current) {
      pdfDocument.getPage(currentPage).then((page: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 1.5 });
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        page.render(renderContext);
      });
    }
  }, [pdfDocument, currentPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (type === "excel") {
    const officeUrl = getOfficeOnlineUrl();
    return (
      <div className="relative h-full">
        <Card className="p-4 h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <Button 
              variant="outline" 
              onClick={() => window.open(officeUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
          <iframe
            src={officeUrl}
            className="w-full h-[calc(100vh-200px)]"
            frameBorder="0"
          />
        </Card>
        <CollaborationPanel documentId={documentId} />
      </div>
    );
  }

  return (
    <div className="relative">
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {type === "text" ? (
          <Editor
            height="70vh"
            defaultLanguage="plaintext"
            value={content}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              wordWrap: "on",
              lineNumbers: "on",
              renderWhitespace: "selection",
              readOnly: false,
            }}
            onChange={(value) => {
              // Handle content changes here
              console.log("Content changed:", value);
            }}
          />
        ) : (
          <div className="overflow-auto">
            <canvas ref={canvasRef} className="mx-auto" />
          </div>
        )}
      </Card>
      <CollaborationPanel documentId={documentId} />
    </div>
  );
}