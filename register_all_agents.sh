#!/usr/bin/env bash
# register_all_agents.sh
# Creates all 21 APEX agents via the Anthropic beta.agents API (Python SDK).
# Requires: python3, anthropic >= 0.96, ANTHROPIC_API_KEY in .env

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Load .env ─────────────────────────────────────────────────────────────────
ENV_FILE="$SCRIPT_DIR/.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  source <(grep -v '^\s*#' "$ENV_FILE" | grep '=')
  set +a
fi

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "ERROR: ANTHROPIC_API_KEY is not set" >&2
  exit 1
fi

echo "=== APEX Agent Registration ==="
echo "Env ID : ${APEX_ENV_ID:-not set}"
echo "Agents : 21"
echo ""

# ── Python worker ─────────────────────────────────────────────────────────────
python3 << 'PYEOF'
import os, sys, json, pathlib, anthropic

APEX_DIR   = pathlib.Path(os.environ.get("SCRIPT_DIR", "."))
AGENTS_DIR = APEX_DIR / "agents"
CONFIG_DIR = APEX_DIR / "config"
REGISTRY   = CONFIG_DIR / "agents_registry.json"

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

OPUS   = "claude-opus-4-6"
SONNET = "claude-sonnet-4-6"

# ── Tool helpers ──────────────────────────────────────────────────────────────
def toolset(*names):
    return [{"type": "agent_toolset_20260401",
             "configs": [{"name": n, "enabled": True} for n in names]}]

REVIEW      = toolset("read", "write")
RESEARCH    = toolset("web_search", "web_fetch", "read", "write")
PRODUCTION  = toolset("bash", "read", "write")
SYNTHESIS   = toolset("read", "write")
MIXED       = toolset("web_search", "web_fetch", "bash", "read", "write")

# ── Tier lookup ───────────────────────────────────────────────────────────────
TIER = {
    "md": "1", "ep": "1",
    "em": "2", "eda": "2", "wsl": "2",
    "sr": "3", "sa": "3", "ci": "3", "rc": "3",
    "fa": "4", "oma": "4", "dta": "4", "uxa": "4", "sca": "4", "isa": "4",
    "va": "5", "da": "5", "dp": "5", "pa": "5",
    "km": "6", "bd": "6",
}

# ── Agent catalogue ───────────────────────────────────────────────────────────
# (apex_id, display_name, model, tools, description)
AGENTS = [
    # Tier 1
    ("md",  "Managing Director",              OPUS,   PRODUCTION,
     "Top-level orchestrator. Parses briefs, selects engagement config, assigns tasks via Task Objects, enforces all quality gates."),
    ("ep",  "Engagement Partner",             OPUS,   REVIEW,
     "Senior strategic reviewer. Challenges direction at Gate H, Gate D, and G2. Produces EP Review Memo with Pass/Conditional/Rework verdict."),
    # Tier 2
    ("em",  "Engagement Manager",             SONNET, SYNTHESIS,
     "PM, synthesis lead, narrative owner. Assembles Tier 3+4 outputs into client narrative using the Strategic Insight Memo as spine."),
    ("eda", "Engagement Design Agent",        SONNET, RESEARCH,
     "Designs every engagement: Methodology Brief, Approach Document, and Engagement Hypothesis. Runs after KM retrieval; feeds Gate H."),
    ("wsl", "Workshop & Stakeholder Lead",    SONNET, PRODUCTION,
     "Designs co-creation workshop packs: facilitator guides, participant workbooks, and structured output capture templates as .pptx."),
    # Tier 3
    ("sr",  "Senior Researcher",              SONNET, RESEARCH,
     "General external intelligence engine. Market sizing, trend analysis, best-practice scanning. Produces structured Research Notes."),
    ("sa",  "Sector Agent",                   SONNET, RESEARCH,
     "Deep sector specialist configurable at intake. Produces Sector Intelligence Brief; benchmarks client against sector peers."),
    ("ci",  "Competitive Intelligence Agent", SONNET, RESEARCH,
     "Competitor mapping and benchmarking. Profiles top 3-5 competitors across strategy, digital maturity, AI adoption, and market position."),
    ("rc",  "Regulatory & Compliance Agent",  SONNET, RESEARCH,
     "Regulatory landscape specialist. EU AI Act, GDPR, sectoral regulation. Compliance Calendar. Mandatory caveat on every output."),
    # Tier 4
    ("fa",  "Financial Analyst Agent",        SONNET, PRODUCTION,
     "Business cases, NPV, ROI, sensitivity analysis in Python/openpyxl. All arithmetic in code. Conservative bias; hard/soft benefit separation."),
    ("oma", "Operating Model Agent",          SONNET, PRODUCTION,
     "Target operating models, RACI matrices, AI governance frameworks, CoE design, AI lifecycle process. Output as .pptx."),
    ("dta", "Data & Technology Agent",        SONNET, MIXED,
     "IT landscape assessment, AI data readiness scorecard (5 dimensions), technology architecture direction. Directional only."),
    ("uxa", "UX & Customer Experience Agent", SONNET, RESEARCH,
     "Customer journey maps, AI opportunity mapping across automation/personalisation/prediction/assistance, UX requirements, responsible design."),
    ("sca", "Stakeholder & Change Agent",     SONNET, RESEARCH,
     "Stakeholder maps, change readiness assessment, Change Management Plan integrated with roadmap. Output as .pptx."),
    ("isa", "Insight & Synthesis Agent",      OPUS,   SYNTHESIS,
     "Cross-domain insight crystallisation. Produces Strategic Insight Memo (max 8 points). Runs after all Tier 3+4 work is complete."),
    # Tier 5
    ("va",  "Visualisation Agent",            SONNET, PRODUCTION,
     "Charts, diagrams, and infographics via Python (matplotlib/plotly) and Mermaid. Maintains Visual Asset Register (SVG/PNG)."),
    ("da",  "Deck Agent",                     SONNET, PRODUCTION,
     "PowerPoint assembly specialist. Embeds Visual Asset Register assets; writes speaker notes; validates via LibreOffice pipeline."),
    ("dp",  "Document Production Agent",      SONNET, PRODUCTION,
     "Long-form presentation specialist. Full reports and exec summaries as .pptx using pptxgenjs. Formats approved narrative only."),
    ("pa",  "Planning Agent",                 SONNET, PRODUCTION,
     "Engagement Gantt plan and fixed-fee budget model in Excel (openpyxl). Formula-driven; no hardcoded numbers. One-page Planning Summary."),
    # Tier 6
    ("km",  "Knowledge Manager",              SONNET, PRODUCTION,
     "Steward of firm IP library. Semantic retrieval at engagement start; structured engagement summary logging at completion."),
    ("bd",  "Business Development Agent",     SONNET, MIXED,
     "Proposal production engine. Fixed-fee pricing; agent configuration proposals; KM-grounded case studies; 15-page max."),
]

