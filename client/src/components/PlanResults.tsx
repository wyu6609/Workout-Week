import { motion } from "framer-motion";
import { 
  Download, 
  Copy, 
  Dumbbell, 
  Clock, 
  Flame, 
  RotateCcw, 
  ChevronDown, 
  Play, 
  Info,
  Calendar,
  Heart,
  Loader2
} from "lucide-react";
import type { GeneratePlanResponse, DayPlan, Exercise, WorkoutPlan } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/auth-utils";

interface PlanResultsProps {
  plan: WorkoutPlan;
  onReset: () => void;
}

export function PlanResults({ plan, onReset }: PlanResultsProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/saved-workouts", { planData: plan });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-workouts"] });
      toast({ title: "Workout saved!", description: "You can access it anytime from your saved workouts." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please sign in again.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message || "Failed to save workout.", variant: "destructive" });
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "You can paste the plan JSON anywhere.",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workout-plan-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-8 border border-primary/10">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Dumbbell className="w-64 h-64 text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Badge className="mb-4 bg-accent text-accent-foreground hover:bg-accent/90">
              {plan.overview.goal.replace(/_/g, " ").toUpperCase()}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              {plan.plan_name}
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              {plan.overview.weekly_structure}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
              <Flame className="w-4 h-4" />
              {plan.overview.intensity_guidance}
            </div>
          </div>

          <div className="flex gap-3">
            {isAuthenticated && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                title="Save to favorites"
                data-testid="button-save-workout"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={handleCopy} title="Copy JSON" data-testid="button-copy-json">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload} title="Download JSON" data-testid="button-download-json">
              <Download className="w-4 h-4" />
            </Button>
            <Button onClick={onReset} className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40" data-testid="button-new-plan">
              <RotateCcw className="w-4 h-4" />
              New Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {plan.days.map((day: any, idx: number) => (
          <motion.div variants={item} key={idx}>
            <DayCard day={day} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function DayCard({ day }: { day: DayPlan }) {
  if (day.is_rest_day) {
    return (
      <Card className="h-full bg-muted/30 border-dashed border-2 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold font-display text-foreground">{day.day}</h3>
        <p className="text-muted-foreground mt-2">Rest & Recovery</p>
        <p className="text-sm text-muted-foreground/60 mt-4 max-w-xs">
          Take time to recover. Light walking, stretching, or mobility work is encouraged but not required.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 border-b border-border/50">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
            {day.day}
          </Badge>
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            {day.duration_minutes} min
          </div>
        </div>
        <h3 className="text-xl font-bold font-display text-primary">{day.focus}</h3>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[600px] hide-scrollbar">
        {/* Warmup */}
        <Section title="Warmup" color="text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400">
          {day.warmup.map((w: any, i: number) => (
            <div key={i} className="text-sm py-1 border-l-2 border-yellow-200 pl-3">
              <div className="font-medium">{w.name}</div>
              <div className="text-muted-foreground text-xs">{w.time_seconds}s • {w.cues.join(", ")}</div>
            </div>
          ))}
        </Section>

        {/* Workout Blocks */}
        {day.workout.map((block: any, i: number) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                  {i + 1}
                </span>
                {block.block_name}
              </h4>
              <Badge variant="secondary" className="text-xs">
                {block.format.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {block.exercises.map((ex: Exercise, j: number) => (
                <ExerciseItem key={j} exercise={ex} />
              ))}
            </Accordion>
          </div>
        ))}

        {/* Cooldown */}
        <Section title="Cooldown" color="text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400">
          {day.cooldown.map((c: any, i: number) => (
            <div key={i} className="text-sm py-1 border-l-2 border-blue-200 pl-3">
              <div className="font-medium">{c.name}</div>
              <div className="text-muted-foreground text-xs">{c.time_seconds}s • {c.cues.join(", ")}</div>
            </div>
          ))}
        </Section>
      </div>
    </Card>
  );
}

function ExerciseItem({ exercise }: { exercise: Exercise }) {
  return (
    <AccordionItem value={exercise.name} className="border-b-0 mb-2 last:mb-0">
      <div className="bg-secondary/30 rounded-lg overflow-hidden border border-border/50">
        <AccordionTrigger className="px-4 py-3 hover:bg-secondary/50 hover:no-underline transition-colors">
          <div className="flex flex-col items-start text-left w-full pr-2">
            <span className="font-semibold text-sm">{exercise.name}</span>
            <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="bg-background px-1.5 py-0.5 rounded border border-border/50 font-mono">
                {exercise.sets} x {exercise.reps}
              </span>
              {exercise.rest_seconds > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {exercise.rest_seconds}s
                </span>
              )}
              <span className="flex items-center gap-1 text-accent">
                <Flame className="w-3 h-3" /> RPE {exercise.rpe}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-0 text-sm">
          <div className="mt-2 pt-2 border-t border-border/50 space-y-3">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cues</span>
              <ul className="list-disc list-inside mt-1 text-muted-foreground/90 space-y-0.5">
                {exercise.form_cues.map((cue: string, i: number) => (
                  <li key={i}>{cue}</li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-background p-3 rounded-md border border-border/50">
              {exercise.substitutions.easier && (
                <div><span className="font-semibold text-green-600">Easier:</span> {exercise.substitutions.easier}</div>
              )}
              {exercise.substitutions.harder && (
                <div><span className="font-semibold text-red-500">Harder:</span> {exercise.substitutions.harder}</div>
              )}
              {exercise.substitutions.knee_friendly && (
                <div className="col-span-1 sm:col-span-2"><span className="font-semibold text-blue-500">Knee Friendly:</span> {exercise.substitutions.knee_friendly}</div>
              )}
            </div>
          </div>
        </AccordionContent>
      </div>
    </AccordionItem>
  );
}

function Section({ title, color, children }: { title: string, color: string, children: React.ReactNode }) {
  return (
    <div>
      <h5 className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 py-1 rounded w-fit ${color}`}>
        {title}
      </h5>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
