import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FileText, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Document = {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
};

type DocumentListProps = {
  documents: Document[];
  onDragEnd: (result: any) => void;
  onDelete: (id: string) => void;
};

export function DocumentList({ documents, onDragEnd, onDelete }: DocumentListProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="documents">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {documents.map((doc, index) => (
              <Draggable key={doc.id} draggableId={doc.id} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "flex items-center p-4 transition-colors",
                      snapshot.isDragging && "bg-accent"
                    )}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className="mr-4 cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <FileText className="mr-4 h-5 w-5 text-muted-foreground" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {doc.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {doc.type} • {doc.size}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {doc.lastModified}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete document</span>
                      </Button>
                    </div>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}