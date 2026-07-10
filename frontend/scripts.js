/* ============================================================
   LEARNFIRST — SCRIPTS
   ============================================================ */

// ---- DOM refs ----
const startBtn        = document.getElementById("start-btn");
const welcomeScreen   = document.getElementById("welcome-screen");
const questionScreen  = document.getElementById("question-screen");
const loadingScreen   = document.getElementById("loading-screen");
const resultScreen    = document.getElementById("result-screen");
const progressFill    = document.getElementById("progress-fill");
const questionTitle   = document.getElementById("question-title");
const questionSub     = document.getElementById("question-subtitle");
const optionsContainer = document.getElementById("options-container");
const textInputWrap   = document.getElementById("text-input-container");
const textInput       = document.getElementById("text-input");
const textInputHint   = document.getElementById("text-input-hint");
const nextBtn         = document.getElementById("next-btn");
const backBtn         = document.getElementById("back-btn");
const resultsContainer = document.getElementById("results");
const stepCounter     = document.getElementById("step-counter");
const loadingStage    = document.getElementById("loading-stage");

// ---- Questions ----
const questions = [
    {
        key: "startup_name",
        title: "What's your startup called?",
        subtitle: "Give us a name and a short description so the report feels personal.",
        type: "text",
        placeholder: "e.g. LearnFirst — a marketing experiment ranker",
        hint: "Optional: add a dash and a one-liner about what you do.",
    },
    {
        key: "industry",
        title: "What market are you building for?",
        subtitle: "This determines which experiments are most relevant to your space.",
        options: ["B2B SaaS", "Consumer App", "Marketplace", "Education", "Healthcare", "E-commerce", "Fintech", "AI / ML", "Food & Beverage", "Media & Entertainment"],
    },
    {
        key: "target_audience",
        title: "Who is the first audience you want to validate?",
        subtitle: "Pick the group you'd test with this week — not your total addressable market.",
        options: ["Small Businesses", "Startups", "Consumers", "Enterprise Teams", "Developers", "Students", "Nonprofits", "Creators"],
    },
    {
        key: "stage",
        title: "How far along is the product right now?",
        subtitle: "This affects which experiments make sense given your current maturity.",
        options: ["Idea only", "Prototype", "MVP", "Launched"],
    },
    {
        key: "goal",
        title: "What's the one thing you need this experiment to prove?",
        subtitle: "Focus on the single biggest unknown — what would change your next decision?",
        options: ["Validate demand", "Prove messaging", "Confirm audience", "Generate leads", "Drive sales", "Build awareness"],
    },
    {
        key: "budget",
        title: "How much can you spend on the first test?",
        subtitle: "Be realistic — the engine filters out experiments you can't afford.",
        options: ["<$100", "$100–$250", "$250–$500", "$500–$1000", ">$1000"],
    },
    {
        key: "max_days",
        title: "How quickly do you need a signal?",
        subtitle: "Faster timelines mean fewer experiment options, but sharper focus.",
        options: ["7 days", "14 days", "30 days", "60 days"],
    },
    {
        key: "team_size",
        title: "How many people can actively execute this test?",
        subtitle: "Count only people who can dedicate real hours this week.",
        options: ["1 person", "2 people", "3–4 people", "5+ people"],
    },
    {
        key: "audience_clarity",
        title: "How clear is your target audience today?",
        subtitle: "Do you know exactly who you're building for, or is it still fuzzy?",
        type: "scale",
        scaleLabels: ["Undefined", "Vague", "Partial", "Mostly clear", "Crystal clear"],
        scaleEmojis: ["😶", "🤔", "🙂", "😊", "🎯"],
    },
    {
        key: "value_prop_clarity",
        title: "How clear is your value proposition?",
        subtitle: "Can you explain what you do and why it matters in one sentence?",
        type: "scale",
        scaleLabels: ["Unclear", "Rough idea", "Getting there", "Clear", "Razor sharp"],
        scaleEmojis: ["😶", "🤔", "🙂", "😊", "💎"],
    },
    {
        key: "has_visual_identity",
        title: "Do you already have brand assets ready to use?",
        subtitle: "Logo, color palette, basic visual style — anything beyond a plain doc.",
        options: ["No, nothing yet", "Some basics", "Yes, solid kit"],
    },
    {
        key: "messaging_consistency",
        title: "How consistent is your messaging across channels?",
        subtitle: "Does your landing page, social bio, and pitch deck tell the same story?",
        type: "scale",
        scaleLabels: ["Inconsistent", "Mixed", "Okay", "Aligned", "Unified"],
        scaleEmojis: ["🔀", "😐", "🙂", "✅", "🔗"],
    },
    {
        key: "differentiation_known",
        title: "How clearly can you explain what makes you different?",
        subtitle: "If a customer asked 'why not the competitor?', would you have a sharp answer?",
        type: "scale",
        scaleLabels: ["No clue", "Some idea", "Decent", "Strong", "Obvious"],
        scaleEmojis: ["❓", "🤔", "🙂", "💪", "⭐"],
    },
];

