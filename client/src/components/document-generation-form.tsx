import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  entities: z.array(z.string()).min(1, "Select at least one entity"),
  year: z.string().regex(/^\d{4}$/, "Must be a valid year"),
  period: z.string().min(1, "Select a period"),
  entityType: z.string().min(1, "Select an entity type"),
});

// Mock data - replace with actual data from your API
const mockEntities = [
  "Entity A",
  "Entity B",
  "Entity C",
  "Entity D",
  "Entity E",
].map((name) => ({ label: name, value: name.toLowerCase().replace(" ", "-") }));

const periods = [
  { label: "Q1", value: "q1" },
  { label: "Q2", value: "q2" },
  { label: "Q3", value: "q3" },
  { label: "Q4", value: "q4" },
  { label: "Full Year", value: "full" },
];

const entityTypes = [
  { label: "Cost Plus", value: "cost-plus" },
  { label: "Resale", value: "resale" },
  { label: "Distributor", value: "distributor" },
  { label: "Limited Risk Distributor", value: "limited-risk-distributor" },
  { label: "Contract Manufacturer", value: "contract-manufacturer" },
  { label: "Full-Fledged Manufacturer", value: "full-fledged-manufacturer" },
];

export function DocumentGenerationForm() {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entities: [],
      year: new Date().getFullYear().toString(),
      period: "",
      entityType: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to generate document");
      }

      // Handle successful generation
      // You can add download logic here
    } catch (error) {
      console.error("Error generating document:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="entities"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Entities</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value?.length > 0
                        ? `${field.value.length} entities selected`
                        : "Select entities"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search entities..." />
                    <CommandEmpty>No entities found.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-72">
                        {mockEntities.map((entity) => (
                          <CommandItem
                            value={entity.value}
                            key={entity.value}
                            onSelect={() => {
                              const values = new Set(field.value);
                              if (values.has(entity.value)) {
                                values.delete(entity.value);
                              } else {
                                values.add(entity.value);
                              }
                              field.onChange(Array.from(values));
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.includes(entity.value)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {entity.label}
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value?.map((entityValue) => {
                  const entity = mockEntities.find((e) => e.value === entityValue);
                  return (
                    entity && (
                      <Badge
                        key={entity.value}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          field.onChange(
                            field.value.filter((value) => value !== entityValue)
                          );
                        }}
                      >
                        {entity.label} ×
                      </Badge>
                    )
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Period</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entity Type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Generate Document
        </Button>
      </form>
    </Form>
  );
}

export default DocumentGenerationForm;