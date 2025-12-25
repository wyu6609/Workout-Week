// Hardcoded exercise library
// Patterns: Push, Pull, Squat, Hinge, Core, Cardio, Mobility

export interface ExerciseDef {
  id: string;
  name: string;
  pattern: "push" | "pull" | "squat" | "hinge" | "core" | "cardio" | "mobility";
  equipment: "none" | "household" | "gym"; // 'gym' not used in this app per constraints
  difficulty: 1 | 2 | 3; // 1=beginner, 2=intermediate, 3=advanced
  cues: string[];
  substitutions: {
    easier?: string;
    harder?: string;
    knee_friendly?: string;
    wrist_friendly?: string;
    low_impact?: string;
  };
}

export const EXERCISE_LIBRARY: ExerciseDef[] = [
  // === PUSH ===
  {
    id: "pushup_std",
    name: "Standard Pushups",
    pattern: "push",
    equipment: "none",
    difficulty: 2,
    cues: ["Hands shoulder-width", "Core tight", "Chest to floor"],
    substitutions: {
      easier: "Knee Pushups",
      harder: "Decline Pushups (feet elevated)",
      wrist_friendly: "Knuckle Pushups or Wall Pushups",
    }
  },
  {
    id: "pushup_knee",
    name: "Knee Pushups",
    pattern: "push",
    equipment: "none",
    difficulty: 1,
    cues: ["Knees on floor", "Straight line from head to knees"],
    substitutions: {
      harder: "Standard Pushups",
      wrist_friendly: "Wall Pushups"
    }
  },
  {
    id: "pushup_decline",
    name: "Decline Pushups",
    pattern: "push",
    equipment: "household", // Chair/sofa
    difficulty: 3,
    cues: ["Feet elevated on chair", "Control the descent"],
    substitutions: {
      easier: "Standard Pushups",
    }
  },
  {
    id: "pike_pushup",
    name: "Pike Pushups",
    pattern: "push", // Vertical push focus
    equipment: "none",
    difficulty: 2,
    cues: ["Hips high like a V", "Lower head towards floor"],
    substitutions: {
      easier: "Pike Hold",
      harder: "Handstand Pushup negatives",
    }
  },
  {
    id: "dips_chair",
    name: "Chair Dips",
    pattern: "push",
    equipment: "household",
    difficulty: 2,
    cues: ["Hands on chair edge", "Lower hips, keep back close to chair"],
    substitutions: {
      easier: "Bent-knee Chair Dips",
      harder: "Straight-leg Chair Dips",
      wrist_friendly: "Tricep Pushups (on floor)"
    }
  },

  // === PULL (Hard without equipment, relying on household items or bodyweight rows if possible) ===
  {
    id: "door_row",
    name: "Doorframe Rows",
    pattern: "pull",
    equipment: "none", // Uses a doorframe
    difficulty: 1,
    cues: ["Grip doorframe", "Lean back", "Pull chest to door"],
    substitutions: {
      harder: "Single-arm Door Row",
    }
  },
  {
    id: "towel_row",
    name: "Floor Towel Rows",
    pattern: "pull",
    equipment: "household", // Towel + smooth floor (optional) or just isometric
    difficulty: 2,
    cues: ["Lie on stomach", "Hold towel", "Pull towel apart and row to chest"],
    substitutions: {
      easier: "Superman Hold",
    }
  },
  {
    id: "table_row",
    name: "Inverted Rows (under table)",
    pattern: "pull",
    equipment: "household", // Sturdy table
    difficulty: 3,
    cues: ["Lie under sturdy table", "Grip edge", "Pull chest to table"],
    substitutions: {
      easier: "Doorframe Rows",
    }
  },

  // === SQUAT ===
  {
    id: "squat_bw",
    name: "Bodyweight Squats",
    pattern: "squat",
    equipment: "none",
    difficulty: 1,
    cues: ["Feet shoulder width", "Chest up", "Knees out"],
    substitutions: {
      harder: "Jump Squats",
      knee_friendly: "Box Squats (to chair)"
    }
  },
  {
    id: "squat_jump",
    name: "Jump Squats",
    pattern: "squat",
    equipment: "none",
    difficulty: 2,
    cues: ["Explosive jump up", "Soft landing"],
    substitutions: {
      easier: "Bodyweight Squats",
      knee_friendly: "Speed Squats (no jump)"
    }
  },
  {
    id: "lunge_reverse",
    name: "Reverse Lunges",
    pattern: "squat", // Unilateral
    equipment: "none",
    difficulty: 2,
    cues: ["Step back", "Back knee hovers floor", "Front knee stable"],
    substitutions: {
      easier: "Split Squat (stationary)",
      harder: "Jumping Lunges",
      knee_friendly: "Glute Bridges"
    }
  },
  {
    id: "bulgarian_split_squat",
    name: "Bulgarian Split Squats",
    pattern: "squat",
    equipment: "household", // Chair/sofa
    difficulty: 3,
    cues: ["Back foot on chair", "Lower hips straight down"],
    substitutions: {
      easier: "Reverse Lunges",
      knee_friendly: "Step-ups"
    }
  },

  // === HINGE ===
  {
    id: "glute_bridge",
    name: "Glute Bridges",
    pattern: "hinge",
    equipment: "none",
    difficulty: 1,
    cues: ["Lie on back", "Squeeze glutes to lift hips"],
    substitutions: {
      harder: "Single-leg Glute Bridge",
    }
  },
  {
    id: "single_leg_bridge",
    name: "Single-Leg Glute Bridge",
    pattern: "hinge",
    equipment: "none",
    difficulty: 2,
    cues: ["One foot grounded", "Drive through heel"],
    substitutions: {
      easier: "Glute Bridge",
      harder: "Feet-elevated Glute Bridge (household item)"
    }
  },
  {
    id: "romanian_deadlift_bw",
    name: "Single-Leg RDL (Bodyweight)",
    pattern: "hinge",
    equipment: "none",
    difficulty: 2,
    cues: ["Hinge at hips", "Back flat", "Slight knee bend"],
    substitutions: {
      easier: "Good Mornings",
    }
  },

  // === CORE ===
  {
    id: "plank",
    name: "Forearm Plank",
    pattern: "core",
    equipment: "none",
    difficulty: 1,
    cues: ["Elbows under shoulders", "Body in straight line", "Squeeze glutes"],
    substitutions: {
      easier: "Knee Plank",
      harder: "Plank with Shoulder Taps"
    }
  },
  {
    id: "mountain_climbers",
    name: "Mountain Climbers",
    pattern: "core",
    equipment: "none",
    difficulty: 2,
    cues: ["Pushup position", "Drive knees to chest rapidly"],
    substitutions: {
      easier: "Slow Mountain Climbers",
      wrist_friendly: "Dead Bug"
    }
  },
  {
    id: "dead_bug",
    name: "Dead Bug",
    pattern: "core",
    equipment: "none",
    difficulty: 1,
    cues: ["Lower opposite arm and leg", "Keep lower back glued to floor"],
    substitutions: {
      harder: "Hollow Body Hold"
    }
  },

  // === CARDIO ===
  {
    id: "burpees",
    name: "Burpees",
    pattern: "cardio",
    equipment: "none",
    difficulty: 3,
    cues: ["Chest to floor", "Jump up", "Clap overhead"],
    substitutions: {
      easier: "No-Pushup Burpees",
      low_impact: "Step-out Burpees (no jump)"
    }
  },
  {
    id: "jumping_jacks",
    name: "Jumping Jacks",
    pattern: "cardio",
    equipment: "none",
    difficulty: 1,
    cues: ["Full range of motion", "Light on feet"],
    substitutions: {
      low_impact: "Step Jacks"
    }
  },
  {
    id: "high_knees",
    name: "High Knees",
    pattern: "cardio",
    equipment: "none",
    difficulty: 2,
    cues: ["Knees to hip height", "Fast pace"],
    substitutions: {
      low_impact: "March in Place"
    }
  }
];

export function getExercisesByPattern(pattern: string, allowHousehold: boolean, difficultyMax: number): ExerciseDef[] {
  return EXERCISE_LIBRARY.filter(ex =>
    ex.pattern === pattern &&
    (allowHousehold || ex.equipment === 'none') &&
    ex.difficulty <= difficultyMax
  );
}