const answers = {};
let currentQuestion = 0;

// ---- Utilities ----
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function setNextDisabled(disabled) {
    nextBtn.style.opacity = disabled ? "0.4" : "1";
    nextBtn.style.pointerEvents = disabled ? "none" : "auto";
}

// ---- Screen Transitions ----
function setScreen(target) {
    const screens = [welcomeScreen, questionScreen, loadingScreen, resultScreen];
    const current = screens.find(s => s.style.display === "flex");

    if (current && current !== target) {
        current.classList.add("screen-exit");
        setTimeout(() => {
            current.style.display = "none";
            current.classList.remove("screen-exit");
            target.style.display = "flex";
            target.classList.add("screen-enter");
            setTimeout(() => target.classList.remove("screen-enter"), 500);
        }, 280);
    } else {
        screens.forEach(s => s.style.display = "none");
        target.style.display = "flex";
        target.classList.add("screen-enter");
        setTimeout(() => target.classList.remove("screen-enter"), 500);
    }
}

// ---- Data Mappers ----
function mapBudget(value) {
    const budgets = { "<$100": 100, "$100–$250": 250, "$250–$500": 500, "$500–$1000": 1000, ">$1000": 5000 };
    return budgets[value] || 0;
}

function mapTeamSize(value) {
    const teams = { "1 person": 1, "2 people": 2, "3–4 people": 4, "5+ people": 5 };
    return teams[value] || 1;
}

function mapScaleChoice(value) {
    const cleaned = String(value || "1").split(" ")[0].trim();
    return Number.parseInt(cleaned, 10) || 1;
}

function mapBoolean(value) {
    return value === "Yes, solid kit" || value === "Some basics" ? 1 : 0;
}

function mapDays(value) {
    return Number.parseInt(String(value || "14").split(" ")[0], 10) || 14;
}

