const startBtn = document.getElementById("start-btn");
const welcomeScreen = document.getElementById("welcome-screen");
const questionScreen = document.getElementById("question-screen");
const loadingScreen = document.getElementById("loading-screen");
const resultScreen = document.getElementById("result-screen");
const progressFill = document.getElementById("progress-fill");
const questionTitle = document.getElementById("question-title");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");
const resultsContainer = document.getElementById("results");
const stepCounter = document.getElementById("step-counter");

const questions = [
    {
        key: "industry",
        title: "Which market is your startup primarily serving?",
        options: ["B2B SaaS", "Consumer app", "E-commerce", "Education", "Healthcare", "Marketplace"],
    },
    {
        key: "target_audience",
        title: "Who is the first customer segment you want to validate?",
        options: ["Small businesses", "Startups", "Consumers", "Teams", "Developers", "Nonprofits"],
    },
    {
        key: "stage",
        title: "How far along is the product today?",
        options: ["Idea only", "Prototype", "MVP", "Launched"],
    },
    {
        key: "goal",
        title: "What outcome matters most from the next experiment?",
        options: ["Validate demand", "Generate leads", "Prove messaging", "Drive sales", "Build awareness"],
    },
    {
        key: "budget",
        title: "What budget can you spend on the first experiment?",
        options: ["<$100", "$100-$250", "$250-$500", "$500-$1000", ">$1000"],
    },
    {
        key: "max_days",
        title: "How quickly do you need an initial signal?",
        options: ["7 days", "14 days", "30 days", "60 days"],
    },
    {
        key: "team_size",
        title: "How many people can actively execute this test?",
        options: ["1 person", "2 people", "3-4 people", "5+ people"],
    },
    {
        key: "audience_clarity",
        title: "How clear is your target audience right now?",
        options: ["1 - very unclear", "2", "3", "4", "5 - very clear"],
    },
    {
        key: "value_prop_clarity",
        title: "How clear is your value proposition today?",
        options: ["1 - very unclear", "2", "3", "4", "5 - very clear"],
    },
    {
        key: "has_visual_identity",
        title: "Do you already have basic brand assets ready?",
        options: ["No", "Partially", "Yes"],
    },
    {
        key: "messaging_consistency",
        title: "How consistent is your messaging across channels?",
        options: ["1 - inconsistent", "2", "3", "4", "5 - consistent"],
    },
    {
        key: "differentiation_known",
        title: "How well do you understand your differentiation?",
        options: ["1 - not clear", "2", "3", "4", "5 - very clear"],
    },
];

const answers = {};
let currentQuestion = 0;

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function setNextDisabled(disabled) {
    nextBtn.style.opacity = disabled ? "0.5" : "1";
    nextBtn.style.pointerEvents = disabled ? "none" : "auto";
}

function setScreen(screenToShow) {
    [welcomeScreen, questionScreen, loadingScreen, resultScreen].forEach((screen) => {
        screen.style.display = "none";
    });

    screenToShow.style.display = "flex";
}

function mapBudget(value) {
    const budgets = {
        "<$100": 100,
        "$100-$250": 250,
        "$250-$500": 500,
        "$500-$1000": 1000,
        ">$1000": 5000,
    };

    return budgets[value] || 0;
}

function mapTeamSize(value) {
    const teams = {
        "1 person": 1,
        "2 people": 2,
        "3-4 people": 4,
        "5+ people": 5,
    };

    return teams[value] || 1;
}

function mapScaleChoice(value) {
    const cleaned = String(value || "1").split("-")[0].trim();
    return Number.parseInt(cleaned, 10) || 1;
}

function mapBoolean(value) {
    return value === "Yes" || value === "Partially" ? 1 : 0;
}

function mapDays(value) {
    return Number.parseInt(String(value || "14").split(" ")[0], 10) || 14;
}

