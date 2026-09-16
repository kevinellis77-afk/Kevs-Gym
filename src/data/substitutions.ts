/**
 * Reasonable on-the-fly substitutes for exercises, by exercise id -
 * for when a machine's in use, or something's aggravating a joint
 * that day. Keyed and valued by the ids already defined in
 * workoutA/B/C.ts - a substitute doesn't have to come from the same
 * workout as the exercise it's standing in for.
 *
 * Deliberately not exhaustive: only pairs that are genuinely similar
 * in movement pattern and muscles worked. Several isolation
 * exercises (Seated Leg Curl, Leg Extension, Cable Bicep Curl,
 * Dumbbell Lateral Raise, Standing Calf Raise, Suitcase Hold) have
 * nothing comparable in the current exercise pool, so they're left
 * without a substitute rather than forcing a weak match - the swap
 * option just won't appear for those.
 */
export const exerciseSubstitutions: Record<string, string[]> = {
    // Workout A
    legpress: ["gobletsquat", "stepup"],
    chestpress: ["cablechestpress"],
    row: ["cablerow", "cablehighrow"],
    vertical: ["cablehighrow", "cablerow"],
    tricep: ["cabletricep"],
    pallof: ["woodchop"],
  
    // Workout B
    gobletsquat: ["legpress", "stepup"],
    cablepullthrough: ["kbdeadlift"],
    cablerow: ["row", "cablehighrow"],
    woodchop: ["pallof"],
  
    // Workout C
    stepup: ["gobletsquat", "legpress"],
    cablechestpress: ["chestpress"],
    facepull: ["cablehighrow", "row"],
    cablehighrow: ["row", "cablerow", "vertical"],
    kbdeadlift: ["cablepullthrough"],
    cabletricep: ["tricep"],
  };