# LearnFirst (Hackiwha Marketing Validator)

LearnFirst is an interactive startup validation and marketing strategy recommendation platform. It combines a deterministic scoring algorithm with LLM-enhanced analysis to evaluate a founder's startup profile, recommend targeted branding/marketing experiments, and generate a customized strategic roadmap report (in both Markdown and PDF formats).

---

## Key Features

- **Interactive Wizard Questionnaire**: A step-by-step form for founders covering industry, budget, team size, timeline, and clarity on audience, value proposition, and branding.
- **Deterministic scoring engine**: A mathematical engine (`engine.py`) that evaluates inputs and recommends specific strategies based on hard constraints.
- **AI Second-Opinion Agent**: Integration with DeepSeek and Hugging Face API (`hf_agents.py`) to provide qualitative feedback, risk analysis, and custom roadmaps.
- **Local Fallback Mode**: If API tokens are not available, the backend automatically falls back to local deterministic generation to ensure the application remains functional.
- **Automated Reports**: Generates detailed Markdown and PDF reports summarizing the results, saved locally in `backend/reports/`.
- **Modern UI/UX**: Dark-themed glassmorphism interface featuring dynamic canvas-based digital rain, score gauges, and responsive forms.
- **Containerized Architecture**: Production-ready multi-container setup with Docker Compose.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite 7
- **Styling**: Tailwind CSS, Lucide icons, glassmorphism panel styles
- **Animations**: Canvas-based interactive digital rain background
- **Reverse Proxy**: Nginx (used in production/Docker to serve static assets and proxy `/api/*` requests)

### Backend
- **Framework**: Python 3.11 + Flask
- **Data/Algorithms**: NumPy for scoring computations
- **PDF Generation**: FPDF2
- **AI/LLM**: Hugging Face Inference API (`huggingface_hub`) and DeepSeek API

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (Recommended)
- Alternatively: Python 3.11+ and Node.js 20+ installed locally.

---

### Option 1: Running with Docker (Recommended)

This is the simplest way to run both the frontend and backend with production configuration.

1. **Clone the repository.**
2. **Configure environment variables**:
   Create a `.env` file in the root folder with:
   ```env
   DEEPSEEK_API_KEY=your_deepseek_api_key_here

   ```
3. **Build and start the containers**:
   ```bash
   docker compose up --build -d
   ```
4. **Access the application**:
   Open **`http://localhost`** in your browser. Nginx will serve the React frontend and automatically route API requests to the Flask backend.

---

### Option 2: Running Locally (Development Mode)

If you are developing locally and want live hot-reloading:

#### Step A: Run the Backend
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file in the root of the workspace.
5. Run the Flask server:
   ```bash
   python app.py
   ```
   *(The server will run on `http://127.0.0.1:5000`)*

#### Step B: Run the Frontend
1. Navigate to the root directory (where `package.json` is located).
2. Install the node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open the browser to **`http://localhost:5173`**. Vite will proxy `/api` calls to the local Flask backend.

---

## Backend CLI Test Scripts

You can test the backend python functionality directly from your terminal:

- **Verify Hugging Face API key/token authentication**:
  ```bash
  python backend/check_hf_token.py
  ```
- **Run the full analysis pipeline using mock data**:
  ```bash
  python backend/pipeline.py
  ```

---

## Directory Structure

```
.
├── backend/
│   ├── app.py             # Flask Web Server & endpoint handlers
│   ├── engine.py          # Deterministic decision/scoring logic
│   ├── hf_agents.py       # LLM integrations (DeepSeek / HuggingFace)
│   ├── pipeline.py        # Connects engine, AI agents, and report generator
│   ├── report_generator.py# Exports analysis to Markdown and PDF format
│   ├── requirements.txt   # Python dependency declarations
│   └── reports/           # Generated PDF and Markdown reports (Git-ignored)
├── public/                # Static public assets
├── src/                   # React frontend application source
│   ├── components/        # Reusable UI components (Accordions, ScoreGauge, etc.)
│   ├── data/              # Types, questions, and mapper configurations
│   ├── screens/           # Core layout screens (Wizard form, Results page)
│   ├── App.tsx            # Main router and App structure
│   └── index.css          # Design system styles and custom Tailwind additions
├── Dockerfile             # Multi-stage production build configuration for frontend
├── docker-compose.yml     # Multi-container orchestration config
├── nginx.conf             # Nginx reverse proxy configuration
└── package.json           # Node package configuration
```
