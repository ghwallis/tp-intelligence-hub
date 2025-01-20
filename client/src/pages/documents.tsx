import { useState } from "react";
import { useDocuments } from "@/hooks/use-documents";
import { useTemplates } from "@/hooks/use-templates";
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
import { FileText, Upload } from "lucide-react";
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
    // Direct download URL
    const downloadUrl = `/api/documents/${documentId}/download`;

    // Try to download the file directly first
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold">My content</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
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

          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Modified</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents?.map((doc) => (
                  <TableRow 
                    key={doc.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => openDocument(doc.id)}
                  >
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      {doc.title}
                    </TableCell>
                    <TableCell>
                      {doc.updatedAt ? format(new Date(doc.updatedAt), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>You</TableCell>
                  </TableRow>
                ))}
                {!documents?.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No documents yet. Upload your first document to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}