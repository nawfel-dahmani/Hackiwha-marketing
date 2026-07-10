import numpy as np
import json
import os


DEFAULT_LIBRARY_PATH = os.path.join(os.path.dirname(__file__), "library.json")


def load_experiment_library(library_path=DEFAULT_LIBRARY_PATH):
    """Load branding strategies and marketing experiments from library.json."""
    with open(library_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    branding_strategies = data.get("branding_strategies", [])
    marketing_experiments = data.get("marketing_experiments", [])

    return branding_strategies + marketing_experiments


EXPERIMENT_LIBRARY = load_experiment_library()


def calculate_brand_identity_score(founder_inputs):
    """
    Calculates a 0-100 brand identity score from founder inputs.

    Required fields (1-5 scale, except has_visual_identity which is 0/1):
    - audience_clarity: How specific is your target audience? (1=vague, 5=laser-focused)
    - value_prop_clarity: How clearly can you state what you do and why it matters? (1-5)
    - has_visual_identity: Do you have a logo, colors, or visual style? (0 or 1)
    - messaging_consistency: Is your messaging consistent across channels? (1-5)
    - differentiation_known: Do you know how you're different from competitors? (1-5)
    """
    audience_clarity = founder_inputs.get('audience_clarity', 1)
    value_prop_clarity = founder_inputs.get('value_prop_clarity', 1)
    has_visual_identity = founder_inputs.get('has_visual_identity', 0)
    messaging_consistency = founder_inputs.get('messaging_consistency', 1)
    differentiation_known = founder_inputs.get('differentiation_known', 1)

    weights = {
        'audience_clarity': 0.25,
        'value_prop_clarity': 0.30,
        'has_visual_identity': 0.15,
        'messaging_consistency': 0.15,
        'differentiation_known': 0.15
    }

    normalized = {
        'audience_clarity': (audience_clarity - 1) / 4,
        'value_prop_clarity': (value_prop_clarity - 1) / 4,
        'has_visual_identity': has_visual_identity,
        'messaging_consistency': (messaging_consistency - 1) / 4,
        'differentiation_known': (differentiation_known - 1) / 4
    }

    score = sum(normalized[k] * weights[k] for k in weights) * 100
    return round(score, 1)


# ============================================================
# SAW ALGORITHM (IDENTICAL — adapted to dicts)
# ============================================================

def saw_rank(experiments, criteria_weights, is_benefit, verbose=False):
    """
    Simple Additive Weighting (SAW) — IDENTICAL algorithm.

    experiments: list of dicts with keys matching criteria_weights
    criteria_weights: dict {criterion_name: weight}
    is_benefit: dict {criterion_name: True/False}
    """
    if not experiments:
        return []

    criteria_names = list(criteria_weights.keys())
    matrix = np.array([[exp[c] for c in criteria_names] for exp in experiments], dtype=float)
    weights = np.array([criteria_weights[c] for c in criteria_names], dtype=float)
    benefit_flags = [is_benefit[c] for c in criteria_names]

    num_alternatives, num_criteria = matrix.shape

    # NORMALIZATION
    normalized = np.zeros_like(matrix)
    for j in range(num_criteria):
        if benefit_flags[j]:
            col_max = np.max(matrix[:, j])
            normalized[:, j] = matrix[:, j] / col_max if col_max != 0 else 0
        else:
            col_min = np.min(matrix[:, j])
            normalized[:, j] = col_min / matrix[:, j] if col_min != 0 else 0

    # APPLY WEIGHTS
    weighted = normalized * weights

    # CALCULATE SCORES
    scores = np.sum(weighted, axis=1)

    # RANK
    ranked_indices = np.argsort(scores)[::-1]

    results = []
    for rank, idx in enumerate(ranked_indices, 1):
        exp = experiments[idx]
        results.append({
            'rank': rank,
            'score': round(float(scores[idx]), 4),
            'experiment': exp,
            'normalized_breakdown': {
                c: round(float(normalized[idx, j]), 3)
                for j, c in enumerate(criteria_names)
            }
        })

    if verbose:
        print(f"\nSAW Ranking ({len(experiments)} alternatives):")
        for r in results:
            print(f"  #{r['rank']}: {r['experiment']['name']} (score: {r['score']})")

    return results


# ============================================================
# CONSTRAINT FILTERING
# ============================================================

def filter_by_constraints(experiments, founder_inputs):
    """Filter out experiments that exceed hard constraints."""
    return [
        exp for exp in experiments
        if exp['cost'] <= founder_inputs.get('budget', float('inf'))
        and exp['time_days'] <= founder_inputs.get('max_days', float('inf'))
        and exp['team_size'] <= founder_inputs.get('team_size', float('inf'))
    ]


# ============================================================
# MAIN LEARNFIRST ORCHESTRATOR
# ============================================================

def learnfirst(founder_inputs, threshold=60, verbose=False):
    """
    Main LearnFirst logic:
    1. Calculate brand identity score
    2. If >= threshold: SAW on marketing experiments
    3. If < threshold: SAW on branding strategies, then SAW on aligned marketing
    """
    brand_score = calculate_brand_identity_score(founder_inputs)

    if verbose:
        print("=" * 60)
        print("LEARNFIRST DECISION ENGINE")
        print("=" * 60)
        print(f"\nBrand Identity Score: {brand_score}/100")
        print(f"   Threshold: {threshold}")
        status = 'BRAND READY' if brand_score >= threshold else 'BRANDING NEEDED'
        print(f"   Status: {status}")

    # Shared SAW configuration
    saw_criteria = {
        'cost': 0.20,
        'time_days': 0.15,
        'team_size': 0.10,
        'validation_score': 0.25,
        'audience_fit': 0.15,
        'speed_to_evidence': 0.15
    }
    saw_is_benefit = {
        'cost': False,
        'time_days': False,
        'team_size': False,
        'validation_score': True,
        'audience_fit': True,
        'speed_to_evidence': True
    }

    if brand_score >= threshold:
        # MODE A: Marketing-Ready
        marketing_exps = [e for e in EXPERIMENT_LIBRARY if e['type'] == 'marketing']
        candidates = filter_by_constraints(marketing_exps, founder_inputs)
        candidates = [e for e in candidates if e.get('required_brand_score', 0) <= brand_score]

        rankings = saw_rank(candidates, saw_criteria, saw_is_benefit, verbose=verbose)

        output = {
            'mode': 'marketing_ready',
            'brand_score': brand_score,
            'threshold': threshold,
            'recommendations': rankings
        }

        if verbose:
            print(f"\nOutput: Top Marketing Experiments")

    else:
        # MODE B: Branding First
        branding_exps = [e for e in EXPERIMENT_LIBRARY if e['type'] == 'branding']
        brand_candidates = filter_by_constraints(branding_exps, founder_inputs)
        brand_rankings = saw_rank(brand_candidates, saw_criteria, saw_is_benefit, verbose=verbose)

        if not brand_rankings:
            return {'mode': 'error', 'message': 'No branding strategies fit your constraints'}

        top_brand = brand_rankings[0]['experiment']
        top_brand_tags = set(top_brand['tags'])

        if verbose:
            print(f"\nTop Branding Strategy: {top_brand['name']}")
            print(f"   Tags: {top_brand['tags']}")
            print(f"   Brand clarity boost: +{top_brand['brand_clarity_boost']} points")

        # Marketing experiments aligned with top branding
        marketing_exps = [e for e in EXPERIMENT_LIBRARY if e['type'] == 'marketing']
        marketing_candidates = filter_by_constraints(marketing_exps, founder_inputs)
        projected_score = min(100, brand_score + top_brand['brand_clarity_boost'])

        marketing_candidates = [
            e for e in marketing_candidates 
            if e.get('required_brand_score', 0) <= projected_score
        ]

        # Add brand alignment score
        for exp in marketing_candidates:
            exp_tags = set(exp.get('brand_strategy_tags', []))
            if top_brand_tags and exp_tags:
                alignment = len(exp_tags & top_brand_tags) / len(top_brand_tags)
            else:
                alignment = 0
            exp['brand_alignment'] = round(alignment, 2)

        # SAW with alignment as extra criterion
        marketing_criteria = saw_criteria.copy()
        marketing_criteria['brand_alignment'] = 0.15
        marketing_is_benefit = saw_is_benefit.copy()
        marketing_is_benefit['brand_alignment'] = True

        marketing_rankings = saw_rank(marketing_candidates, marketing_criteria, marketing_is_benefit, verbose=verbose)

        output = {
            'mode': 'branding_first',
            'brand_score': brand_score,
            'threshold': threshold,
            'projected_score_after_branding': projected_score,
            'branding_recommendations': brand_rankings,
            'marketing_recommendations': marketing_rankings,
            'rationale': (
                f"Brand score {brand_score} is below {threshold}. "
                f"Start with '{top_brand['name']}' to boost clarity by {top_brand['brand_clarity_boost']} points, "
                f"then execute aligned marketing experiments."
            )
        }

        if verbose:
            print(f"\nOutput: Branding + Marketing Roadmap")
            print(f"   Projected brand score after branding: {projected_score}/100")

    return output


# ============================================================
# EXAMPLE USAGE
# ============================================================

if __name__ == "__main__":
    # Example: Founder with weak brand identity
    founder = {
        'industry': 'SaaS',
        'target_audience': 'Small businesses',
        'goal': 'validate_demand',
        'budget': 200,
        'team_size': 1,
        'max_days': 14,
        'audience_clarity': 2,
        'value_prop_clarity': 2,
        'has_visual_identity': 0,
        'messaging_consistency': 1,
        'differentiation_known': 1
    }

    result = learnfirst(founder, threshold=60, verbose=True)
    print("\n" + "=" * 60)
    print("RESULT:")
    print("=" * 60)
    print(json.dumps({
        'mode': result['mode'],
        'brand_score': result['brand_score'],
        'threshold': result['threshold']
    }, indent=2))
