import { useQuery } from "@tanstack/react-query";
import type { Template } from "@db/schema";

export function useTemplates() {
  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  return {
    templates,
    isLoading,
  };
}
