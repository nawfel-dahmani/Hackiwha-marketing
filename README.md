# LearnFirst

**Rank marketing experiments first, explain them second, and give founders a reproducible action plan instead of random AI suggestions.**

LearnFirst is a hackathon-ready AI-assisted decision support system for early-stage startups. It ranks marketing validation experiments with a deterministic decision engine, then uses an AI review layer to explain the result, highlight risks, and produce a founder-friendly roadmap.

---

## Features

✨ **Deterministic Ranking** — Same startup profile always produces the same experiment ranking, making decisions reproducible and trustworthy.

🤖 **AI as Reviewer, Not Decider** — The AI explains and enriches the ranking rather than making it, improving credibility with stakeholders.

📊 **Guided Questionnaire** — Collects startup context through a structured flow optimized for clarity and speed.

📈 **Actionable Output** — Generates ranked experiments, risk analysis, founder-friendly roadmap, and immediate next-steps.

🎯 **Demo-Day Ready** — Clean, professional reports in Markdown and PDF formats.

---

## Quick Start

### Prerequisites
- Python 3.11+
- Virtual environment configured (`.venv`)

### Setup & Run

```powershell
# Activate virtual environment
& .\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend\requirements.txt

# Start the Flask server
python backend\app.py
```

Open your browser and navigate to:

```
http://127.0.0.1:5000
```

> ⚠️ **Important:** Access the app through the Flask server. Opening `frontend/index.html` directly from disk will not work — the `/api/analyze` endpoint requires the Flask backend.

---

## Configuration

### Hugging Face (Optional)

The app runs without Hugging Face using a local fallback flow. To enable the AI review layer, set environment variables:

```powershell
$env:HF_TOKEN = "your-hugging-face-token"
$env:HF_MODEL = "meta-llama/Llama-2-7b-chat-hf"  # Optional, uses default if not set
$env:HF_PROVIDER = "huggingface"                   # Optional
```

Then restart the Flask server.

---

## Project Structure

```
├── backend/              # Flask app, decision engine, report generation
│   ├── app.py           # Main Flask application
│   ├── engine.py        # Deterministic ranking engine
│   ├── hf_agents.py     # Hugging Face integration
│   ├── pipeline.py      # Processing pipeline
│   ├── report_generator.py
│   ├── requirements.txt
│   └── reports/         # Generated reports (markdown/PDF)
└── frontend/            # Single-page UI
    ├── index.html       # Main page
    ├── scripts.js       # Client-side logic
    └── style.css        # Styling
```

---

## How It Works

1. **User Input** — Founder answers startup questionnaire in the frontend.
2. **Deterministic Engine** — Backend validates payload and runs weighted decision model.
3. **AI Enhancement** — Optional AI layer summarizes ranking and creates roadmap.
4. **Report Generation** — Results saved as markdown/PDF in `backend/reports/`.
5. **Display Results** — Frontend renders response with ranked experiments and roadmap.

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Returns basic health check |
| `/api/analyze` | POST | Runs full LearnFirst pipeline (takes startup profile payload) |

---

## Tech Stack

- **Backend:** Python 3.11, Flask, NumPy, Hugging Face Inference API, FPDF2
- **Frontend:** HTML, CSS, JavaScript (vanilla)

---

## Notes

- Reports are saved to `backend/reports/` when report saving is enabled.
- The frontend questionnaire fields map directly to backend scoring engine fields.
- The deterministic engine is the source of truth; AI is supplementary only.

---

## Troubleshooting

**Q: Flask server won't start**
- Ensure virtual environment is activated
- Run `pip install -r backend\requirements.txt` to install dependencies
- Check that port 5000 is not already in use

**Q: API requests fail**
- Ensure you're accessing via `http://127.0.0.1:5000`, not opening `index.html` directly
- Check Flask console for error messages

**Q: AI layer not working**
- Verify `HF_TOKEN` is set correctly
- Restart Flask server after setting environment variables
- App will fall back to local-only ranking if token is invalid