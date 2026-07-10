// ============================================================
// LaunchPilot — Weighted Sum Model (WSM) Recommendation Engine
// ============================================================
// Recommends branding strategies and marketing experiments for
// startups based on budget, team, stage, goal, and brand score.
// Uses the Weighted Sum Model for multi-criteria ranking.
// ============================================================

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// ── Resolve library.json path relative to this file ──────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LIBRARY_PATH = join(__dirname, "library.json");

// ============================================================
// 1. DATA LOADING — Load & unify experiments from library.json
// ============================================================

/**
 * Loads branding strategies and marketing experiments from
 * library.json and maps them into the unified experiment schema
 * expected by the WSM engine.
 *
 * Unified schema per experiment:
 *   { name, description, cost, time, teamSize,
 *     brandImpact, marketingImpact, validationImpact,
 *     stages, goals }
 */
export function loadExperiments(libraryPath = LIBRARY_PATH) {
  const raw = JSON.parse(readFileSync(libraryPath, "utf-8"));

  const branding = (raw.branding_strategies || []).map((e) => ({
    name: e.name,
    description: e.description,
    cost: e.cost,
    time: e.time_days,
    teamSize: e.team_size,
    // Branding strategies have high brand impact (brand_clarity_boost / 100),
    // moderate marketing relevance (audience_fit), and validation from
    // the validation_score field.
    brandImpact: e.brand_clarity_boost / 100, // normalize 0-100 → 0-1
    marketingImpact: e.audience_fit / 10, // normalize 1-10 → 0-1
    validationImpact: e.validation_score / 10, // normalize 1-10 → 0-1
    // Branding strategies are available at all stages and match
    // branding & validation goals.
    stages: ["idea", "mvp", "launched"],
    goals: ["branding", "validation", "awareness"],
  }));

  const marketing = (raw.marketing_experiments || []).map((e) => ({
    name: e.name,
    description: e.description,
    cost: e.cost,
    time: e.time_days,
    teamSize: e.team_size,
    brandImpact: e.audience_fit / 10, // audience fit as brand proxy
    marketingImpact: e.speed_to_evidence / 10, // how fast you reach people
    validationImpact: e.validation_score / 10,
    requiredBrandScore: e.required_brand_score || 0,
    // Marketing experiments are only for mvp & launched stages
    stages: ["mvp", "launched"],
    goals: ["awareness", "customers", "validation"],
  }));

  return [...branding, ...marketing];
}

// ============================================================
// 2. FILTERING — Remove experiments the user can't run
// ============================================================

/**
 * Filters experiments that don't match the user's hard constraints:
 *   - budget: experiment cost must not exceed budget
 *   - teamSize: experiment team must not exceed available team
 *   - stage: experiment must support the user's startup stage
 *   - goal: experiment must match the user's goal
 *
 * @param {Array} experiments - full experiment list
 * @param {Object} profile   - user profile
 * @returns {Array} filtered experiments
 */
export function filterExperiments(experiments, profile) {
  return experiments.filter((exp) => {
    // Cost must fit within budget
    if (exp.cost > profile.budget) return false;

    // Team size must be sufficient
    if (exp.teamSize > profile.teamSize) return false;

    // Experiment must support the user's stage
    if (!exp.stages.includes(profile.stage)) return false;

    // Experiment must match the user's goal
    if (!exp.goals.includes(profile.goal)) return false;

    return true;
  });
}

// ============================================================
// 3. NORMALIZATION — Scale criteria to [0, 1]
// ============================================================

/**
 * Normalizes a single column of values.
 *
 * - Benefit criteria (higher is better):  value / max(column)
 * - Cost criteria    (lower  is better):  min(column) / value
 *
 * Handles edge cases: zero columns, single-value columns.
 *
 * @param {number[]} values    - raw values for one criterion
 * @param {boolean}  isBenefit - true if higher is better
 * @returns {number[]} normalized values in [0, 1]
 */
export function normalizeColumn(values, isBenefit) {
  if (values.length === 0) return [];

  if (isBenefit) {
    const max = Math.max(...values);
    // If max is 0, all values are 0 → normalized to 0
    return values.map((v) => (max === 0 ? 0 : v / max));
  } else {
    const min = Math.min(...values);
    // If min is 0, cost-free items get score 1, others get min/v → 0
    return values.map((v) => {
      if (v === 0) return 1; // free is best possible
      return min === 0 ? 0 : min / v;
    });
  }
}

