import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Activity, Calendar, Clock, ChevronRight, Loader2, Target, HeartPulse } from "lucide-react";
import { userPreferencesSchema, type UserPreferences, type WorkoutPlan } from "@shared/schema";
import { useGeneratePlan } from "@/hooks/use-workout";
import { PlanResults } from "@/components/PlanResults";
import { UserMenu } from "@/components/UserMenu";
import { SavedWorkoutsDialog } from "@/components/SavedWorkoutsDialog";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [showResults, setShowResults] = useState(false);
  const [savedDialogOpen, setSavedDialogOpen] = useState(false);
  const [loadedPlan, setLoadedPlan] = useState<WorkoutPlan | null>(null);
  const generateMutation = useGeneratePlan();

  const form = useForm<UserPreferences>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: {
      goal: "muscle_gain",
      experience: "intermediate",
      days_per_week: 4,
      minutes_per_session: 45,
      cardio_preference: "low_impact",
      focus: "full_body",
      household_items_allowed: false,
      constraints: "",
    },
  });

  const onSubmit = (data: UserPreferences) => {
    generateMutation.mutate(data, {
      onSuccess: () => {
        setLoadedPlan(null);
        setShowResults(true);
      },
    });
  };

  const handleReset = () => {
    setShowResults(false);
    setLoadedPlan(null);
    form.reset();
  };

  const handleLoadWorkout = (plan: WorkoutPlan) => {
    setLoadedPlan(plan);
    setShowResults(true);
  };

  const currentPlan = loadedPlan || generateMutation.data;

  return (
    <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-12 text-center space-y-4 relative">
          <div className="absolute top-0 right-0">
            <UserMenu onViewSaved={() => setSavedDialogOpen(true)} />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4"
          >
            <Dumbbell className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl md:text-6xl font-display font-extrabold tracking-tight"
          >
            Fit<span className="text-primary">Forge</span> AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Generate a completely personalized workout routine based on your goals, schedule, and limitations.
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {showResults && currentPlan ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PlanResults plan={currentPlan} onReset={handleReset} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/80">
                <CardContent className="p-6 md:p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                          <Target className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-bold font-display">Goals & Experience</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Goal</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl" data-testid="select-goal">
                                      <SelectValue placeholder="Select a goal" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="fat_loss">Fat Loss</SelectItem>
                                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                                    <SelectItem value="strength">Strength</SelectItem>
                                    <SelectItem value="endurance">Endurance</SelectItem>
                                    <SelectItem value="mobility">Mobility & Flexibilty</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="experience"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Experience Level</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl" data-testid="select-experience">
                                      <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="beginner">Beginner (0-6 months)</SelectItem>
                                    <SelectItem value="intermediate">Intermediate (6m - 2y)</SelectItem>
                                    <SelectItem value="advanced">Advanced (2y+)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="focus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Focus Area</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-xl" data-testid="select-focus">
                                    <SelectValue placeholder="Select focus" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="full_body">Full Body</SelectItem>
                                  <SelectItem value="upper">Upper Body</SelectItem>
                                  <SelectItem value="lower">Lower Body</SelectItem>
                                  <SelectItem value="core">Core & Abs</SelectItem>
                                  <SelectItem value="glutes">Glutes</SelectItem>
                                  <SelectItem value="posture">Posture Correction</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-6 pt-2">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                          <Calendar className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-bold font-display">Schedule & Time</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <FormField
                            control={form.control}
                            name="days_per_week"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <div className="flex justify-between">
                                  <FormLabel>Days Per Week</FormLabel>
                                  <span className="font-mono text-sm font-medium bg-secondary px-2 py-0.5 rounded">{field.value} days</span>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={3}
                                    max={7}
                                    step={1}
                                    defaultValue={[field.value]}
                                    onValueChange={(vals) => field.onChange(vals[0])}
                                    className="py-4"
                                    data-testid="slider-days"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="minutes_per_session"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <div className="flex justify-between">
                                  <FormLabel>Minutes Per Session</FormLabel>
                                  <span className="font-mono text-sm font-medium bg-secondary px-2 py-0.5 rounded">{field.value} min</span>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={15}
                                    max={60}
                                    step={5}
                                    defaultValue={[field.value]}
                                    onValueChange={(vals) => field.onChange(vals[0])}
                                    className="py-4"
                                    data-testid="slider-minutes"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-6 pt-2">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                          <HeartPulse className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-bold font-display">Preferences & Limitations</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <FormField
                            control={form.control}
                            name="cardio_preference"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cardio Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl" data-testid="select-cardio">
                                      <SelectValue placeholder="Select cardio type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">None / Minimal</SelectItem>
                                    <SelectItem value="low_impact">Low Impact (Walking/Cycling)</SelectItem>
                                    <SelectItem value="hiit_ok">HIIT / Intense</SelectItem>
                                    <SelectItem value="running_ok">Running OK</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="household_items_allowed"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border p-4 bg-secondary/20">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Household Items</FormLabel>
                                  <FormDescription className="text-xs">
                                    Can we use chairs, bottles, or towels?
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-household"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="constraints"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Physical Constraints or Injuries</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="e.g., Lower back pain, bad knees, no jumping..."
                                  className="resize-none rounded-xl min-h-[80px]"
                                  data-testid="textarea-constraints"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-border/50">
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="w-4 h-4" />
                            <h4 className="text-sm font-semibold uppercase tracking-wider">Baseline Stats (Optional)</h4>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           <FormField
                            control={form.control}
                            name="baselines.pushups_max"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Max Pushups</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} className="h-10" placeholder="0" data-testid="input-pushups" />
                                </FormControl>
                              </FormItem>
                            )}
                           />
                           <FormField
                            control={form.control}
                            name="baselines.squats_max"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Max Squats</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} className="h-10" placeholder="0" data-testid="input-squats" />
                                </FormControl>
                              </FormItem>
                            )}
                           />
                           <FormField
                            control={form.control}
                            name="baselines.plank_seconds"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Max Plank (sec)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} className="h-10" placeholder="0" data-testid="input-plank" />
                                </FormControl>
                              </FormItem>
                            )}
                           />
                         </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full text-lg h-14 rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 hover:to-primary hover:scale-[1.01] transition-all shadow-lg shadow-primary/25"
                        disabled={generateMutation.isPending}
                        data-testid="button-generate"
                      >
                        {generateMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Forging Plan...
                          </>
                        ) : (
                          <>
                            Generate Workout Plan
                            <ChevronRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SavedWorkoutsDialog
        open={savedDialogOpen}
        onOpenChange={setSavedDialogOpen}
        onLoadWorkout={handleLoadWorkout}
      />
    </div>
  );
}
