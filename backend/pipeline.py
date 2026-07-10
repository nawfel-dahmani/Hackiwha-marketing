import json
import os
from datetime import datetime

from engine import DEFAULT_LIBRARY_PATH, learnfirst
from hf_agents import (
    fallback_ai_recommendation,
    fallback_roadmap_report,
    generate_ai_recommendation,
    generate_roadmap_report,
)
from report_generator import save_markdown_report, save_pdf_report


def load_library_data(library_path=DEFAULT_LIBRARY_PATH):
    with open(library_path, "r", encoding="utf-8") as file:
        return json.load(file)


def run_launchpilot_analysis(
    founder_inputs,
    threshold=60,
    use_hugging_face=True,
    save_report=True,
):
    """
    Run the complete backend flow:
    1. Deterministic decision engine
    2. Hugging Face Agent 1 structured recommendation
    3. Hugging Face Agent 2 roadmap/report comparison
    4. Optional Markdown report export
    """
    library = load_library_data()
    algorithm_output = learnfirst(founder_inputs, threshold=threshold, verbose=False)

    hf_status = {
        "enabled": use_hugging_face,
        "used_fallback": False,
        "error": None,
    }

    if use_hugging_face:
        try:
            # Prune library to minimize prompt token count and reduce API latency
            pruned_library = {
                "branding_strategies": [
                    {
                        "id": item.get("id"),
                        "name": item.get("name"),
                        "description": item.get("description"),
                        "type": item.get("type", "branding")
                    } for item in library.get("branding_strategies", [])
                ],
                "marketing_experiments": [
                    {
                        "id": item.get("id"),
                        "name": item.get("name"),
                        "description": item.get("description"),
                        "type": item.get("type", "marketing")
                    } for item in library.get("marketing_experiments", [])
                ]
            }
            ai_output = generate_ai_recommendation(
                founder_inputs,
                pruned_library,
                algorithm_output,
            )
            roadmap_report = generate_roadmap_report(
                founder_inputs,
                algorithm_output,
                ai_output,
            )
        except Exception as exc:
            hf_status["used_fallback"] = True
            hf_status["error"] = str(exc)
            ai_output = fallback_ai_recommendation(algorithm_output)
            roadmap_report = fallback_roadmap_report(
                founder_inputs,
                algorithm_output,
                ai_output,
            )
    else:
        hf_status["used_fallback"] = True
        ai_output = fallback_ai_recommendation(algorithm_output)
        roadmap_report = fallback_roadmap_report(
            founder_inputs,
            algorithm_output,
            ai_output,
        )

    analysis = {
        "founder_inputs": founder_inputs,
        "algorithm_output": algorithm_output,
        "ai_output": ai_output,
        "roadmap_report": roadmap_report,
        "hf_status": hf_status,
    }

    if save_report:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        reports_dir = os.path.join(os.path.dirname(__file__), "reports")

        md_path = os.path.join(reports_dir, f"launchpilot_report_{timestamp}.md")
        analysis["report_path"] = save_markdown_report(analysis, md_path)

        pdf_path = os.path.join(reports_dir, f"launchpilot_report_{timestamp}.pdf")
        analysis["pdf_report_path"] = save_pdf_report(analysis, pdf_path)

    return analysis


if __name__ == "__main__":
    example_founder = {
        "industry": "SaaS",
        "target_audience": "Small businesses",
        "goal": "validate_demand",
        "budget": 200,
        "team_size": 1,
        "max_days": 14,
        "audience_clarity": 2,
        "value_prop_clarity": 2,
        "has_visual_identity": 0,
        "messaging_consistency": 1,
        "differentiation_known": 1,
    }

    result = run_launchpilot_analysis(example_founder)

    print(json.dumps({
        "algorithm_mode": result["algorithm_output"].get("mode"),
        "ai_mode": result["ai_output"].get("mode"),
        "hf_status": result["hf_status"],
        "report_path": result.get("report_path"),
    }, indent=2))
