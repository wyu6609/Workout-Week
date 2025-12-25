import { type UserPreferences, type WorkoutPlan, type DayPlan, type Exercise } from "@shared/schema";
import { EXERCISE_LIBRARY, getExercisesByPattern, type ExerciseDef } from "./exercises";

export function generateWorkoutPlan(prefs: UserPreferences): WorkoutPlan {
  const { goal, experience, days_per_week, minutes_per_session, household_items_allowed, focus, cardio_preference, constraints } = prefs;

  // 1. Determine Difficulty Level (1-3)
  let difficultyLevel = 1;
  if (experience === 'intermediate') difficultyLevel = 2;
  if (experience === 'advanced') difficultyLevel = 3;

  // 2. Weekly Split Logic
  // 3 days: Full Body x3
  // 4 days: Upper, Lower, Rest, Upper, Lower, Rest, Rest (or similar)
  // 5+ days: Push, Pull, Legs, Upper, Lower, etc.
  const schedule = generateSchedule(days_per_week, focus);

  // 3. Build Days
  const days: DayPlan[] = schedule.map((dayType, index) => {
    const isRest = dayType === 'Rest';
    const dayName = `Day ${index + 1}`;

    if (isRest) {
      return {
        day: dayName,
        focus: "Rest & Recovery",
        duration_minutes: 0,
        warmup: [],
        workout: [],
        cooldown: [],
        is_rest_day: true
      };
    }

    // Build Workout
    return buildDayWorkout(dayName, dayType, prefs, difficultyLevel);
  });

  return {
    plan_name: `Custom ${goal.replace('_', ' ')} Plan`,
    overview: {
      goal: formatGoal(goal),
      weekly_structure: `${days_per_week} days/week - ${focus} focus`,
      intensity_guidance: getIntensityGuidance(experience, goal),
    },
    days,
    next_week_progression: [
      "Increase reps by 1-2 on all sets",
      "Reduce rest times by 10 seconds",
      "Try the harder substitution for ease exercises"
    ]
  };
}

function generateSchedule(days: number, focus: string): string[] {
  // Simple logic for MVP
  const week = [];
  const corePattern = ['Full Body', 'Full Body', 'Full Body']; // Default 3 day

  if (focus === 'upper') {
    if (days === 3) return ['Upper Body', 'Upper Body', 'Full Body'];
    if (days === 4) return ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body'];
  } else if (focus === 'lower' || focus === 'glutes') {
    if (days === 3) return ['Lower Body', 'Upper Body', 'Lower Body'];
    if (days === 4) return ['Lower Body', 'Upper Body', 'Lower Body', 'Upper Body'];
  }

  // Default Full Body / Split logic based purely on days if focus is generic
  if (days === 3) return ['Full Body', 'Full Body', 'Full Body'];
  if (days === 4) return ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body'];
  if (days === 5) return ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body']; // Arnold/PPL hybrid
  if (days >= 6) return ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']; // PPLx2

  // Fill rest
  return Array(days).fill('Full Body'); // Fallback
}

function buildDayWorkout(dayName: string, type: string, prefs: UserPreferences, difficulty: number): DayPlan {
  const exercises: Exercise[] = [];
  const { goal, household_items_allowed, cardio_preference } = prefs;

  // Select patterns based on Day Type
  let patterns: string[] = [];
  if (type === 'Full Body') patterns = ['squat', 'push', 'hinge', 'pull', 'core'];
  if (type === 'Upper Body' || type === 'Push' || type === 'Pull') patterns = ['push', 'pull', 'core']; // Simplified for MVP
  if (type === 'Lower Body' || type === 'Legs') patterns = ['squat', 'hinge', 'core'];

  // Refine patterns for Push/Pull splits
  if (type === 'Push') patterns = ['push', 'squat', 'core'];
  if (type === 'Pull') patterns = ['pull', 'hinge', 'core'];

  // Add Cardio if requested
  if (cardio_preference !== 'none' && (goal === 'fat_loss' || goal === 'endurance')) {
    patterns.push('cardio');
  }

  // Fetch Exercises
  patterns.forEach(pattern => {
    const options = getExercisesByPattern(pattern, household_items_allowed, difficulty);
    if (options.length > 0) {
      // Pick random or first suitable
      const ex = options[Math.floor(Math.random() * options.length)];
      exercises.push(mapToExercise(ex, goal, difficulty));
    }
  });

  return {
    day: dayName,
    focus: type,
    duration_minutes: prefs.minutes_per_session,
    warmup: [{ name: "Dynamic Stretching", time_seconds: 180, cues: ["Arm circles", "Leg swings", "Torso twists"] }],
    workout: [
      {
        block_name: "Main Circuit",
        format: "circuit",
        exercises
      }
    ],
    cooldown: [{ name: "Static Stretching", time_seconds: 180, cues: ["Hamstring stretch", "Chest stretch", "Child's pose"] }],
    is_rest_day: false
  };
}

function mapToExercise(def: ExerciseDef, goal: string, difficulty: number): Exercise {
  // Determine sets/reps based on goal
  let sets = 3;
  let reps = "10-12";
  let rest = 60;

  if (goal === 'strength') {
    sets = 4;
    reps = "5-8";
    rest = 90;
  } else if (goal === 'endurance' || goal === 'fat_loss') {
    sets = 3;
    reps = "15-20";
    rest = 30;
  }

  return {
    name: def.name,
    sets,
    reps,
    rest_seconds: rest,
    tempo: "2-0-2",
    rpe: 7 + (difficulty * 0.5), // Scale RPE slightly with difficulty
    form_cues: def.cues,
    substitutions: {
      easier: def.substitutions.easier || "None defined",
      harder: def.substitutions.harder || "None defined",
      knee_friendly: def.substitutions.knee_friendly || "Rest",
      wrist_friendly: def.substitutions.wrist_friendly || "Rest",
    }
  };
}

function formatGoal(g: string) {
  return g.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getIntensityGuidance(exp: string, goal: string): string {
  if (exp === 'beginner') return "Focus on form first. Stop 2-3 reps before failure.";
  return "Push hard but maintain perfect technique. RPE 8-9 on last sets.";
}