/**
 * Normalizes the full decision matrix across all criteria.
 *
 * @param {Array}  experiments - filtered experiment list
 * @param {Object} criteriaConfig - { criterionKey: { isBenefit: bool } }
 * @returns {Array} array of objects with normalized values per criterion
 */
export function normalizeMatrix(experiments, criteriaConfig) {
  const criteriaKeys = Object.keys(criteriaConfig);

  // Build per-column arrays
  const columns = {};
  for (const key of criteriaKeys) {
    columns[key] = experiments.map((exp) => exp[key]);
  }

  // Normalize each column
  const normalizedColumns = {};
  for (const key of criteriaKeys) {
    normalizedColumns[key] = normalizeColumn(
      columns[key],
      criteriaConfig[key].isBenefit
    );
  }

  // Reassemble into per-experiment objects
  return experiments.map((_, i) => {
    const row = {};
    for (const key of criteriaKeys) {
      row[key] = normalizedColumns[key][i];
    }
    return row;
  });
}

// ============================================================
// 4. WEIGHT CONFIGURATION — Goal-dependent weights
// ============================================================

/**
 * Returns the WSM weight vector for the given goal.
 *
 * Weight allocation per goal:
 *   - branding:   brandImpact=0.50, marketing=0.15, validation=0.10, cost=0.15, time=0.10
 *   - validation:  validation=0.45, brand=0.20, marketing=0.15, cost=0.10, time=0.10
 *   - awareness:  marketing=0.45, brand=0.25, validation=0.10, cost=0.10, time=0.10
 *   - customers:  marketing=0.35, validation=0.30, brand=0.15, cost=0.10, time=0.10
 */
export function getWeightsForGoal(goal) {
  const weightMap = {
    branding: {
      brandImpact: 0.5,
      marketingImpact: 0.15,
      validationImpact: 0.1,
      cost: 0.15,
      time: 0.1,
    },
    validation: {
      brandImpact: 0.2,
      marketingImpact: 0.15,
      validationImpact: 0.45,
      cost: 0.1,
      time: 0.1,
    },
    awareness: {
      brandImpact: 0.25,
      marketingImpact: 0.45,
      validationImpact: 0.1,
      cost: 0.1,
      time: 0.1,
    },
    customers: {
      brandImpact: 0.15,
      marketingImpact: 0.35,
      validationImpact: 0.3,
      cost: 0.1,
      time: 0.1,
    },
  };

  const weights = weightMap[goal];
  if (!weights) {
    throw new Error(`Unknown goal: "${goal}". Expected one of: ${Object.keys(weightMap).join(", ")}`);
  }

  return { ...weights }; // return a copy so callers can mutate
}

// ============================================================
// 5. BRANDING ADJUSTMENT — Boost brand weight when score < 50
// ============================================================

/**
 * If the user's brandingScore is below 50, the algorithm should
 * prioritize branding-related experiments before marketing.
 *
 * Adjustment: increase brandImpact weight by 10%,
 * decrease marketingImpact weight by the same absolute amount.
 *
 * @param {Object} weights       - mutable weight object
 * @param {number} brandingScore - user's brand identity score (0-100)
 * @returns {Object} adjusted weights (mutated in place & returned)
 */
export function applyBrandingAdjustment(weights, brandingScore) {
  if (brandingScore < 50) {
    const boost = weights.brandImpact * 0.1; // 10% of current brand weight
    weights.brandImpact += boost;
    weights.marketingImpact -= boost;

    // Guard against negative marketing weight
    if (weights.marketingImpact < 0) {
      weights.marketingImpact = 0;
    }
  }

  return weights;
}

// ============================================================
// 6. WSM SCORING — Weighted Sum Model
// ============================================================

/**
 * Computes the WSM score for each experiment.
 *
 * Score_i = Σ (weight_j × normalizedValue_ij)
 *
 * @param {Array}  normalizedMatrix - array of normalized row objects
 * @param {Object} weights          - { criterion: weight }
 * @returns {number[]} scores array (same order as input)
 */
export function computeWSMScores(normalizedMatrix, weights) {
  return normalizedMatrix.map((row) => {
    let score = 0;
    for (const [criterion, weight] of Object.entries(weights)) {
      score += weight * (row[criterion] ?? 0);
    }
    return parseFloat(score.toFixed(4));
  });
}

