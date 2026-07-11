import os
from datetime import datetime


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


# ============================================================
# PDF REPORT GENERATION
# ============================================================

# Brand colors
_PRIMARY = (30, 58, 138)       # Deep blue
_ACCENT = (99, 102, 241)       # Indigo
_SUCCESS = (16, 185, 129)      # Green
_WARNING = (245, 158, 11)      # Amber
_DANGER = (239, 68, 68)        # Red
_TEXT_DARK = (30, 41, 59)      # Slate-800
_TEXT_LIGHT = (100, 116, 139)  # Slate-500
_BG_LIGHT = (248, 250, 252)   # Slate-50
_WHITE = (255, 255, 255)


def _sanitize(text):
    """Replace Unicode characters that Helvetica/latin-1 cannot encode."""
    replacements = {
        "\u2014": "-",   # em-dash
        "\u2013": "-",   # en-dash
        "\u2018": "'",   # left single quote
        "\u2019": "'",   # right single quote
        "\u201c": '"',   # left double quote
        "\u201d": '"',   # right double quote
        "\u2022": "-",   # bullet
        "\u2026": "...", # ellipsis
    }
    for char, repl in replacements.items():
        text = text.replace(char, repl)
    # Drop any remaining non-latin-1 characters
    return text.encode("latin-1", errors="replace").decode("latin-1")


def _score_color(score, threshold):
    """Return a color tuple based on how the score compares to the threshold."""
    if score >= threshold:
        return _SUCCESS
    if score >= threshold * 0.7:
        return _WARNING
    return _DANGER


def _add_colored_tag(pdf, text, color, x=None, y=None):
    """Draw a small rounded colored tag with white text."""
    if x is not None:
        pdf.set_x(x)
    tag_w = pdf.get_string_width(text) + 8
    tag_h = 7
    rx = pdf.get_x()
    ry = pdf.get_y()
    if y is not None:
        ry = y
    pdf.set_fill_color(*color)
    pdf.rect(rx, ry, tag_w, tag_h, style="F")
    pdf.set_text_color(*_WHITE)
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_xy(rx + 4, ry + 1)
    pdf.cell(tag_w - 8, 5, text, new_x="RIGHT", new_y="TOP")
    pdf.set_text_color(*_TEXT_DARK)
    return tag_w


