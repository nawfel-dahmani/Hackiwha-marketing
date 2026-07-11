import copy
import json
import os

def load_dotenv():
    possible_paths = [
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.path.dirname(__file__), "..", ".env"),
        ".env"
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ[k.strip()] = v.strip().strip("'\"")
            except Exception:
                pass

load_dotenv()

DEFAULT_MODEL = os.getenv("HF_MODEL", "Qwen/Qwen2.5-72B-Instruct")
DEFAULT_PROVIDER = os.getenv("HF_PROVIDER", "auto")



AI_RECOMMENDATION_SCHEMA = {
    "type": "object",
    "properties": {
        "mode": {"type": "string", "enum": ["branding_first", "marketing_ready"]},
        "brand_score": {"type": "number"},
        "summary": {"type": "string"},
        "top_branding_recommendations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "score": {"type": "number"},
                    "reason": {"type": "string"},
                },
                "required": ["id", "name", "score", "reason"],
                "additionalProperties": False,
            },
        },
        "top_marketing_recommendations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "score": {"type": "number"},
                    "reason": {"type": "string"},
                },
                "required": ["id", "name", "score", "reason"],
                "additionalProperties": False,
            },
        },
        "risks": {
            "type": "array",
            "items": {"type": "string"},
        },
    },
    "required": [
        "mode",
        "brand_score",
        "summary",
        "top_branding_recommendations",
        "top_marketing_recommendations",
        "risks",
    ],
    "additionalProperties": False,
}


ROADMAP_REPORT_SCHEMA = {
    "type": "object",
    "properties": {
        "agreement": {
            "type": "array",
            "items": {"type": "string"},
        },
        "differences": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "topic": {"type": "string"},
                    "algorithm_view": {"type": "string"},
                    "ai_view": {"type": "string"},
                    "recommended_decision": {"type": "string"},
                },
                "required": [
                    "topic",
                    "algorithm_view",
                    "ai_view",
                    "recommended_decision",
                ],
                "additionalProperties": False,
            },
        },
        "roadmap": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "phase": {"type": "string"},
                    "timeframe": {"type": "string"},
                    "actions": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                    "success_metrics": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                },
                "required": ["phase", "timeframe", "actions", "success_metrics"],
                "additionalProperties": False,
            },
        },
        "founder_report": {"type": "string"},
    },
    "required": ["agreement", "differences", "roadmap", "founder_report"],
    "additionalProperties": False,
}


def get_hf_client():
    """Create the Hugging Face client lazily so local engine tests do not need HF installed."""
    token = os.getenv("HF_TOKEN")
    if not token:
        raise RuntimeError("HF_TOKEN is missing. Set it before calling Hugging Face agents.")

    try:
        from huggingface_hub import InferenceClient
    except ImportError as exc:
        raise RuntimeError(
            "huggingface_hub is not installed. Run: pip install huggingface_hub"
        ) from exc

    return InferenceClient(provider=DEFAULT_PROVIDER, api_key=token)


def extract_json_object(content):
    """Parse JSON even if the model wraps it in markdown text."""
    text = content.strip()

    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1]).strip()
        if text.lower().startswith("json"):
            text = text[4:].strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise

        return json.loads(text[start:end + 1])


def call_json_agent(system_prompt, payload, schema, schema_name, model=DEFAULT_MODEL):
    """Call a model that does not support json_schema and ask it to return JSON only."""
    client = get_hf_client()
    json_prompt = (
        f"{system_prompt}\n\n"
        f"Return ONLY valid JSON for this schema name: {schema_name}.\n"
        "Do not include markdown, code fences, comments, or extra explanation.\n"
        f"JSON schema:\n{json.dumps(schema, ensure_ascii=False)}"
    )

    response = client.chat_completion(
        model=model,
        messages=[
            {"role": "system", "content": json_prompt},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
        ],
        temperature=0.2,
        max_tokens=800,
    )

    return extract_json_object(response.choices[0].message.content)


