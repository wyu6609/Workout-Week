import { z } from 'zod';
import { userPreferencesSchema, workoutPlanSchema } from './schema';
import type { DayPlan, Exercise, WorkoutPlan } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  workout: {
    generate: {
      method: 'POST' as const,
      path: '/api/generate-plan',
      input: userPreferencesSchema,
      responses: {
        200: workoutPlanSchema,
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
};

export type GeneratePlanInput = z.infer<typeof userPreferencesSchema>;
export type GeneratePlanResponse = z.infer<typeof workoutPlanSchema>;
export type { DayPlan, Exercise, WorkoutPlan };
