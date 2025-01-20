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

  const openDocument = (documentId: number, title: string) => {
    // Construct the document URL
    const baseUrl = window.location.origin;
    const downloadUrl = `${baseUrl}/api/documents/${documentId}/download`;
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(downloadUrl)}`;

    // Open in new tab
    window.open(officeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold">All Documents</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload New
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
                  onClick={() => openDocument(doc.id, doc.title)}
                >
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    {doc.title}
                  </TableCell>
                  <TableCell>{format(new Date(doc.updatedAt), 'MMM d, yyyy')}</TableCell>
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
  );
}