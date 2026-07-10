const GOAL_WEIGHTS = {
  branding: {
    brandImpact: 0.5,
    marketingImpact: 0.15,
    validationImpact: 0.1,
    cost: 0.15,
    time: 0.1,
  },
  validation: {
    validationImpact: 0.45,
    brandImpact: 0.2,
    marketingImpact: 0.15,
    cost: 0.1,
    time: 0.1,
  },
  awareness: {
    marketingImpact: 0.45,
    brandImpact: 0.25,
    validationImpact: 0.1,
    cost: 0.1,
    time: 0.1,
  },
  customers: {
    marketingImpact: 0.35,
    validationImpact: 0.3,
    brandImpact: 0.15,
    cost: 0.1,
    time: 0.1,
  },
};

const BENEFIT_CRITERIA = ["brandImpact", "marketingImpact", "validationImpact"];
const COST_CRITERIA = ["cost", "time"];
const ALL_CRITERIA = [...BENEFIT_CRITERIA, ...COST_CRITERIA];

function supportsValue(values, target) {
  return Array.isArray(values) && values.includes(target);
}

function filterExperiments(userProfile, experiments) {
  return experiments.filter((experiment) => {
    const fitsBudget = experiment.cost <= userProfile.budget;
    const fitsTeam = experiment.teamSize <= userProfile.teamSize;
    const fitsStage = supportsValue(experiment.stages, userProfile.stage);
    const fitsGoal = supportsValue(experiment.goals, userProfile.goal);

    return fitsBudget && fitsTeam && fitsStage && fitsGoal;
  });
}

function getGoalWeights(goal) {
  const weights = GOAL_WEIGHTS[goal];

  if (!weights) {
    throw new Error(`Unsupported goal: ${goal}`);
  }

  return { ...weights };
}

function applyBrandingAdjustment(weights, brandingScore) {
  if (brandingScore >= 50) {
    return weights;
  }

  const brandIncrease = weights.brandImpact * 0.1;
  const adjustedMarketing = Math.max(0, weights.marketingImpact - brandIncrease);

  return {
    ...weights,
    brandImpact: weights.brandImpact + brandIncrease,
    marketingImpact: adjustedMarketing,
  };
}

function getMinMax(experiments, criterion) {
  const values = experiments.map((experiment) => experiment[criterion]);

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function normalizeBenefit(value, max) {
  if (max === 0) {
    return 0;
  }

  return value / max;
}

function normalizeCost(value, min) {
  if (value === 0) {
    return 1;
  }

  return min / value;
}

function normalizeExperiment(experiment, ranges) {
  return ALL_CRITERIA.reduce((normalized, criterion) => {
    if (BENEFIT_CRITERIA.includes(criterion)) {
      normalized[criterion] = normalizeBenefit(experiment[criterion], ranges[criterion].max);
    } else {
      normalized[criterion] = normalizeCost(experiment[criterion], ranges[criterion].min);
    }

    return normalized;
  }, {});
}

function calculateScore(normalizedExperiment, weights) {
  return ALL_CRITERIA.reduce((score, criterion) => {
    return score + normalizedExperiment[criterion] * weights[criterion];
  }, 0);
}

function roundScore(score) {
  return Number(score.toFixed(2));
}

function recommendExperiments(userProfile, experiments) {
  const filteredExperiments = filterExperiments(userProfile, experiments);

  if (filteredExperiments.length === 0) {
    return [];
  }

  const weights = applyBrandingAdjustment(
    getGoalWeights(userProfile.goal),
    userProfile.brandingScore
  );

  const ranges = ALL_CRITERIA.reduce((result, criterion) => {
    result[criterion] = getMinMax(filteredExperiments, criterion);
    return result;
  }, {});

  return filteredExperiments
    .map((experiment) => {
      const normalizedExperiment = normalizeExperiment(experiment, ranges);
      const score = calculateScore(normalizedExperiment, weights);

      return {
        name: experiment.name,
        score: roundScore(score),
        description: experiment.description,
        cost: experiment.cost,
        time: experiment.time,
      };
    })
    .sort((a, b) => b.score - a.score);
}

const exampleUserProfile = {
  budget: 120,
  time: 7,
  teamSize: 3,
  stage: "mvp",
  goal: "branding",
  brandingScore: 42,
};

const exampleExperiments = [
  {
    name: "Brand Positioning Sprint",
    description: "Define audience, promise, voice, and core brand messages.",
    cost: 40,
    time: 3,
    teamSize: 2,
    brandImpact: 95,
    marketingImpact: 45,
    validationImpact: 50,
    stages: ["idea", "mvp"],
    goals: ["branding", "validation"],
  },
  {
    name: "Landing Page A/B Test",
    description: "Test two homepage messages against visitor sign-up intent.",
    cost: 75,
    time: 5,
    teamSize: 2,
    brandImpact: 60,
    marketingImpact: 70,
    validationImpact: 85,
    stages: ["mvp", "launched"],
    goals: ["validation", "customers", "branding"],
  },
  {
    name: "Founder Story Social Campaign",
    description: "Publish short founder-led posts to build early recognition.",
    cost: 30,
    time: 4,
    teamSize: 1,
    brandImpact: 80,
    marketingImpact: 85,
    validationImpact: 35,
    stages: ["idea", "mvp", "launched"],
    goals: ["branding", "awareness"],
  },
  {
    name: "Paid Search Acquisition Test",
    description: "Run targeted search ads to learn customer acquisition cost.",
    cost: 180,
    time: 5,
    teamSize: 2,
    brandImpact: 35,
    marketingImpact: 90,
    validationImpact: 60,
    stages: ["mvp", "launched"],
    goals: ["customers", "awareness"],
  },
];

if (require.main === module) {
  console.log(recommendExperiments(exampleUserProfile, exampleExperiments));
}

module.exports = {
  recommendExperiments,
  filterExperiments,
  getGoalWeights,
  applyBrandingAdjustment,
  normalizeExperiment,
  calculateScore,
  exampleUserProfile,
  exampleExperiments,
};