def render_pdf_report(analysis):
    """Build a professionally styled PDF from a LaunchPilot analysis dict."""
    from fpdf import FPDF

    algorithm_output = analysis.get("algorithm_output", {})
    ai_output = analysis.get("ai_output", {})
    roadmap_report = analysis.get("roadmap_report", {})
    founder_inputs = analysis.get("founder_inputs", {})
    hf_status = analysis.get("hf_status", {})

    brand_score = algorithm_output.get("brand_score", 0)
    threshold = algorithm_output.get("threshold", 60)
    algo_mode = algorithm_output.get("mode", "unknown")
    ai_mode = ai_output.get("mode", "unknown")

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # --- HEADER BANNER ---
    pdf.set_fill_color(*_PRIMARY)
    pdf.rect(0, 0, 210, 42, style="F")
    pdf.set_text_color(*_WHITE)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_xy(15, 10)
    pdf.cell(0, 10, "LaunchPilot", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.set_x(15)
    pdf.cell(0, 7, "AI-Powered Startup Launch Advisor  |  Recommendation Report", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(*_TEXT_DARK)
    pdf.ln(12)

    # --- GENERATED DATE ---
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(*_TEXT_LIGHT)
    pdf.cell(0, 5, f"Generated {datetime.now().strftime('%B %d, %Y at %H:%M')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    # --- SCORE CARD ROW ---
    card_y = pdf.get_y()
    card_h = 32

    # Brand Score card
    pdf.set_fill_color(*_BG_LIGHT)
    pdf.rect(15, card_y, 55, card_h, style="F")
    color = _score_color(brand_score, threshold)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(*color)
    pdf.set_xy(15, card_y + 4)
    pdf.cell(55, 12, f"{brand_score}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(*_TEXT_LIGHT)
    pdf.set_x(15)
    pdf.cell(55, 5, f"Brand Score (threshold: {threshold})", align="C", new_x="LMARGIN", new_y="NEXT")

    # Algorithm Mode card
    pdf.set_fill_color(*_BG_LIGHT)
    pdf.rect(77, card_y, 55, card_h, style="F")
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(*_PRIMARY)
    pdf.set_xy(77, card_y + 4)
    label = algo_mode.replace("_", " ").title()
    pdf.cell(55, 12, label, align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(*_TEXT_LIGHT)
    pdf.set_xy(77, card_y + 18)
    pdf.cell(55, 5, "Algorithm Mode", align="C", new_x="LMARGIN", new_y="NEXT")

    # AI Mode card
    pdf.set_fill_color(*_BG_LIGHT)
    pdf.rect(139, card_y, 55, card_h, style="F")
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(*_ACCENT)
    pdf.set_xy(139, card_y + 4)
    label = ai_mode.replace("_", " ").title()
    pdf.cell(55, 12, label, align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(*_TEXT_LIGHT)
    pdf.set_xy(139, card_y + 18)
    pdf.cell(55, 5, "AI Mode", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(card_y + card_h + 8)

    # --- HF STATUS TAG ---
    if hf_status.get("used_fallback"):
        _add_colored_tag(pdf, "LOCAL FALLBACK", _WARNING, x=15)
    else:
        _add_colored_tag(pdf, "HUGGING FACE ENABLED", _SUCCESS, x=15)
    pdf.ln(10)

    # --- SECTION HELPER ---
    def section_heading(title):
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(*_PRIMARY)
        pdf.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        # Draw accent underline
        pdf.set_draw_color(*_ACCENT)
        pdf.set_line_width(0.6)
        pdf.line(15, pdf.get_y(), 75, pdf.get_y())
        pdf.set_line_width(0.2)
        pdf.ln(4)

    def body_text(text, bold=False):
        style = "B" if bold else ""
        pdf.set_font("Helvetica", style, 10)
        pdf.set_text_color(*_TEXT_DARK)
        pdf.multi_cell(0, 5.5, _sanitize(text), new_x="LMARGIN", new_y="NEXT")

    def bullet(text):
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*_TEXT_DARK)
        pdf.set_x(20)
        pdf.multi_cell(0, 5.5, f"-  {_sanitize(text)}", new_x="LMARGIN", new_y="NEXT")

    def sub_heading(text):
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(*_ACCENT)
        pdf.cell(0, 7, _sanitize(text), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(1)

    # --- FOUNDER INPUTS ---
    section_heading("Founder Inputs")
    input_keys = [
        ("industry", "Industry"),
        ("target_audience", "Target Audience"),
        ("goal", "Goal"),
        ("budget", "Budget ($)"),
        ("team_size", "Team Size"),
        ("max_days", "Max Days"),
    ]
    for key, label in input_keys:
        val = founder_inputs.get(key, "N/A")
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(*_TEXT_LIGHT)
        pdf.set_x(20)
        pdf.cell(35, 5.5, f"{label}:", new_x="RIGHT", new_y="TOP")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*_TEXT_DARK)
        pdf.cell(0, 5.5, f"  {val}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    # --- AGREEMENT ---
    section_heading("Agreement")
    agreement = roadmap_report.get("agreement", [])
    if agreement:
        for item in agreement:
            bullet(item)
    else:
        body_text("No agreement points provided.")
    pdf.ln(3)

    # --- DIFFERENCES ---
    section_heading("Differences")
    differences = roadmap_report.get("differences", [])
    if differences:
        for item in differences:
            sub_heading(item.get("topic", "Difference"))
            pdf.set_x(20)
            body_text(f"Algorithm view:  {item.get('algorithm_view', '')}")
            pdf.set_x(20)
            body_text(f"AI view:  {item.get('ai_view', '')}")
            pdf.set_x(20)
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*_SUCCESS)
            pdf.multi_cell(0, 5.5, f"Recommended:  {_sanitize(item.get('recommended_decision', ''))}", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
    else:
        body_text("No major differences detected.")
    pdf.ln(3)

    # --- ROADMAP ---
    section_heading("Roadmap")
    for phase in roadmap_report.get("roadmap", []):
        phase_name = phase.get("phase", "Phase")
        timeframe = phase.get("timeframe", "Not specified")

        sub_heading(f"{phase_name}  -  {timeframe}")

        body_text("Actions:", bold=True)
        for action in phase.get("actions", []):
            bullet(action)

        body_text("Success Metrics:", bold=True)
        for metric in phase.get("success_metrics", []):
            bullet(metric)
        pdf.ln(3)

    # --- AI RECOMMENDATIONS ---
    section_heading("AI Recommendations")

    branding_recs = ai_output.get("top_branding_recommendations", [])
    marketing_recs = ai_output.get("top_marketing_recommendations", [])

    if branding_recs:
        sub_heading("Branding")
        for rec in branding_recs:
            name = rec.get("name", "")
            score = rec.get("score", 0)
            reason = rec.get("reason", "")
            body_text(f"{name}  (score: {score})", bold=True)
            pdf.set_x(20)
            body_text(reason)
            pdf.ln(1)

    if marketing_recs:
        sub_heading("Marketing")
        for rec in marketing_recs:
            name = rec.get("name", "")
            score = rec.get("score", 0)
            reason = rec.get("reason", "")
            body_text(f"{name}  (score: {score})", bold=True)
            pdf.set_x(20)
            body_text(reason)
            pdf.ln(1)
    pdf.ln(3)

    # --- RISKS ---
    risks = ai_output.get("risks", [])
    if risks:
        section_heading("Risks")
        for risk in risks:
            bullet(risk)
        pdf.ln(3)

    # --- FOUNDER REPORT ---
    section_heading("Founder Report")
    founder_report_text = roadmap_report.get("founder_report", "")
    if founder_report_text:
        body_text(founder_report_text)
    pdf.ln(5)

    # --- FOOTER ---
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(*_TEXT_LIGHT)
    pdf.cell(0, 5, "LaunchPilot - Built for Hackiwha", align="C", new_x="LMARGIN", new_y="NEXT")

    return pdf


def save_pdf_report(analysis, output_path):
    """Generate a styled PDF report and save it to disk."""
    absolute_path = os.path.abspath(output_path)
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)

    pdf = render_pdf_report(analysis)
    pdf.output(absolute_path)

    return absolute_path
