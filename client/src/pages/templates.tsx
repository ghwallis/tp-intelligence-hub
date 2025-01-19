import { useState } from "react";
import { useTemplates } from "@/hooks/use-templates";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Template } from "@db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Search } from "lucide-react";

export default function Templates() {
  const { templates, isLoading } = useTemplates();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");

  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch = template.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = !category || template.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(templates?.map((t) => t.category) || [])
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Document Templates</h1>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse">
              <CardHeader className="h-[100px] bg-muted" />
              <CardContent className="h-[100px] bg-muted mt-2" />
            </Card>
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates?.map((template) => (
              <Card key={template.id} className="hover:bg-accent transition">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <CardTitle>{template.name}</CardTitle>
                  </div>
                  <CardDescription>{template.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}