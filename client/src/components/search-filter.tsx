import { useState } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

export type SearchFilters = {
  keyword: string;
  documentType: string;
  status: string;
  dateFrom?: Date;
  dateTo?: Date;
};

type SearchFilterProps = {
  onFilterChange: (filters: SearchFilters) => void;
};

const documentTypes = [
  { value: "all", label: "All Documents" },
  { value: "apa", label: "APA Documents" },
  { value: "audit", label: "Audit Reports" },
  { value: "beps", label: "BEPS Documentation" },
  { value: "pillar-two", label: "Pillar Two" },
  { value: "eu-atad", label: "EU ATAD" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
];

export function SearchFilter({ onFilterChange }: SearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    documentType: "all",
    status: "all",
  });
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search in compliance documents..."
            className="pl-9"
            value={filters.keyword}
            onChange={(e) => handleFilterChange({ keyword: e.target.value })}
          />
        </div>
        <Select
          value={filters.documentType}
          onValueChange={(value) => handleFilterChange({ documentType: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange({ status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[250px] justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{ 
                from: dateRange.from,
                to: dateRange.to
              }}
              onSelect={(range) => {
                setDateRange(range || {});
                handleFilterChange({
                  dateFrom: range?.from,
                  dateTo: range?.to,
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