# ── Load system prompt from AGENTS.md ────────────────────────────────────────
def load_system_prompt(agent_id):
    path = AGENTS_DIR / agent_id / "AGENTS.md"
    if path.exists():
        text = path.read_text(encoding="utf-8")
        if len(text) > 99_000:
            text = text[:99_000] + "\n\n[TRUNCATED — see agents/{}/AGENTS.md]".format(agent_id)
        return text
    return "You are the APEX {} agent.".format(agent_id.upper())

# ── Load or initialise registry ───────────────────────────────────────────────
if REGISTRY.exists() and REGISTRY.stat().st_size > 4:
    registry = json.loads(REGISTRY.read_text())
else:
    registry = {}

# ── Create agents ─────────────────────────────────────────────────────────────
results, failed = [], []

for (apex_id, name, model, tools, description) in AGENTS:
    short_model = "opus-4-6" if "opus" in model else "sonnet-4-6"
    print("  [{:>3}] {:<35} {}  ...".format(apex_id, name, short_model), end="", flush=True)

    try:
        agent = client.beta.agents.create(
            name=name,
            model=model,
            description=description,
            system=load_system_prompt(apex_id),
            tools=tools,
            metadata={
                "apex_id":    apex_id,
                "apex_tier":  TIER.get(apex_id, "?"),
            },
        )
        aid = agent.id

        # Write .agent_id into the agent directory
        id_path = AGENTS_DIR / apex_id / ".agent_id"
        id_path.write_text(aid)

        # Update in-memory registry
        registry[apex_id] = {
            "id":          aid,
            "name":        name,
            "model":       model,
            "tier":        TIER.get(apex_id, "?"),
            "description": description,
        }

        results.append((apex_id, aid))
        print(" {}".format(aid))

    except Exception as exc:
        print(" FAILED: {}".format(exc))
        failed.append((apex_id, str(exc)))

# ── Write registry ────────────────────────────────────────────────────────────
REGISTRY.write_text(json.dumps(registry, indent=2))

print()
print("Registry  : {}".format(REGISTRY))
print("Created   : {}".format(len(results)))
print("Failed    : {}".format(len(failed)))

if results:
    print()
    print("Agent IDs:")
    for (aid, agent_id) in results:
        print("  {} = {}".format(aid, agent_id))

if failed:
    print()
    print("Failures:")
    for (aid, err) in failed:
        print("  {}: {}".format(aid, err))
    sys.exit(1)
PYEOF