function buildFounderInputs() {
    return {
        startup_description: `${answers.industry || "Unknown"} startup for ${answers.target_audience || "unknown audience"}`,
        industry: answers.industry || "Unknown",
        target_audience: answers.target_audience || "Unknown",
        goal: (answers.goal || "validation").toLowerCase(),
        budget: mapBudget(answers.budget),
        team_size: mapTeamSize(answers.team_size),
        max_days: mapDays(answers.max_days),
        audience_clarity: mapScaleChoice(answers.audience_clarity),
        value_prop_clarity: mapScaleChoice(answers.value_prop_clarity),
        has_visual_identity: mapBoolean(answers.has_visual_identity),
        messaging_consistency: mapScaleChoice(answers.messaging_consistency),
        differentiation_known: mapScaleChoice(answers.differentiation_known),
    };
}

function renderQuestion() {
    const question = questions[currentQuestion];
    questionTitle.textContent = question.title;
    stepCounter.textContent = `${currentQuestion + 1} / ${questions.length}`;
    optionsContainer.innerHTML = "";
    setNextDisabled(true);

    const percentage = ((currentQuestion + 1) / questions.length) * 100;
    progressFill.style.width = `${percentage}%`;

    question.options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "option";
        button.type = "button";
        button.textContent = option;

        button.addEventListener("click", () => {
            optionsContainer.querySelectorAll(".option").forEach((btn) => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");
            answers[question.key] = option;
            setNextDisabled(false);
        });

        optionsContainer.appendChild(button);
    });
}

