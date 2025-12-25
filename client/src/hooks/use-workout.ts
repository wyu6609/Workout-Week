import { useMutation } from "@tanstack/react-query";
import { api, type GeneratePlanInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useGeneratePlan() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: GeneratePlanInput) => {
      // Validate input before sending using the schema from shared routes
      // This is a double check, form usually handles it too
      const validated = api.workout.generate.input.parse(data);

      const res = await fetch(api.workout.generate.path, {
        method: api.workout.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.workout.generate.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 500) {
          const error = api.workout.generate.responses[500].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to generate plan");
      }

      // Parse and return typed response
      return api.workout.generate.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