def call_structured_agent(system_prompt, payload, schema, schema_name, model=DEFAULT_MODEL):
    """Call Hugging Face and parse JSON, with a fallback for providers without json_schema."""
    client = get_hf_client()
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": schema_name,
            "schema": schema,
            "strict": True,
        },
    }

    try:
        response = client.chat_completion(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
            ],
            response_format=response_format,
            temperature=0.2,
            max_tokens=800,
        )

        return json.loads(response.choices[0].message.content)
    except Exception as exc:
        message = str(exc)
        unsupported_schema = (
            "response_format" in message
            or "json_schema" in message
            or "structured-outputs" in message
        )

        if not unsupported_schema:
            raise

        return call_json_agent(system_prompt, payload, schema, schema_name, model=model)


def call_deepseek_agent(system_prompt, payload, schema, schema_name):
    import requests
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise RuntimeError("DEEPSEEK_API_KEY is missing.")

    url = "https://api.deepseek.com/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    # DeepSeek JSON Mode requires the word "json" in the prompt
    full_prompt = (
        f"{system_prompt}\n\n"
        f"Return ONLY valid JSON matching this schema: {json.dumps(schema, ensure_ascii=False)}.\n"
        "Do not include markdown code blocks, comments, or extra explanation. Return raw JSON text."
    )

    data = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": full_prompt},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
        "max_tokens": 1000
    }

    print(f"[DeepSeek] Calling {url} with model={data['model']}...")
    response = requests.post(url, headers=headers, json=data, timeout=60)
    print(f"[DeepSeek] Response status: {response.status_code}")
    response.raise_for_status()

    content = response.json()["choices"][0]["message"]["content"]
    return extract_json_object(content)


def generate_ai_recommendation(founder_inputs, library, algorithm_output):
    """
    Agent 1: produce an AI recommendation with the same high-level shape as the
    deterministic decision engine, using only items from library.json.
    """
    system_prompt = (
        "You are LaunchPilot Agent 1. Recommend startup branding and marketing "
        "actions using the provided founder inputs, experiment library, and decision "
        "engine output. Use only experiments that exist in the library. Return concise "
        "structured JSON. Do not invent experiment IDs."
    )
    payload = {
        "founder_inputs": founder_inputs,
        "library": library,
        "algorithm_output": algorithm_output,
    }

    if os.getenv("DEEPSEEK_API_KEY"):
        return call_deepseek_agent(
            system_prompt,
            payload,
            AI_RECOMMENDATION_SCHEMA,
            "AIRecommendation"
        )

    return call_structured_agent(
        system_prompt,
        payload,
        AI_RECOMMENDATION_SCHEMA,
        "AIRecommendation",
    )


def generate_roadmap_report(founder_inputs, algorithm_output, ai_output):
    """
    Agent 2: compare algorithm and AI outputs, then produce a founder roadmap and
    uploadable report text.
    """
    system_prompt = (
        "You are LaunchPilot Agent 2. Compare the deterministic algorithm output "
        "with the AI recommendation. If they differ, separate the possible founder "
        "decisions clearly. Produce a practical roadmap and a readable report for upload."
    )
    payload = {
        "founder_inputs": founder_inputs,
        "algorithm_output": algorithm_output,
        "ai_output": ai_output,
    }

    if os.getenv("DEEPSEEK_API_KEY"):
        return call_deepseek_agent(
            system_prompt,
            payload,
            ROADMAP_REPORT_SCHEMA,
            "RoadmapReport"
        )

    return call_structured_agent(
        system_prompt,
        payload,
        ROADMAP_REPORT_SCHEMA,
        "RoadmapReport",
    )


def summarize_engine_item(ranked_item):
    experiment = ranked_item.get("experiment", {})
    return {
        "id": experiment.get("id", ""),
        "name": experiment.get("name", ""),
        "score": ranked_item.get("score", 0),
        "reason": experiment.get("why_score", experiment.get("description", "")),
    }


