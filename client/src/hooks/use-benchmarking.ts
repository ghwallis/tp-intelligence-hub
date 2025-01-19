import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ComparableCompany, BenchmarkingAnalysis } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

export function useBenchmarking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: comparables, isLoading: isLoadingComparables } = useQuery<ComparableCompany[]>({
    queryKey: ["/api/comparables"],
  });

  const { data: analyses, isLoading: isLoadingAnalyses } = useQuery<BenchmarkingAnalysis[]>({
    queryKey: ["/api/benchmarking"],
  });

  const addComparable = useMutation({
    mutationFn: async (comparable: Partial<ComparableCompany>) => {
      const res = await fetch("/api/comparables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comparable),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comparables"] });
      toast({
        title: "Success",
        description: "Comparable company added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const createAnalysis = useMutation({
    mutationFn: async (analysis: Partial<BenchmarkingAnalysis>) => {
      const res = await fetch("/api/benchmarking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysis),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/benchmarking"] });
      toast({
        title: "Success",
        description: "Benchmarking analysis created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return {
    comparables,
    analyses,
    isLoading: isLoadingComparables || isLoadingAnalyses,
    addComparable: addComparable.mutateAsync,
    createAnalysis: createAnalysis.mutateAsync,
  };
}