function buildFounderInputs() {
    return {
        startup_description: answers.startup_name
            ? `${answers.startup_name} — ${answers.industry || "Unknown"} startup for ${answers.target_audience || "unknown audience"}`
            : `${answers.industry || "Unknown"} startup for ${answers.target_audience || "unknown audience"}`,
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

// ---- Question Rendering ----
function renderQuestion() {
    const q = questions[currentQuestion];
    const isText = q.type === "text";
    const isScale = q.type === "scale";

    questionTitle.textContent = q.title;
    questionSub.textContent = q.subtitle || "";
    questionSub.style.display = q.subtitle ? "block" : "none";
    stepCounter.textContent = `${currentQuestion + 1} / ${questions.length}`;

    const pct = ((currentQuestion + 1) / questions.length) * 100;
    progressFill.style.width = `${pct}%`;

    // Back button visibility
    backBtn.style.display = currentQuestion > 0 ? "inline-flex" : "none";

    // Toggle text vs options
    if (isText) {
        optionsContainer.style.display = "none";
        textInputWrap.style.display = "block";
        textInput.placeholder = q.placeholder || "";
        textInputHint.textContent = q.hint || "";
        textInput.value = answers[q.key] || "";
        textInput.focus();
        // Text fields are always valid (optional)
        setNextDisabled(false);
    } else {
        optionsContainer.style.display = "grid";
        textInputWrap.style.display = "none";
        optionsContainer.innerHTML = "";

        // Layout class
        optionsContainer.className = "";
        if (isScale) {
            optionsContainer.classList.add("scale-layout");
        } else if (q.options && q.options.length <= 4) {
            // Keep 2-col for 4 or fewer
        }

        const opts = isScale
            ? q.scaleLabels.map((label, i) => ({ value: `${i + 1}`, emoji: q.scaleEmojis[i], label }))
            : q.options.map(opt => ({ value: opt }));

        opts.forEach((opt, i) => {
            const btn = document.createElement("button");
            btn.className = "option";
            btn.type = "button";

            if (isScale) {
                btn.innerHTML = `<span class="scale-emoji">${opt.emoji}</span><span class="scale-label">${escapeHtml(opt.label)}</span>`;
            } else {
                btn.textContent = opt.value;
            }

            if (answers[q.key] === opt.value) {
                btn.classList.add("selected");
            }

            btn.addEventListener("click", () => {
                optionsContainer.querySelectorAll(".option").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                answers[q.key] = opt.value;
                setNextDisabled(false);
            });

            // Animate in
            btn.style.opacity = "0";
            btn.style.transform = "translateY(8px)";
            setTimeout(() => {
                btn.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                btn.style.opacity = "1";
                btn.style.transform = "translateY(0)";
            }, 40 + i * 35);

            optionsContainer.appendChild(btn);
        });

        // Disable next if no selection yet
        setNextDisabled(!answers[q.key]);
    }
}

// ---- Result Rendering ----
function renderResults(analysis) {
    const algorithm = analysis.algorithm_output || {};
    const ai = analysis.ai_output || {};
    const roadmap = analysis.roadmap_report || {};
    const hfStatus = analysis.hf_status || {};
    const mode = algorithm.mode || "branding_first";

    const recommendedExperiments = mode === "marketing_ready"
        ? (algorithm.recommendations || [])
        : (algorithm.marketing_recommendations || []);

    const brandingExperiments = algorithm.branding_recommendations || [];

    const brandScore = algorithm.brand_score ?? 0;
    const threshold = algorithm.threshold ?? 60;
    const topScore = recommendedExperiments[0]?.score ?? brandingExperiments[0]?.score ?? "—";

    const startupName = answers.startup_name || "Your Startup";
    const isMarketingReady = mode === "marketing_ready";

    // Score ring offset (251 = circumference, 0 = full)
    const ringOffset = 251 - (251 * Math.min(brandScore, 100) / 100);

    // Build top experiments HTML
    const experimentsHtml = (isMarketingReady ? recommendedExperiments : [...brandingExperiments.slice(0, 2), ...recommendedExperiments])
        .slice(0, 5)
        .map((item, i) => {
            const exp = item.experiment || {};
            const score = item.score ?? 0;
            const maxScore = recommendedExperiments[0]?.score || brandingExperiments[0]?.score || 1;
            const barWidth = Math.round((score / maxScore) * 100);

            return `
                <div class="experiment-card card-reveal">
                    <div class="experiment-rank ${i === 0 ? 'rank-1' : ''}">${item.rank || i + 1}</div>
                    <div class="experiment-body">
                        <h3>${escapeHtml(exp.name || "Unknown experiment")}</h3>
                        <p>${escapeHtml(exp.why_score || exp.description || "No description available.")}</p>
                        <div class="experiment-badges">
                            ${exp.cost !== undefined ? `<span class="badge">💰 $${escapeHtml(exp.cost)}</span>` : ''}
                            ${exp.time_days !== undefined ? `<span class="badge">⏱ ${escapeHtml(exp.time_days)}d</span>` : ''}
                            ${exp.team_size !== undefined ? `<span class="badge">👤 ${escapeHtml(exp.team_size)}</span>` : ''}
                            <span class="badge badge-accent">${escapeHtml(exp.type || "experiment")}</span>
                        </div>
                        <div class="score-bar-container">
                            <div class="score-bar-fill" style="width:0%" data-width="${barWidth}%"></div>
                        </div>
                    </div>
                    <div class="experiment-score">
                        <strong>${escapeHtml(score)}</strong>
                        <span>score</span>
                    </div>
                </div>
            `;
        }).join("") || '<p style="color:var(--muted-strong)">No ranked experiments returned.</p>';

    // AI review
    const aiSummary = ai.summary || "No AI summary returned.";
    const risksHtml = (ai.risks || []).map(r => `
        <div class="risk-item">
            <div class="risk-icon">!</div>
            <span>${escapeHtml(r)}</span>
        </div>
    `).join("") || '<p style="color:var(--muted-strong)">No risks identified.</p>';

    const aiBrandingHtml = (ai.top_branding_recommendations || []).map(item => `
        <li><strong>${escapeHtml(item.name || "")}</strong> — ${escapeHtml(item.reason || "")}</li>
    `).join("") || '<li style="color:var(--muted-strong)">No branding recommendations.</li>';

    const aiMarketingHtml = (ai.top_marketing_recommendations || []).map(item => `
        <li><strong>${escapeHtml(item.name || "")}</strong> — ${escapeHtml(item.reason || "")}</li>
    `).join("") || '<li style="color:var(--muted-strong)">No marketing recommendations.</li>';

    // Roadmap timeline
    const roadmapHtml = (roadmap.roadmap || []).map(phase => `
        <div class="timeline-item card-reveal">
            <div class="timeline-phase">
                <h3>${escapeHtml(phase.phase || "Phase")}</h3>
                <span class="timeline-timeframe">${escapeHtml(phase.timeframe || "TBD")}</span>
            </div>
            <div class="timeline-actions">
                <strong>Actions</strong>
                <ul>${(phase.actions || []).map(a => `<li>${escapeHtml(a)}</li>`).join("")}</ul>
            </div>
            <div class="timeline-metrics">
                <strong>Success Metrics</strong>
                <ul>${(phase.success_metrics || []).map(m => `<li>${escapeHtml(m)}</li>`).join("")}</ul>
            </div>
        </div>
    `).join("") || '<p style="color:var(--muted-strong)">No roadmap phases returned.</p>';

    // First move
    const topAction = (roadmap.roadmap || [])[0]?.actions?.[0] || "Review the highest-ranked experiment and prepare the first test assets.";
    const pitchLine = isMarketingReady
        ? "You're ready to run marketing experiments, with AI acting as a strategic reviewer."
        : "Start with branding clarity, then move into marketing experiments once the foundation is stronger.";

    // Founder profile
    const profileItems = [
        { label: "Startup", value: startupName },
        { label: "Industry", value: answers.industry || "—" },
        { label: "Audience", value: answers.target_audience || "—" },
        { label: "Stage", value: answers.stage || "—" },
        { label: "Goal", value: answers.goal || "—" },
        { label: "Budget", value: answers.budget || "—" },
        { label: "Timeline", value: answers.max_days || "—" },
        { label: "Team", value: answers.team_size || "—" },
    ];

    const profileHtml = profileItems.map(p => `
        <div class="profile-item">
            <div class="profile-item-label">${escapeHtml(p.label)}</div>
            <div class="profile-item-value">${escapeHtml(p.value)}</div>
        </div>
    `).join("");

    // ---- Assemble ----
    resultsContainer.innerHTML = `
        <!-- Executive Summary -->
        <div class="result-hero card-reveal">
            <div>
                <div class="eyebrow">Quick read</div>
                <h2 style="margin-top:10px;">${escapeHtml(startupName)}</h2>
                <div style="margin:8px 0 10px;">
                    <span class="mode-badge ${isMarketingReady ? 'marketing-ready' : 'branding-first'}">
                        ${isMarketingReady ? '🚀 Marketing-Ready' : '🎨 Branding-First'}
                    </span>
                </div>
                <p>${escapeHtml(aiSummary)}</p>
                <p class="result-highlight">${escapeHtml(pitchLine)}</p>
            </div>
            <div class="score-gauge">
                <div class="score-ring">
                    <svg viewBox="0 0 100 100">
                        <circle class="score-ring-bg" cx="50" cy="50" r="40"/>
                        <circle class="score-ring-fill" cx="50" cy="50" r="40" style="stroke-dashoffset:${ringOffset}"/>
                    </svg>
                    <div class="score-value" id="score-counter">0</div>
                </div>
                <span class="score-label">Brand Score</span>
            </div>
        </div>

        <!-- Tab Navigation -->
        <nav class="tab-nav card-reveal">
            <button class="tab-btn active" data-tab="tab-rankings">📊 Rankings</button>
            <button class="tab-btn" data-tab="tab-ai">🤖 AI Review</button>
            <button class="tab-btn" data-tab="tab-roadmap">🗺️ Roadmap</button>
            <button class="tab-btn" data-tab="tab-profile">👤 Profile</button>
        </nav>

        <!-- Tab: Rankings -->
        <div class="tab-panel active" id="tab-rankings">
            ${experimentsHtml}
        </div>

        <!-- Tab: AI Review -->
        <div class="tab-panel" id="tab-ai">
            <div class="result-card card-reveal">
                <h2>AI Summary</h2>
                <p>${escapeHtml(aiSummary)}</p>
            </div>

            <div class="result-card card-reveal">
                <h2>Risks</h2>
                <div class="risk-list">${risksHtml}</div>
            </div>

            <div class="result-card card-reveal">
                <h2>Branding Recommendations</h2>
                <ul>${aiBrandingHtml}</ul>
            </div>

            <div class="result-card card-reveal">
                <h2>Marketing Recommendations</h2>
                <ul>${aiMarketingHtml}</ul>
            </div>
        </div>

        <!-- Tab: Roadmap -->
        <div class="tab-panel" id="tab-roadmap">
            <div class="result-card card-reveal" style="margin-bottom:20px;">
                <h2>Founder Report</h2>
                <p>${escapeHtml(roadmap.founder_report || "No roadmap summary returned.")}</p>
            </div>
            <div class="timeline">
                ${roadmapHtml}
            </div>
        </div>

        <!-- Tab: Profile -->
        <div class="tab-panel" id="tab-profile">
            <div class="result-card card-reveal">
                <h2>Your Startup Profile</h2>
                <div class="profile-grid" style="margin-top:16px;">
                    ${profileHtml}
                </div>
            </div>

            <div class="result-card card-reveal">
                <h2>Run Status</h2>
                <p><strong>Hugging Face:</strong> ${hfStatus.enabled ? "Enabled ✓" : "Disabled"}</p>
                <p><strong>Fallback used:</strong> ${hfStatus.used_fallback ? "Yes" : "No"}</p>
                ${analysis.report_path ? `<p><strong>Report:</strong> ${escapeHtml(analysis.report_path)}</p>` : ''}
            </div>
        </div>

        <!-- First Move Callout -->
        <div class="result-card result-callout card-reveal" style="margin-top:8px;">
            <h2>🎯 First Move</h2>
            <p style="font-size:1.05rem; color:var(--text);">${escapeHtml(topAction)}</p>
        </div>

        <!-- Actions Row -->
        <div class="download-row card-reveal">
            <button class="download-btn" id="restart-btn" type="button">↩ Start Over</button>
        </div>
    `;

    // Wire up tabs
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            const panel = document.getElementById(btn.dataset.tab);
            if (panel) {
                panel.classList.add("active");
                // Re-trigger card-reveal animations
                panel.querySelectorAll(".card-reveal").forEach(card => {
                    card.style.animation = "none";
                    card.offsetHeight; // force reflow
                    card.style.animation = "";
                });
            }
        });
    });

    // Wire restart
    document.getElementById("restart-btn").addEventListener("click", restartFlow);

    // Animate score counter
    animateCounter("score-counter", 0, brandScore, 1200);

    // Animate score bars (after a short delay for the card to appear)
    setTimeout(() => {
        document.querySelectorAll(".score-bar-fill[data-width]").forEach(bar => {
            bar.style.width = bar.dataset.width;
        });
    }, 400);
}

