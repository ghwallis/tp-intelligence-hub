import { useState } from "react";
import { useDocuments } from "@/hooks/use-documents";
import { useTemplates } from "@/hooks/use-templates";
import { CollaborationPanel } from "@/components/collaboration-panel";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { FileText, Plus, Users } from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export default function Documents() {
  const { documents, isLoading, createDocument } = useDocuments();
  const { templates } = useTemplates();
  const [open, setOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);

  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
      templateId: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createDocument(data);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create document:", error);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templates?.map((template) => (
                            <SelectItem
                              key={template.id}
                              value={template.id.toString()}
                            >
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={10} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Create Document
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents?.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {doc.title}
                </TableCell>
                <TableCell>
                  {templates?.find((t) => t.id === doc.templateId)?.name}
                </TableCell>
                <TableCell>
                  {format(new Date(doc.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={selectedDoc === doc.id ? "default" : "secondary"}
                          size="icon"
                          className="relative"
                          onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                        >
                          <Users className="h-5 w-5" />
                          {selectedDoc === doc.id && (
                            <Badge
                              variant="default"
                              className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center"
                            >
                              •
                            </Badge>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle collaboration panel</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedDoc && <CollaborationPanel documentId={selectedDoc} />}
    </div>
  );
}