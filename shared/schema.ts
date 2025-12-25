import { pgTable, text, serial, integer, boolean, jsonb, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// === FORM INPUT SCHEMA ===
export const userPreferencesSchema = z.object({
  goal: z.enum(["fat_loss", "muscle_gain", "strength", "endurance", "mobility"]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  days_per_week: z.number().min(3).max(7),
  minutes_per_session: z.number().min(15).max(60),
  cardio_preference: z.enum(["none", "low_impact", "hiit_ok", "running_ok"]),
  constraints: z.string().optional(),
  focus: z.enum(["full_body", "upper", "lower", "core", "glutes", "posture"]),
  household_items_allowed: z.boolean(),
  baselines: z.object({
    pushups_max: z.number().optional(),
    squats_max: z.number().optional(),
    plank_seconds: z.number().optional(),
  }).optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// === OUTPUT SCHEMA (Workout Plan) ===

export const exerciseSchema = z.object({
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  rest_seconds: z.number(),
  tempo: z.string(),
  rpe: z.number(),
  form_cues: z.array(z.string()),
  substitutions: z.object({
    easier: z.string(),
    harder: z.string(),
    knee_friendly: z.string(),
    wrist_friendly: z.string(),
    low_impact: z.string().optional(),
  }),
});

export const blockSchema = z.object({
  block_name: z.string(),
  format: z.enum(["sets_reps", "emom", "amrap", "circuit", "intervals"]),
  exercises: z.array(exerciseSchema),
});

export const warmupCooldownSchema = z.object({
  name: z.string(),
  time_seconds: z.number(),
  cues: z.array(z.string()),
});

export const dayPlanSchema = z.object({
  day: z.string(),
  focus: z.string(),
  duration_minutes: z.number(),
  warmup: z.array(warmupCooldownSchema),
  workout: z.array(blockSchema),
  cooldown: z.array(warmupCooldownSchema),
  is_rest_day: z.boolean().optional(),
});

export const workoutPlanSchema = z.object({
  plan_name: z.string(),
  overview: z.object({
    goal: z.string(),
    weekly_structure: z.string(),
    intensity_guidance: z.string(),
  }),
  days: z.array(dayPlanSchema),
  next_week_progression: z.array(z.string()),
});

export type WorkoutPlan = z.infer<typeof workoutPlanSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type DayPlan = z.infer<typeof dayPlanSchema>;

// === SAVED WORKOUTS TABLE ===
export const savedWorkouts = pgTable("saved_workouts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  planName: text("plan_name").notNull(),
  planData: jsonb("plan_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSavedWorkoutSchema = createInsertSchema(savedWorkouts).omit({
  id: true,
  createdAt: true,
});

export type InsertSavedWorkout = z.infer<typeof insertSavedWorkoutSchema>;
export type SavedWorkout = typeof savedWorkouts.$inferSelect;