function animateCounter(elementId, start, end, duration) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const range = end - start;
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + range * eased);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

// ---- Loading Stages ----
let loadingInterval = null;

function startLoadingStages() {
    const stages = [
        "Filtering experiments by your constraints…",
        "Running SAW ranking algorithm…",
        "Scoring branding readiness…",
        "AI agent analyzing recommendations…",
        "Building your execution roadmap…",
        "Generating founder report…",
    ];
    let i = 0;
    loadingStage.textContent = stages[0];

    loadingInterval = setInterval(() => {
        i++;
        if (i < stages.length) {
            loadingStage.style.opacity = "0";
            setTimeout(() => {
                loadingStage.textContent = stages[i];
                loadingStage.style.opacity = "1";
            }, 200);
        }
    }, 2200);
}

function stopLoadingStages() {
    if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
    }
}

// ---- API Call ----
async function runAnalysis() {
    const founderInputs = buildFounderInputs();
    const aiToggle = document.getElementById("ai-toggle");
    const useHf = aiToggle ? aiToggle.checked : true;

    const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            founder_inputs: founderInputs,
            threshold: 60,
            use_hugging_face: useHf,
            save_report: true,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
}

// ---- Event Handlers ----

// Start button
startBtn.addEventListener("click", () => {
    setScreen(questionScreen);
    renderQuestion();
});