def fallback_ai_recommendation(algorithm_output):
    """Local fallback for demos when Hugging Face credentials are not configured."""
    output = copy.deepcopy(algorithm_output)
    mode = output.get("mode", "branding_first")

    if mode == "marketing_ready":
        branding = []
        marketing = [
            summarize_engine_item(item)
            for item in output.get("recommendations", [])[:3]
        ]
    else:
        branding = [
            summarize_engine_item(item)
            for item in output.get("branding_recommendations", [])[:3]
        ]
        marketing = [
            summarize_engine_item(item)
            for item in output.get("marketing_recommendations", [])[:3]
        ]

    return {
        "mode": mode,
        "brand_score": output.get("brand_score", 0),
        "summary": "",
        "top_branding_recommendations": branding,
        "top_marketing_recommendations": marketing,
        "risks": [
            "This fallback does not include independent AI reasoning.",
            "Use Hugging Face before final founder-facing recommendations.",
        ],
    }


def fallback_roadmap_report(founder_inputs, algorithm_output, ai_output):
    """Local Agent 2 fallback that still separates and explains both outputs."""
    mode = algorithm_output.get("mode", "branding_first")
    brand_score = algorithm_output.get("brand_score", 0)
    threshold = algorithm_output.get("threshold", 60)

    agreement = [
        f"Both outputs use the founder constraints: budget {founder_inputs.get('budget')}, "
        f"team size {founder_inputs.get('team_size')}, max days {founder_inputs.get('max_days')}."
    ]

    if ai_output.get("mode") == mode:
        agreement.append(f"Both outputs recommend the '{mode}' path.")

    differences = []
    if ai_output.get("mode") != mode:
        differences.append({
            "topic": "Recommendation mode",
            "algorithm_view": f"The decision engine chose {mode}.",
            "ai_view": f"The AI agent chose {ai_output.get('mode')}.",
            "recommended_decision": "Use the deterministic engine as the primary gate and treat AI as advisory.",
        })

    roadmap = []
    if mode == "branding_first":
        top_branding = ai_output.get("top_branding_recommendations", [])[:2]
        top_marketing = ai_output.get("top_marketing_recommendations", [])[:2]
        roadmap.append({
            "phase": "Brand foundation",
            "timeframe": "Days 1-3",
            "actions": [
                f"Complete {item['name']}" for item in top_branding
            ] or ["Complete the top ranked branding strategy from the decision engine."],
            "success_metrics": [
                "Founder can explain the value proposition in one sentence.",
                "Target audience and core message are documented.",
            ],
        })
        roadmap.append({
            "phase": "Marketing validation",
            "timeframe": "Days 4-10",
            "actions": [
                f"Run {item['name']}" for item in top_marketing
            ] or ["Run the top ranked marketing experiment after branding is clearer."],
            "success_metrics": [
                "At least 10 useful audience signals are collected.",
                "Founder can decide whether to continue, pivot, or narrow the audience.",
            ],
        })
    else:
        top_marketing = ai_output.get("top_marketing_recommendations", [])[:3]
        roadmap.append({
            "phase": "Marketing execution",
            "timeframe": "This week",
            "actions": [
                f"Run {item['name']}" for item in top_marketing
            ] or ["Run the top ranked marketing experiments from the decision engine."],
            "success_metrics": [
                "Measure replies, signups, clicks, or interviews booked.",
                "Compare cost and time spent against evidence quality.",
            ],
        })

    founder_report = (
        f"LaunchPilot Analysis\n\n"
        f"Brand score: {brand_score}/100. Threshold: {threshold}/100.\n"
        f"The deterministic engine selected '{mode}'. The AI output selected "
        f"'{ai_output.get('mode')}'. The founder should prioritize the roadmap "
        f"above because it respects hard constraints first, then uses AI reasoning "
        f"to explain tradeoffs and next actions."
    )

    return {
        "agreement": agreement,
        "differences": differences,
        "roadmap": roadmap,
        "founder_report": founder_report,
    }
