import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "lucide-react";

export default function DocumentUpload() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Document Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage transfer pricing documentation
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <FileUpload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              Drag and drop your files here, or click to browse
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Supported formats: PDF, Word, Excel
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