// Back button
backBtn.addEventListener("click", () => {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
});

// Next button
nextBtn.addEventListener("click", async () => {
    const q = questions[currentQuestion];

    // Save text input value
    if (q.type === "text") {
        answers[q.key] = textInput.value.trim();
    }

    currentQuestion++;

    if (currentQuestion < questions.length) {
        renderQuestion();
        return;
    }

    // Done with questions — run analysis
    setScreen(loadingScreen);
    startLoadingStages();

    try {
        const analysis = await runAnalysis();
        stopLoadingStages();
        setScreen(resultScreen);
        renderResults(analysis);
    } catch (error) {
        stopLoadingStages();
        setScreen(resultScreen);
        resultsContainer.innerHTML = `
            <div class="result-card" style="text-align:center; padding:48px 28px;">
                <h2 style="color:var(--danger);">Analysis Failed</h2>
                <p style="margin:12px 0 20px;">${escapeHtml(error.message || "Unknown error")}</p>
                <button id="retry-btn" class="primary-btn">Try Again</button>
                <button id="restart-btn" class="secondary-btn" style="margin-left:12px;">Start Over</button>
            </div>
        `;
        document.getElementById("retry-btn")?.addEventListener("click", async () => {
            setScreen(loadingScreen);
            startLoadingStages();
            try {
                const analysis = await runAnalysis();
                stopLoadingStages();
                setScreen(resultScreen);
                renderResults(analysis);
            } catch (err) {
                stopLoadingStages();
                setScreen(resultScreen);
                resultsContainer.innerHTML = `
                    <div class="result-card" style="text-align:center; padding:48px 28px;">
                        <h2 style="color:var(--danger);">Still Failing</h2>
                        <p style="margin:12px 0 20px;">${escapeHtml(err.message || "Unknown error")}</p>
                        <button id="restart-btn" class="secondary-btn">Start Over</button>
                    </div>
                `;
                document.getElementById("restart-btn")?.addEventListener("click", restartFlow);
            }
        });
        document.getElementById("restart-btn")?.addEventListener("click", restartFlow);
    }
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
    // Only active on question screen
    if (questionScreen.style.display !== "flex") return;

    const q = questions[currentQuestion];

    // Enter to advance
    if (e.key === "Enter") {
        if (nextBtn.style.pointerEvents !== "none") {
            nextBtn.click();
        }
        return;
    }

    // Number keys to select options (not for text inputs)
    if (q.type === "text") return;

    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
        const opts = optionsContainer.querySelectorAll(".option");
        if (num <= opts.length) {
            opts[num - 1].click();
        }
    }
});

// Text input live-update
textInput.addEventListener("input", () => {
    const q = questions[currentQuestion];
    if (q && q.type === "text") {
        answers[q.key] = textInput.value.trim();
    }
});

// Restart
function restartFlow() {
    currentQuestion = 0;
    Object.keys(answers).forEach(key => delete answers[key]);
    resultsContainer.innerHTML = "";
    setScreen(welcomeScreen);
}