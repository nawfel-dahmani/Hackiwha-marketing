from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

from pipeline import run_launchpilot_analysis


BACKEND_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BACKEND_DIR.parent / "frontend"

app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")


@app.get("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


def _normalize_founder_inputs(payload):
    founder_inputs = payload.get("founder_inputs") or payload

    if not isinstance(founder_inputs, dict):
        raise ValueError("founder_inputs must be an object")

    required_fields = [
        "industry",
        "target_audience",
        "goal",
        "budget",
        "team_size",
        "max_days",
        "audience_clarity",
        "value_prop_clarity",
        "has_visual_identity",
        "messaging_consistency",
        "differentiation_known",
    ]

    missing_fields = [field for field in required_fields if field not in founder_inputs]
    if missing_fields:
        raise ValueError(f"missing required fields: {', '.join(missing_fields)}")

    return founder_inputs


@app.post("/api/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}

    try:
        founder_inputs = _normalize_founder_inputs(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    try:
        threshold = int(payload.get("threshold", 60))
    except (TypeError, ValueError):
        threshold = 60

    use_hugging_face = bool(payload.get("use_hugging_face", True))
    save_report = bool(payload.get("save_report", True))

    try:
        analysis = run_launchpilot_analysis(
            founder_inputs,
            threshold=threshold,
            use_hugging_face=use_hugging_face,
            save_report=save_report,
        )
        return jsonify(analysis)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    from os import getenv

    app.run(host="127.0.0.1", port=int(getenv("PORT", "5000")), debug=True)