function renderResults(analysis) {
    const algorithm = analysis.algorithm_output || {};
    const ai = analysis.ai_output || {};
    const roadmap = analysis.roadmap_report || {};
    const hfStatus = analysis.hf_status || {};
    const recommendedExperiments = algorithm.mode === "marketing_ready"
        ? (algorithm.recommendations || [])
        : (algorithm.marketing_recommendations || []);

    const topExperiments = recommendedExperiments.slice(0, 3).map((item) => {
        const experiment = item.experiment || {};
        const reason = experiment.why_score || experiment.description || "No description available.";

        return `
            <div class="result-card">
                <h3>#${item.rank} ${escapeHtml(experiment.name || "Unknown experiment")}</h3>
                <p><strong>Score:</strong> ${escapeHtml(item.score ?? "n/a")}</p>
                <p>${escapeHtml(reason)}</p>
            </div>
        `;
    }).join("");

    const aiBranding = (ai.top_branding_recommendations || []).map((item) => `
        <li><strong>${escapeHtml(item.name || "Unknown")}</strong> - ${escapeHtml(item.reason || "")}</li>
    `).join("");

    const aiMarketing = (ai.top_marketing_recommendations || []).map((item) => `
        <li><strong>${escapeHtml(item.name || "Unknown")}</strong> - ${escapeHtml(item.reason || "")}</li>
    `).join("");

    const risks = (ai.risks || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const roadmapHtml = (roadmap.roadmap || []).map((phase) => `
        <div class="result-card">
            <h3>${escapeHtml(phase.phase || "Phase")}</h3>
            <p><strong>Timeframe:</strong> ${escapeHtml(phase.timeframe || "n/a")}</p>
            <p><strong>Actions:</strong></p>
            <ul>${(phase.actions || []).map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul>
            <p><strong>Success metrics:</strong></p>
            <ul>${(phase.success_metrics || []).map((metric) => `<li>${escapeHtml(metric)}</li>`).join("")}</ul>
        </div>
    `).join("");

    const confidence = analysis.algorithm_output?.recommendations?.[0]?.score
        ?? analysis.algorithm_output?.marketing_recommendations?.[0]?.score
        ?? analysis.algorithm_output?.branding_recommendations?.[0]?.score
        ?? "n/a";

    const topAction = (roadmap.roadmap || [])[0]?.actions?.[0] || "Review the highest-ranked experiment and prepare the first test assets.";

    resultsContainer.innerHTML = `
        <div class="result-hero">
            <div>
                <div class="eyebrow">Quick read</div>
                <h2>${escapeHtml(analysis.algorithm_output?.mode === "marketing_ready" ? "Marketing-ready" : "Branding-first")}</h2>
                <p>${escapeHtml(ai.summary || "The AI review was generated successfully.")}</p>
            </div>
            <div class="result-metric">
                <span>Top score</span>
                <strong>${escapeHtml(confidence)}</strong>
            </div>
        </div>

        <div class="result-card">
            <h2>Founder Profile</h2>
            <p><strong>Industry:</strong> ${escapeHtml(answers.industry || "n/a")}</p>
            <p><strong>Audience:</strong> ${escapeHtml(answers.target_audience || "n/a")}</p>
            <p><strong>Goal:</strong> ${escapeHtml(answers.goal || "n/a")}</p>
            <p><strong>Budget:</strong> ${escapeHtml(answers.budget || "n/a")}</p>
            <p><strong>Team size:</strong> ${escapeHtml(answers.team_size || "n/a")}</p>
        </div>

        <div class="result-card">
            <h2>Deterministic Ranking</h2>
            <p><strong>Mode:</strong> ${escapeHtml(algorithm.mode || "unknown")}</p>
            <p><strong>Brand score:</strong> ${escapeHtml(algorithm.brand_score ?? "n/a")}</p>
            <div>${topExperiments || "<p>No ranked experiments returned.</p>"}</div>
        </div>

        <div class="result-card">
            <h2>AI Review</h2>
            <p>${escapeHtml(ai.summary || "No AI summary returned.")}</p>
            <p><strong>Risks:</strong></p>
            <ul>${risks || "<li>No risks returned.</li>"}</ul>
            <p><strong>Branding notes:</strong></p>
            <ul>${aiBranding || "<li>No branding recommendations returned.</li>"}</ul>
            <p><strong>Marketing notes:</strong></p>
            <ul>${aiMarketing || "<li>No marketing recommendations returned.</li>"}</ul>
        </div>

        <div class="result-card">
            <h2>Roadmap</h2>
            <p>${escapeHtml(roadmap.founder_report || "No roadmap summary returned.")}</p>
            <div>${roadmapHtml || "<p>No roadmap phases returned.</p>"}</div>
        </div>

        <div class="result-card">
            <h2>Run Status</h2>
            <p><strong>Hugging Face enabled:</strong> ${escapeHtml(hfStatus.enabled ? "Yes" : "No")}</p>
            <p><strong>Fallback used:</strong> ${escapeHtml(hfStatus.used_fallback ? "Yes" : "No")}</p>
            <p><strong>Report path:</strong> ${escapeHtml(analysis.report_path || "Not saved")}</p>
            <p><strong>PDF path:</strong> ${escapeHtml(analysis.pdf_report_path || "Not saved")}</p>
        </div>

        <div class="result-card result-callout">
            <h2>First move</h2>
            <p>${escapeHtml(topAction)}</p>
        </div>

        <button id="restart-btn" class="secondary-btn" type="button">Start over</button>
    `;

    document.getElementById("restart-btn").addEventListener("click", restartFlow);
}

async function runAnalysis() {
    const founderInputs = buildFounderInputs();
    const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            founder_inputs: founderInputs,
            threshold: 60,
            use_hugging_face: true,
            save_report: true,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
}

startBtn.addEventListener("click", () => {
    setScreen(questionScreen);
    renderQuestion();
});

nextBtn.addEventListener("click", async () => {
    currentQuestion += 1;

    if (currentQuestion < questions.length) {
        renderQuestion();
        return;
    }

    setScreen(loadingScreen);

    try {
        const analysis = await runAnalysis();
        setScreen(resultScreen);
        renderResults(analysis);
    } catch (error) {
        setScreen(resultScreen);
        resultsContainer.innerHTML = `
            <div class="result-card">
                <h2>Analysis failed</h2>
                <p>${escapeHtml(error.message || "Unknown error")}</p>
            </div>
        `;
    }
});

function restartFlow() {
    currentQuestion = 0;
    Object.keys(answers).forEach((key) => delete answers[key]);
    resultsContainer.innerHTML = "";
    setScreen(welcomeScreen);
}