// ============================================================
// 7. CRITERIA CONFIGURATION — Benefit vs Cost classification
// ============================================================

/** Criteria classification: which criteria are benefit vs cost */
const CRITERIA_CONFIG = {
  cost: { isBenefit: false }, // lower is better
  time: { isBenefit: false }, // lower is better
  brandImpact: { isBenefit: true }, // higher is better
  marketingImpact: { isBenefit: true }, // higher is better
  validationImpact: { isBenefit: true }, // higher is better
};

// ============================================================
// 8. MAIN ENTRY POINT — recommend()
// ============================================================

/**
 * Main recommendation function.
 *
 * Takes a user profile and an array of experiments, applies the
 * full WSM pipeline, and returns ranked results.
 *
 * @param {Object} profile - user profile
 *   { budget, time, teamSize, stage, goal, brandingScore }
 * @param {Array} experiments - array of experiment objects
 *   { name, description, cost, time, teamSize,
 *     brandImpact, marketingImpact, validationImpact,
 *     stages, goals }
 * @returns {Array} sorted results
 *   [{ name, score, description, cost, time }, ...]
 */
export function recommend(profile, experiments) {
  // ── Step 1: Filter by hard constraints ──────────────────
  const filtered = filterExperiments(experiments, profile);

  if (filtered.length === 0) {
    return []; // no experiments match constraints
  }

  // ── Step 2: Normalize the decision matrix ───────────────
  const normalizedMatrix = normalizeMatrix(filtered, CRITERIA_CONFIG);

  // ── Step 3: Get goal-dependent weights ──────────────────
  const weights = getWeightsForGoal(profile.goal);

  // ── Step 4: Apply branding adjustment ───────────────────
  applyBrandingAdjustment(weights, profile.brandingScore);

  // ── Step 5: Compute WSM scores ──────────────────────────
  const scores = computeWSMScores(normalizedMatrix, weights);

  // ── Step 6: Build result array ──────────────────────────
  const results = filtered.map((exp, i) => ({
    name: exp.name,
    score: scores[i],
    description: exp.description,
    cost: exp.cost,
    time: exp.time,
  }));

  // ── Step 7: Sort by score descending ────────────────────
  results.sort((a, b) => b.score - a.score);

  return results;
}

// ============================================================
// 9. DEMO — Example dataset and execution
// ============================================================

/**
 * Runs a demonstration with a sample user profile and
 * experiment dataset. Uses both inline sample data and
 * the real library.json if available.
 */
