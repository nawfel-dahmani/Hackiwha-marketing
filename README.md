# LearnFirst

LearnFirst is an AI-assisted decision support system for early-stage startups. It ranks marketing validation experiments with a deterministic decision engine, then uses an AI review layer to explain the result, highlight risks, and produce a founder-friendly roadmap.

## What It Does

- Collects a startup profile from a short guided questionnaire.
- Runs a deterministic ranking engine first, using a weighted decision model.
- Uses an AI second-opinion layer to explain the ranking and enrich the report.
- Generates a roadmap and saves markdown/PDF reports from the backend.

## Project Structure

- `backend/` contains the Flask app, decision engine, report generation, and Hugging Face agent wrappers.
- `frontend/` contains the single-page UI, styling, and browser logic.

## Tech Stack

- Python 3.11
- Flask
- NumPy
- Hugging Face Inference API
- FPDF2
- Vanilla HTML, CSS, and JavaScript

## Run Locally

From the project root:

```powershell
& .\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python backend\app.py
```

Then open:

```text
http://127.0.0.1:5000
```

Important: open the app through the Flask server. If you open `frontend/index.html` directly from disk, the `/api/analyze` request will not work.

## Optional Hugging Face Setup

The app can run without Hugging Face by using the local fallback flow. To enable the AI review layer, set:

- `HF_TOKEN`
- optionally `HF_MODEL`
- optionally `HF_PROVIDER`

## API Endpoints

- `GET /api/health` returns a basic health check.
- `POST /api/analyze` runs the full LearnFirst pipeline.

## How the Flow Works

1. The founder answers the startup questionnaire in the frontend.
2. The Flask backend validates the payload and runs the deterministic engine.
3. The AI review layer summarizes the ranking and creates the roadmap.
4. The frontend renders the results directly from the API response.

## Notes

- The backend writes reports into `backend/reports/` when report saving is enabled.
- The current frontend question set is mapped to the backend fields used by the scoring engine.