import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SavedWorkout, WorkoutPlan } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Calendar, Target, Loader2, Heart } from "lucide-react";
import { format } from "date-fns";

interface SavedWorkoutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadWorkout: (plan: WorkoutPlan) => void;
}

export function SavedWorkoutsDialog({ open, onOpenChange, onLoadWorkout }: SavedWorkoutsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedWorkouts, isLoading } = useQuery<SavedWorkout[]>({
    queryKey: ["/api/saved-workouts"],
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/saved-workouts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-workouts"] });
      toast({ title: "Workout deleted", description: "The workout has been removed from your saved list." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please sign in again.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete workout.", variant: "destructive" });
    },
  });

  const handleLoad = (workout: SavedWorkout) => {
    onLoadWorkout(workout.planData as WorkoutPlan);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Saved Workouts
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !savedWorkouts?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No saved workouts yet.</p>
            <p className="text-sm mt-2">Generate a workout plan and save it to access it later!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {savedWorkouts.map((workout) => {
                const plan = workout.planData as WorkoutPlan;
                return (
                  <Card
                    key={workout.id}
                    className="p-4 hover-elevate cursor-pointer transition-all"
                    onClick={() => handleLoad(workout)}
                    data-testid={`card-saved-workout-${workout.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{workout.planName}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            {plan.overview.goal.replace(/_/g, " ")}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {plan.days.filter(d => !d.is_rest_day).length} days/week
                          </Badge>
                        </div>
                        {workout.createdAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Saved {format(new Date(workout.createdAt), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(workout.id);
                        }}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-workout-${workout.id}`}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {savedWorkouts?.length || 0} / 10 workouts saved
        </div>
      </DialogContent>
    </Dialog>
  );
}
