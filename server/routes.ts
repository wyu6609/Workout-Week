import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import { generateWorkoutPlan } from "./lib/generator";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  return httpServer;
}
