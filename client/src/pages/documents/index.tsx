import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DocumentList } from "@/components/document-list";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

// Mock data for initial testing
const initialDocuments = [
  {
    id: "1",
    name: "Q4 Financial Report.pdf",
    type: "PDF",
    size: "2.4 MB",
    lastModified: "2 hours ago",
  },
  {
    id: "2",
    name: "Transfer Pricing Analysis.xlsx",
    type: "Spreadsheet",
    size: "1.8 MB",
    lastModified: "5 hours ago",
  },
  {
    id: "3",
    name: "Compliance Documentation.docx",
    type: "Document",
    size: "956 KB",
    lastModified: "1 day ago",
  },
];

export default function Documents() {
  const [documents, setDocuments] = useState(initialDocuments);
  const { toast } = useToast();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(documents);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDocuments(items);
    toast({
      title: "Document order updated",
      description: "The document order has been successfully updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Upload</h1>
        <p className="text-muted-foreground">
          Manage and organize your transfer pricing documents
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <Button className="w-full h-32 border-dashed border-2">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8" />
                <div className="text-lg font-semibold">Drop files here or click to upload</div>
                <div className="text-sm text-muted-foreground">
                  Support for PDF, Excel, and Word documents
                </div>
              </div>
            </Button>
          </div>

          <DocumentList documents={documents} onDragEnd={handleDragEnd} />
        </CardContent>
      </Card>
    </div>
  );
}