function demo() {
  console.log("═".repeat(60));
  console.log("  LaunchPilot — WSM Recommendation Engine Demo");
  console.log("═".repeat(60));

  // ── Sample experiments (inline, framework-agnostic) ─────
  const sampleExperiments = [
    {
      name: "Brand Positioning Workshop",
      description:
        "Define your unique value proposition in a focused 2-hour session.",
      cost: 0,
      time: 2,
      teamSize: 1,
      brandImpact: 0.25,
      marketingImpact: 0.7,
      validationImpact: 0.8,
      stages: ["idea", "mvp", "launched"],
      goals: ["branding", "validation", "awareness"],
    },
    {
      name: "Customer Persona Deep-Dive",
      description:
        "Interview 10-15 potential users to build detailed personas.",
      cost: 100,
      time: 5,
      teamSize: 1,
      brandImpact: 0.3,
      marketingImpact: 1.0,
      validationImpact: 0.9,
      stages: ["idea", "mvp", "launched"],
      goals: ["branding", "validation", "awareness"],
    },
    {
      name: "Instagram Ad Test",
      description:
        "Run a $5/day Instagram ad for 4 days targeting your audience.",
      cost: 180,
      time: 4,
      teamSize: 1,
      brandImpact: 0.1,
      marketingImpact: 0.6,
      validationImpact: 0.5,
      stages: ["mvp", "launched"],
      goals: ["awareness", "customers"],
    },
    {
      name: "Landing Page A/B Test",
      description:
        "Split traffic 50/50 between two headline variants to find the winner.",
      cost: 100,
      time: 5,
      teamSize: 2,
      brandImpact: 0.15,
      marketingImpact: 0.8,
      validationImpact: 0.7,
      stages: ["mvp", "launched"],
      goals: ["awareness", "customers", "validation"],
    },
    {
      name: "Reddit/Forum Engagement",
      description:
        "Answer questions in relevant subreddits for 3 days. Be helpful, not salesy.",
      cost: 0,
      time: 3,
      teamSize: 1,
      brandImpact: 0.15,
      marketingImpact: 0.9,
      validationImpact: 0.7,
      stages: ["idea", "mvp", "launched"],
      goals: ["awareness", "customers", "validation"],
    },
    {
      name: "Cold Outreach Campaign",
      description:
        "Send 50 personalized emails to prospects matching your persona.",
      cost: 0,
      time: 5,
      teamSize: 1,
      brandImpact: 0.1,
      marketingImpact: 0.8,
      validationImpact: 0.7,
      stages: ["mvp", "launched"],
      goals: ["customers", "validation"],
    },
    {
      name: "Messaging Framework Sprint",
      description:
        "Craft 3 versions of your core message and test on 5 people.",
      cost: 0,
      time: 3,
      teamSize: 1,
      brandImpact: 0.2,
      marketingImpact: 0.8,
      validationImpact: 0.7,
      stages: ["idea", "mvp", "launched"],
      goals: ["branding", "validation", "awareness"],
    },
    {
      name: "Influencer Micro-Partnership",
      description:
        "Partner with a micro-influencer (1K-10K followers) for a sponsored post.",
      cost: 150,
      time: 7,
      teamSize: 1,
      brandImpact: 0.2,
      marketingImpact: 0.5,
      validationImpact: 0.6,
      stages: ["mvp", "launched"],
      goals: ["awareness", "customers"],
    },
  ];

  // ── User profile: early-stage founder with weak branding ─
  const profile = {
    budget: 200,
    time: 14,
    teamSize: 1,
    stage: "mvp",
    goal: "branding",
    brandingScore: 35, // below 50 → branding adjustment kicks in
  };

  console.log("\n📋 User Profile:");
  console.log(`   Budget:     $${profile.budget}`);
  console.log(`   Time:       ${profile.time} days`);
  console.log(`   Team size:  ${profile.teamSize}`);
  console.log(`   Stage:      ${profile.stage}`);
  console.log(`   Goal:       ${profile.goal}`);
  console.log(`   Brand score: ${profile.brandingScore}/100`);

  // ── Run the engine on sample data ──────────────────────
  console.log("\n" + "─".repeat(60));
  console.log("  Results (sample dataset)");
  console.log("─".repeat(60));

  const results = recommend(profile, sampleExperiments);
  printResults(results);

  // ── Run with a different goal for comparison ────────────
  const awarenessProfile = { ...profile, goal: "awareness", brandingScore: 70 };
  console.log("\n" + "─".repeat(60));
  console.log("  Results (goal: awareness, brandingScore: 70)");
  console.log("─".repeat(60));

  const awarenessResults = recommend(awarenessProfile, sampleExperiments);
  printResults(awarenessResults);

  // ── Run with library.json data ─────────────────────────
  try {
    const libraryExperiments = loadExperiments();
    const validationProfile = {
      budget: 150,
      time: 7,
      teamSize: 1,
      stage: "idea",
      goal: "validation",
      brandingScore: 40,
    };

    console.log("\n" + "─".repeat(60));
    console.log("  Results (library.json, goal: validation)");
    console.log("─".repeat(60));
    console.log(`   Budget: $${validationProfile.budget}`);
    console.log(`   Stage: ${validationProfile.stage}`);
    console.log(`   Brand score: ${validationProfile.brandingScore}`);

    const libResults = recommend(validationProfile, libraryExperiments);
    printResults(libResults);
  } catch {
    console.log("\n⚠️  library.json not found — skipping library demo.");
  }
}

/**
 * Pretty-prints the ranked results to the console.
 * @param {Array} results - sorted result array from recommend()
 */
function printResults(results) {
  if (results.length === 0) {
    console.log("   No experiments match your constraints.");
    return;
  }

  results.forEach((r, i) => {
    console.log(
      `\n   #${i + 1}  ${r.name}  (score: ${r.score})`
    );
    console.log(`       ${r.description}`);
    console.log(`       Cost: $${r.cost} | Time: ${r.time} days`);
  });
}

// ── Run demo when executed directly ──────────────────────
demo();
