import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import { generateWorkoutPlan } from "./lib/generator";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { db } from "./db";
import { savedWorkouts, workoutPlanSchema } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

const MAX_SAVED_WORKOUTS = 10;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth before other routes
  await setupAuth(app);
  registerAuthRoutes(app);

  // Generate workout plan (public endpoint)
  app.post(api.workout.generate.path, async (req, res) => {
    try {
      const input = api.workout.generate.input.parse(req.body);
      const plan = generateWorkoutPlan(input);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      res.json(plan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to generate plan" });
    }
  });

  // Get saved workouts for authenticated user
  app.get("/api/saved-workouts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const workouts = await db
        .select()
        .from(savedWorkouts)
        .where(eq(savedWorkouts.userId, userId))
        .orderBy(desc(savedWorkouts.createdAt));
      
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching saved workouts:", error);
      res.status(500).json({ message: "Failed to fetch saved workouts" });
    }
  });

  // Save a workout (max 10)
  app.post("/api/saved-workouts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check current count
      const existing = await db
        .select()
        .from(savedWorkouts)
        .where(eq(savedWorkouts.userId, userId));
      
      if (existing.length >= MAX_SAVED_WORKOUTS) {
        return res.status(400).json({ 
          message: `You can only save up to ${MAX_SAVED_WORKOUTS} workouts. Please delete some to save more.` 
        });
      }
      
      // Validate plan data
      const planData = workoutPlanSchema.parse(req.body.planData);
      
      const [saved] = await db
        .insert(savedWorkouts)
        .values({
          userId,
          planName: planData.plan_name,
          planData: planData as any,
        })
        .returning();
      
      res.json(saved);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout plan data" });
      }
      console.error("Error saving workout:", error);
      res.status(500).json({ message: "Failed to save workout" });
    }
  });

  // Delete a saved workout
  app.delete("/api/saved-workouts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const workoutId = parseInt(req.params.id);
      
      if (isNaN(workoutId)) {
        return res.status(400).json({ message: "Invalid workout ID" });
      }
      
      const [deleted] = await db
        .delete(savedWorkouts)
        .where(and(
          eq(savedWorkouts.id, workoutId),
          eq(savedWorkouts.userId, userId)
        ))
        .returning();
      
      if (!deleted) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      res.json({ message: "Workout deleted" });
    } catch (error) {
      console.error("Error deleting workout:", error);
      res.status(500).json({ message: "Failed to delete workout" });
    }
  });

  return httpServer;
}
