import os


def render_markdown_report(analysis):
    """Convert a LaunchPilot analysis response into an uploadable Markdown report."""
    algorithm_output = analysis.get("algorithm_output", {})
    ai_output = analysis.get("ai_output", {})
    roadmap_report = analysis.get("roadmap_report", {})

    lines = [
        "# LaunchPilot Recommendation Report",
        "",
        "## Decision Summary",
        "",
        f"- Algorithm mode: {algorithm_output.get('mode', 'unknown')}",
        f"- AI mode: {ai_output.get('mode', 'unknown')}",
        f"- Brand score: {algorithm_output.get('brand_score', 'unknown')}",
        f"- Threshold: {algorithm_output.get('threshold', 'unknown')}",
        "",
        "## Agreement",
        "",
    ]

    agreement = roadmap_report.get("agreement", [])
    lines.extend([f"- {item}" for item in agreement] or ["- No agreement points provided."])

    lines.extend(["", "## Differences", ""])
    differences = roadmap_report.get("differences", [])
    if differences:
        for item in differences:
            lines.extend([
                f"### {item.get('topic', 'Difference')}",
                "",
                f"- Algorithm: {item.get('algorithm_view', '')}",
                f"- AI: {item.get('ai_view', '')}",
                f"- Recommended decision: {item.get('recommended_decision', '')}",
                "",
            ])
    else:
        lines.append("- No major differences detected.")

    lines.extend(["", "## Roadmap", ""])
    for phase in roadmap_report.get("roadmap", []):
        lines.extend([
            f"### {phase.get('phase', 'Phase')}",
            "",
            f"Timeframe: {phase.get('timeframe', 'Not specified')}",
            "",
            "Actions:",
        ])
        lines.extend([f"- {action}" for action in phase.get("actions", [])])
        lines.extend(["", "Success metrics:"])
        lines.extend([f"- {metric}" for metric in phase.get("success_metrics", [])])
        lines.append("")

    lines.extend([
        "## Founder Report",
        "",
        roadmap_report.get("founder_report", ""),
        "",
    ])

    return "\n".join(lines)


def save_markdown_report(analysis, output_path):
    """Save the report and return the absolute path for API responses or uploads."""
    absolute_path = os.path.abspath(output_path)
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)

    with open(absolute_path, "w", encoding="utf-8") as file:
        file.write(render_markdown_report(analysis))

    return absolute_path
