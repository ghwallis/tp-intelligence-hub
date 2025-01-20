import { useState } from "react";
import { useDocuments } from "@/hooks/use-documents";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function Documents() {
  const { documents, isLoading, uploadDocument } = useDocuments();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadDocument(file);
      setOpen(false);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload document. Please try again.",
      });
    }
  };

  const openDocument = (documentId: number) => {
    const baseUrl = window.location.origin;
    const downloadUrl = `${baseUrl}/api/documents/${documentId}/download`;
    window.open(downloadUrl, '_blank');
  };

  const downloadDocument = (documentId: number, title: string) => {
    const link = document.createElement('a');
    link.href = `/api/documents/${documentId}/download`;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My files</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <Input
              type="file"
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.doc,.docx,.pdf,.txt"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>File size</TableHead>
              <TableHead>Sharing</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents?.map((doc) => (
              <TableRow key={doc.id} className="hover:bg-gray-50">
                <TableCell className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  {doc.title}
                </TableCell>
                <TableCell>
                  {doc.updatedAt ? format(new Date(doc.updatedAt), 'MMM d, yyyy') : 'N/A'}
                </TableCell>
                <TableCell>{formatFileSize(doc.metadata?.size)}</TableCell>
                <TableCell>Private</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDocument(doc.id)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(doc.id, doc.title)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!documents?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No files yet. Upload your first file to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}