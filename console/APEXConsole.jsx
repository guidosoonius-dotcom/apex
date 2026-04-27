// APEXConsole.jsx
// Production-grade APEX Agent Console — single-file React component
// No external imports beyond React hooks

import { useState, useRef, useEffect, useCallback } from 'react';

// ── Design System ─────────────────────────────────────────────────────────────
const C = {
  navy:       '#0F1B2D',
  teal:       '#0E7C7B',
  tealLight:  '#14A8A7',
  tealDim:    '#0A5857',
  gold:       '#C9A84C',
  goldDim:    '#8A7032',
  slate:      '#1E2D40',
  slateMid:   '#2A3F58',
  slateLight: '#3D5470',
  fog:        '#8BA3BE',
  cloud:      '#C8D8E8',
  white:      '#F0F5FA',
  red:        '#E05252',
  redDim:     '#8A3232',
  green:      '#4CAF82',
  greenDim:   '#2A6B4E',
  amber:      '#D4884A',
};

const TIER_COLOR = {
  1: C.gold,
  2: C.teal,
  3: '#5B9BD5',
  4: '#8B6FC7',
  5: '#C7706F',
  6: C.fog,
};

// ── Injected Styles ───────────────────────────────────────────────────────────
const STYLE_TAG = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Sora:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Sora', sans-serif; background: ${C.navy}; color: ${C.white}; overflow: hidden; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.slateMid}; border-radius: 2px; }

  @keyframes fadeIn    { from { opacity: 0 }                           to { opacity: 1 } }
  @keyframes slideUp   { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes slideRight{ from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes pulse     { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
  @keyframes spin      { from { transform: rotate(0deg) }              to { transform: rotate(360deg) } }
  @keyframes glow      { 0%,100% { box-shadow: 0 0 6px #0E7C7B44 }   50% { box-shadow: 0 0 18px #0E7C7B88 } }
  @keyframes reveal    { from { clip-path: inset(0 100% 0 0) }         to { clip-path: inset(0 0 0 0) } }

  .spin     { animation: spin 1s linear infinite; display: inline-flex; }
  .pulse    { animation: pulse 1.5s ease-in-out infinite; }
  .fadeIn   { animation: fadeIn 0.2s ease; }
  .slideUp  { animation: slideUp 0.25s ease; }
  .glow     { animation: glow 2s ease-in-out infinite; }

  button:hover { opacity: 0.88; }
  input:focus, textarea:focus, select:focus { outline: none; border-color: ${C.teal} !important; }
  textarea { resize: vertical; }
`;

// ── Agent Registry ─────────────────────────────────────────────────────────────
const AGENTS = [
  { id: 'md',  name: 'Managing Director',           tier: 1, model: 'opus',   apiId: 'agent_011CaBmZioH95VMexKNcgKCG',
    description: 'Top-level orchestrator. Parses briefs, selects engagement config, assigns tasks via Task Objects, enforces all quality gates.' },
  { id: 'ep',  name: 'Engagement Partner',          tier: 1, model: 'opus',   apiId: 'agent_011CaBmZmNK5MXoHJq57b3UB',
    description: 'Senior strategic reviewer. Challenges direction at Gate H, Gate D, and G2. Produces EP Review Memo with Pass/Conditional/Rework verdict.' },
  { id: 'em',  name: 'Engagement Manager',          tier: 2, model: 'sonnet', apiId: 'agent_011CaBmZoGQw7vFNXheTwgpn',
    description: 'PM, synthesis lead, narrative owner. Assembles Tier 3+4 outputs into client narrative using the Strategic Insight Memo as spine.' },
  { id: 'eda', name: 'Engagement Design Agent',     tier: 2, model: 'sonnet', apiId: 'agent_011CaBmZq16dPFCCC3TFFW1c',
    description: 'Designs every engagement: Methodology Brief, Approach Document, and Engagement Hypothesis. Runs after KM retrieval; feeds Gate H.' },
  { id: 'wsl', name: 'Workshop & Stakeholder Lead', tier: 2, model: 'sonnet', apiId: 'agent_011CaBmZrVPgmoHmjdnBDoKg',
    description: 'Designs co-creation workshop packs: facilitator guides, participant workbooks, and structured output capture templates as .pptx.' },
  { id: 'sr',  name: 'Senior Researcher',           tier: 3, model: 'sonnet', apiId: 'agent_011CaBmZtE4NnmKMj9EBGCr6',
    description: 'General external intelligence engine. Market sizing, trend analysis, best-practice scanning. Produces structured Research Notes.' },
  { id: 'sa',  name: 'Sector Agent',                tier: 3, model: 'sonnet', apiId: 'agent_011CaBmZumpyMpK3DfxZ87Di',
    description: 'Deep sector specialist. Produces Sector Intelligence Brief; benchmarks client against sector peers.' },
  { id: 'ci',  name: 'Competitive Intelligence',    tier: 3, model: 'sonnet', apiId: 'agent_011CaBmZwWWAS5wMM9mwKE8i',
    description: 'Competitor mapping and benchmarking across strategy, digital maturity, AI adoption, and market position.' },
  { id: 'rc',  name: 'Regulatory & Compliance',     tier: 3, model: 'sonnet', apiId: 'agent_011CaBmZyBTeRkXZ4cDM3xLw',
    description: 'Regulatory landscape specialist. EU AI Act, GDPR, sectoral regulation. Compliance Calendar.' },
  { id: 'fa',  name: 'Financial Analyst Agent',     tier: 4, model: 'sonnet', apiId: 'agent_011CaBmZzZZmmkmYNbEa6VaD',
    description: 'Business cases, NPV, ROI, sensitivity analysis in Python/openpyxl. Conservative bias; hard/soft benefit separation.' },
  { id: 'oma', name: 'Operating Model Agent',       tier: 4, model: 'sonnet', apiId: 'agent_011CaBma2PCDMomB2LHHic3k',
    description: 'Target operating models, RACI matrices, AI governance frameworks, CoE design, AI lifecycle process.' },
  { id: 'dta', name: 'Data & Technology Agent',     tier: 4, model: 'sonnet', apiId: 'agent_011CaBma4M22Nhon26GVfMV9',
    description: 'IT landscape assessment, AI data readiness scorecard (5 dimensions), technology architecture direction.' },
  { id: 'uxa', name: 'UX & Customer Experience',    tier: 4, model: 'sonnet', apiId: 'agent_011CaBma7r7AA1ENs9HBNEEP',
    description: 'Customer journey maps, AI opportunity mapping across automation/personalisation/prediction/assistance.' },
  { id: 'sca', name: 'Stakeholder & Change Agent',  tier: 4, model: 'sonnet', apiId: 'agent_011CaBmaAPAWiWC6Sw2ttsov',
    description: 'Stakeholder maps, change readiness assessment, Change Management Plan integrated with roadmap.' },
  { id: 'isa', name: 'Insight & Synthesis Agent',   tier: 4, model: 'opus',   apiId: 'agent_011CaBmaCF2c2uHPJeBFmwWm',
    description: 'Cross-domain insight crystallisation. Produces Strategic Insight Memo (max 8 points).' },
  { id: 'va',  name: 'Visualisation Agent',         tier: 5, model: 'sonnet', apiId: 'agent_011CaBmaE6QHD9Ea6SY95dCY',
    description: 'Charts, diagrams, and infographics via Python (matplotlib/plotly) and Mermaid. Maintains Visual Asset Register.' },
  { id: 'da',  name: 'Deck Agent',                  tier: 5, model: 'sonnet', apiId: 'agent_011CaBmaFawaqJE6emMC4LsE',
    description: 'PowerPoint assembly specialist. Embeds Visual Asset Register assets; writes speaker notes; validates via LibreOffice.' },
  { id: 'dp',  name: 'Document Production Agent',   tier: 5, model: 'sonnet', apiId: 'agent_011CaBmaH1XaQ3XX7LcHXNFQ',
    description: 'Long-form presentation specialist. Full reports and exec summaries as .pptx using pptxgenjs.' },
  { id: 'pa',  name: 'Planning Agent',              tier: 5, model: 'sonnet', apiId: 'agent_011CaBmaJTqhpaY7f7qnv1Jp',
    description: 'Engagement Gantt plan and fixed-fee budget model in Excel. Formula-driven; no hardcoded numbers.' },
  { id: 'km',  name: 'Knowledge Manager',           tier: 6, model: 'sonnet', apiId: 'agent_011CaBmaKphNUJGh4EDWnKpp',
    description: 'Steward of firm IP library. Semantic retrieval at engagement start; engagement summary logging at completion.' },
  { id: 'bd',  name: 'Business Development Agent',  tier: 6, model: 'sonnet', apiId: 'agent_011CaBmaMsxavaEdC2phroGx',
    description: 'Proposal production engine. Fixed-fee pricing; agent configuration proposals; KM-grounded case studies.' },
];

// ── Deliverable Types ─────────────────────────────────────────────────────────
const DELIVERABLES = [
  { id: 'proposal',     label: 'Proposal',                      phase: 'Sales',    agents: ['km','bd'] },
  { id: 'agent_config', label: 'Agent Configuration Proposal',   phase: 'Sales',    agents: ['km','bd','eda'] },
  { id: 'ai_strategy',  label: 'AI Strategy Report',             phase: 'Delivery', agents: ['km','eda','sr','sa','ci','isa','em','va','da','dp'] },
  { id: 'op_model',     label: 'Operating Model Design',         phase: 'Delivery', agents: ['km','eda','sr','oma','dta','sca','isa','em','va','da'] },
  { id: 'biz_case',     label: 'Business Case',                  phase: 'Delivery', agents: ['km','eda','sr','fa','isa','em','va','dp'] },
  { id: 'cx_assess',    label: 'Customer Experience Assessment', phase: 'Delivery', agents: ['km','eda','sr','uxa','isa','em','va','dp'] },
  { id: 'reg_report',   label: 'Regulatory Landscape Report',    phase: 'Delivery', agents: ['km','eda','rc','isa','em','dp'] },
  { id: 'workshop',     label: 'Workshop Pack',                  phase: 'Delivery', agents: ['km','eda','wsl','sca','em','da'] },
];

// ── Quality Gates ─────────────────────────────────────────────────────────────
const GATES = [
  { id: 'H',  label: 'Gate H',  name: 'Hypothesis Gate',  description: 'Validates engagement hypothesis, methodology, and approach design before analysis begins.' },
  { id: 'D',  label: 'Gate D',  name: 'Design Gate',      description: 'Challenges analytical direction and research focus before synthesis commences.' },
  { id: 'G1', label: 'Gate G1', name: 'Insight Gate',     description: 'Reviews Strategic Insight Memo before narrative assembly starts.' },
  { id: 'G2', label: 'Gate G2', name: 'Narrative Gate',   description: 'Reviews full narrative draft before document production.' },
  { id: 'G3', label: 'Gate G3', name: 'Final Gate',       description: 'Final quality gate before client delivery. All deliverables reviewed.' },
];

const TIER_LABELS = {
  1: 'Tier 1 — Leadership',
  2: 'Tier 2 — Engagement Design',
  3: 'Tier 3 — Research',
  4: 'Tier 4 — Specialist Analysis',
  5: 'Tier 5 — Production',
  6: 'Tier 6 — Firm Operations',
};

const SECTORS = [
  'Technology','Financial Services','Healthcare','Retail','Energy',
  'Manufacturing','Professional Services','Public Sector','Media & Entertainment','Other',
];

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const ICON_PATHS = {
  home:     <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  agents:   <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>,
  runner:   <><polygon points="5 3 19 12 5 21 5 3"/></>,
  gate:     <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  context:  <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M8 8h8M8 16h5"/></>,
  plus:     <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  close:    <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  check:    <><polyline points="20 6 9 17 4 12"/></>,
  warn:     <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  rework:   <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></>,
  file:     <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  upload:   <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></>,
  spinner:  <><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>,
  chevron:  <><polyline points="9 18 15 12 9 6"/></>,
  dot:      <><circle cx="12" cy="12" r="5" fill="currentColor"/></>,
  link:     <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>,
  doc:      <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  chart:    <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  shield:   <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  key:      <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>,
  robot:    <><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/><path d="M12 2v5m-4 4V9a4 4 0 018 0v2"/></>,
};

function Icon({ name, size = 16, color = 'currentColor', style: sx = {} }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...sx }}
    >
      {ICON_PATHS[name] || ICON_PATHS.dot}
    </svg>
  );
}

// ── Primitive Components ──────────────────────────────────────────────────────

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 38, height: 21, borderRadius: 11,
        background: value ? C.teal : C.slateMid,
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 20 : 3,
        width: 15, height: 15, borderRadius: '50%',
        background: C.white, transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }} />
    </div>
  );
}

function Pill({ label, color = C.teal }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 10,
      fontSize: 10, fontWeight: 600,
      fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em',
      background: color + '22', color, border: `1px solid ${color}44`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function Avatar({ agent, size = 32, active }) {
  const color = TIER_COLOR[agent.tier];
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.max(4, size / 6),
      background: color + '22',
      border: `1.5px solid ${active ? color : color + '55'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 700, color,
      fontFamily: 'DM Mono, monospace',
      boxShadow: active ? `0 0 8px ${color}55` : 'none',
      transition: 'all 0.2s', flexShrink: 0,
    }}>
      {agent.id.slice(0, 2).toUpperCase()}
    </div>
  );
}

// Shared style factories
const btnStyle = (bg, fg = C.white) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 8,
  background: bg, border: 'none', color: fg,
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
  transition: 'opacity 0.15s', whiteSpace: 'nowrap',
});

const inputStyle = {
  width: '100%', background: C.slateMid,
  border: `1px solid ${C.slateLight}`, borderRadius: 8,
  padding: '10px 12px', color: C.white, fontSize: 13,
  fontFamily: 'Sora, sans-serif',
};

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: C.fog,
  display: 'block', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

// ── Feed Event ────────────────────────────────────────────────────────────────

const FEED_TYPE_CONFIG = {
  agent_start:         { icon: 'dot',     label: 'Started',    color: C.teal },
  agent_output:        { icon: 'doc',     label: 'Output',     color: C.cloud },
  agent_complete:      { icon: 'check',   label: 'Complete',   color: C.green },
  gate_open:           { icon: 'gate',    label: 'Gate Open',  color: C.gold },
  gate_verdict:        { icon: 'shield',  label: 'Verdict',    color: C.gold },
  error:               { icon: 'warn',    label: 'Error',      color: C.red },
  info:                { icon: 'dot',     label: 'Info',       color: C.fog },
  engagement_complete: { icon: 'check',   label: 'Done',       color: C.green },
};

function FeedEvent({ event }) {
  const [expanded, setExpanded] = useState(false);
  const agent = AGENTS.find(a => a.id === event.agentId);
  const color = agent ? TIER_COLOR[agent.tier] : C.fog;
  const tc = FEED_TYPE_CONFIG[event.type] || FEED_TYPE_CONFIG.info;
  const isLong = event.content && event.content.length > 300;
  const displayContent = (!expanded && isLong) ? event.content.slice(0, 300) + '…' : event.content;
  const isMono = event.type === 'agent_output';

  return (
    <div className="slideUp" style={{
      padding: '11px 0',
      borderBottom: `1px solid ${C.slateMid}22`,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <div style={{ paddingTop: 3, flexShrink: 0 }}>
        <Icon name={tc.icon} size={11} color={tc.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {agent && (
            <span style={{
              fontSize: 11, fontWeight: 700, color,
              fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em',
            }}>
              {agent.id.toUpperCase()}
            </span>
          )}
          <span style={{ fontSize: 11, color: C.fog }}>{tc.label}</span>
          {event.verdict && <Pill label={event.verdict} color={{ PASS: C.green, CONDITIONAL: C.amber, REWORK: C.red }[event.verdict] || C.fog} />}
          <span style={{ fontSize: 10, color: C.slateLight, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            {new Date(event.ts).toLocaleTimeString()}
          </span>
        </div>
        {displayContent && (
          <div style={{
            fontSize: 12, color: isMono ? C.tealLight : C.cloud,
            lineHeight: 1.55, fontFamily: isMono ? 'DM Mono, monospace' : 'Sora, sans-serif',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {displayContent}
          </div>
        )}
        {isLong && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: 'none', border: 'none', color: C.teal, fontSize: 11, cursor: 'pointer', marginTop: 4, padding: 0 }}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function APEXConsole() {

  // ── Core state ───────────────────────────────────────────────────────────────
  const [view, setView]             = useState('dashboard');
  const [showModal, setShowModal]   = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [apiKey, setApiKey]         = useState(() => localStorage.getItem('apex_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [engagements, setEngagements] = useState([]);
  const [activeEngId, setActiveEngId] = useState(null);

  // Runner
  const [feed, setFeed]             = useState([]);
  const [running, setRunning]       = useState(false);
  const [runStatus, setRunStatus]   = useState('idle'); // idle | running | gate | complete | error
  const [activeAgents, setActiveAgents] = useState(new Set());
  const [context, setContext]       = useState(null);

  // Gate
  const [pendingGate, setPendingGate] = useState(null);
  const [gateMemo, setGateMemo]     = useState('');
  const [gateHistory, setGateHistory] = useState([]);

  // Modal draft
  const [draft, setDraft] = useState({ client: '', sector: '', brief: '', deliverables: [], files: [] });
  const [dragOver, setDragOver] = useState(false);

  const feedRef      = useRef(null);
  const abortRef     = useRef(null);
  const gateResolveRef = useRef(null); // resolves when EP submits verdict

  // ── Auto-scroll feed ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [feed]);

  const activeEng = engagements.find(e => e.id === activeEngId);

  // ── Feed helper ───────────────────────────────────────────────────────────────
  const addFeed = useCallback((type, agentId, content, extra = {}) => {
    setFeed(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type, agentId, content, ts: Date.now(), ...extra,
    }]);
  }, []);

  // ── API call (claude-sonnet-4-6 / claude-opus-4-6) ───────────────────────────
  const callAgent = useCallback(async (agentId, systemPrompt, userMsg) => {
    const key = apiKey || localStorage.getItem('apex_api_key');
    if (!key) throw new Error('No API key set — click the key icon in the sidebar to add it.');

    const agent = AGENTS.find(a => a.id === agentId);
    const model = agent?.model === 'opus' ? 'claude-opus-4-6' : 'claude-sonnet-4-6';

    addFeed('agent_start', agentId, userMsg.slice(0, 120) + (userMsg.length > 120 ? '…' : ''));
    setActiveAgents(prev => new Set([...prev, agentId]));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMsg }],
      }),
      signal: abortRef.current?.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const output = data.content?.[0]?.text || '';

    addFeed('agent_output', agentId, output);
    addFeed('agent_complete', agentId, `${agent?.name || agentId} task complete.`);
    setActiveAgents(prev => { const s = new Set(prev); s.delete(agentId); return s; });

    return output;
  }, [apiKey, addFeed]);

  // ── Gate: open (returns a promise resolved by submitGate) ────────────────────
  const openGate = useCallback((gateId, ctx) => {
    const gate = GATES.find(g => g.id === gateId);
    addFeed('gate_open', 'ep', `${gate?.name || gateId} opened — EP review required.`, { gateId });
    setRunStatus('gate');
    setPendingGate({ gateId, gate, ctx });
    setGateMemo('');
    setView('gate');
    return new Promise((resolve) => { gateResolveRef.current = resolve; });
  }, [addFeed]);

  // ── Gate: submit ──────────────────────────────────────────────────────────────
  const submitGate = useCallback((verdict) => {
    if (!pendingGate) return;
    const { gateId, gate } = pendingGate;
    const memo = gateMemo;

    addFeed('gate_verdict', 'ep', `${gate?.name || gateId}: ${verdict}${memo ? ' — ' + memo : ''}`, { verdict });

    const entry = { gateId, verdict, memo, ts: new Date().toISOString() };
    setGateHistory(prev => [...prev, entry]);
    setContext(prev => ({
      ...prev,
      quality_gates: { ...(prev?.quality_gates || {}), [gateId]: entry },
    }));

    setPendingGate(null);
    setGateMemo('');

    if (verdict === 'REWORK') {
      setRunStatus('idle');
      addFeed('info', null, 'Engagement paused for rework. Re-run when ready.');
      gateResolveRef.current?.('REWORK');
    } else {
      setRunStatus('running');
      setView('runner');
      gateResolveRef.current?.(verdict);
    }
    gateResolveRef.current = null;
  }, [pendingGate, gateMemo, addFeed]);

  // ── Run Engagement ────────────────────────────────────────────────────────────
  const runEngagement = useCallback(async (eng) => {
    if (running) return;
    setRunning(true);
    setRunStatus('running');
    setFeed([]);
    setActiveAgents(new Set());
    setGateHistory([]);
    setContext(null);
    setView('runner');

    abortRef.current = new AbortController();

    const deliverable = DELIVERABLES.find(d => d.id === eng.deliverables[0]);
    if (!deliverable) {
      addFeed('error', null, 'No deliverable type selected.');
      setRunning(false); setRunStatus('error'); return;
    }

    const ctx = {
      engagement_id: eng.id,
      client:        eng.client,
      sector:        eng.sector || 'General',
      brief:         eng.brief,
      engagement_type: deliverable.label,
      config:        deliverable.id.startsWith('proposal') ? 'CONFIG-F' : 'CONFIG-A',
      artefacts:     {},
      quality_gates: {},
      flags:         [],
    };
    setContext(ctx);

    const makeSystem = (agentId) => {
      const agent = AGENTS.find(a => a.id === agentId);
      return `You are the APEX ${agent?.name || agentId} — an agent within an AI-native strategy consulting firm.

EngagementContext:
${JSON.stringify(ctx, null, 2)}

Produce structured, hypothesis-driven consulting output appropriate to your role. Be concise and professional. Use clear headings.`;
    };

    const makeTask = (agentId, i, total) => {
      const agent = AGENTS.find(a => a.id === agentId);
      const prior = i > 0 ? `Prior agents (${deliverable.agents.slice(0, i).join(', ')}) have produced outputs in artefacts.` : 'You are the first agent in this sequence.';
      return `CLIENT: ${eng.client} | SECTOR: ${eng.sector || 'General'}
DELIVERABLE: ${deliverable.label} (agent ${i+1} of ${total})
BRIEF: ${eng.brief}

${prior}

Produce your ${agent?.name || agentId} output now. Structure with clear headings and sub-sections. Be specific to this client context.`;
    };

    try {
      addFeed('info', 'md', `Engagement ${eng.id} initiated — ${deliverable.label} · ${deliverable.agents.length} agents`);
      const agentSeq = deliverable.agents;

      for (let i = 0; i < agentSeq.length; i++) {
        if (abortRef.current?.signal.aborted) break;

        const agentId = agentSeq[i];

        // Gate H — after EDA (engagement design)
        if (agentId === 'eda' && i < agentSeq.length - 1) {
          const output = await callAgent(agentId, makeSystem(agentId), makeTask(agentId, i, agentSeq.length));
          ctx.artefacts[`${agentId}_output`] = output.slice(0, 600);
          setContext({ ...ctx });
          const verdict = await openGate('H', { ...ctx });
          if (verdict === 'REWORK') break;
          continue;
        }

        // Gate G1 — before ISA (insight synthesis)
        if (agentId === 'isa') {
          const verdict = await openGate('G1', { ...ctx });
          if (verdict === 'REWORK') break;
        }

        const output = await callAgent(agentId, makeSystem(agentId), makeTask(agentId, i, agentSeq.length));
        ctx.artefacts[`${agentId}_output`] = output.slice(0, 600);
        setContext({ ...ctx });
      }

      if (!abortRef.current?.signal.aborted && runStatus !== 'idle') {
        // Gate G3 — final
        const verdict = await openGate('G3', { ...ctx });
        if (verdict !== 'REWORK') {
          addFeed('engagement_complete', null, `Engagement ${eng.id} complete. Deliverable: ${deliverable.label}`);
          setRunStatus('complete');
          setEngagements(prev => prev.map(e => e.id === eng.id ? { ...e, status: 'complete' } : e));
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        addFeed('error', null, `Engagement error: ${err.message}`);
        setRunStatus('error');
        setEngagements(prev => prev.map(e => e.id === eng.id ? { ...e, status: 'error' } : e));
      }
    } finally {
      setRunning(false);
      setActiveAgents(new Set());
    }
  }, [running, callAgent, openGate, addFeed]);

  // ── Launch new engagement ─────────────────────────────────────────────────────
  const launchEngagement = () => {
    if (!draft.client || !draft.brief || draft.deliverables.length === 0) return;
    const eng = {
      id:          'ENG-' + Date.now().toString(36).toUpperCase().slice(-6),
      client:      draft.client,
      sector:      draft.sector,
      brief:       draft.brief,
      deliverables: draft.deliverables,
      files:       draft.files,
      status:      'running',
      createdAt:   new Date().toISOString(),
    };
    setEngagements(prev => [eng, ...prev]);
    setActiveEngId(eng.id);
    setShowModal(false);
    setDraft({ client: '', sector: '', brief: '', deliverables: [], files: [] });
    runEngagement(eng);
  };

  // ── Drag-drop ─────────────────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: f.size }));
    setDraft(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  // ── Nav items ─────────────────────────────────────────────────────────────────
  const NAV = [
    { id: 'dashboard', label: 'Dashboard',    icon: 'home' },
    { id: 'agents',    label: 'Agents',       icon: 'agents' },
    { id: 'runner',    label: 'Runner',       icon: 'runner' },
    { id: 'gate',      label: 'Gate Review',  icon: 'gate' },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW: Dashboard
  // ═══════════════════════════════════════════════════════════════════════════
  function ViewDashboard() {
    const stats = [
      { label: 'Engagements', value: engagements.length,                                        color: C.teal },
      { label: 'Running',     value: engagements.filter(e => e.status === 'running').length,    color: C.amber },
      { label: 'Complete',    value: engagements.filter(e => e.status === 'complete').length,   color: C.green },
      { label: 'Agents',      value: 21,                                                         color: C.gold },
    ];

    const statusColor = { ready: C.fog, running: C.teal, gate: C.gold, complete: C.green, error: C.red };

    return (
      <div className="fadeIn" style={{ padding: '28px 36px', maxWidth: 920 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, color: C.white, letterSpacing: '-0.01em' }}>
            APEX Console
          </h1>
          <p style={{ color: C.fog, fontSize: 13, marginTop: 5 }}>
            AI-native strategy consulting platform · {engagements.length} engagement{engagements.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: C.slate, border: `1px solid ${C.slateMid}`,
              borderRadius: 12, padding: '18px 20px',
            }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: s.color, fontFamily: 'Fraunces, serif' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: C.fog, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Engagements list */}
        {engagements.length > 0 ? (
          <>
            <h2 style={{ fontSize: 11, fontWeight: 600, color: C.fog, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
              Engagements
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {engagements.map(eng => {
                const sc = statusColor[eng.status] || C.fog;
                const del = eng.deliverables.map(id => DELIVERABLES.find(d => d.id === id)?.label).filter(Boolean);
                return (
                  <div
                    key={eng.id}
                    onClick={() => { setActiveEngId(eng.id); setView('runner'); }}
                    style={{
                      background: activeEngId === eng.id ? C.slateMid : C.slate,
                      border: `1px solid ${activeEngId === eng.id ? C.teal : C.slateMid}`,
                      borderRadius: 10, padding: '14px 18px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.white, marginBottom: 3 }}>{eng.client}</div>
                      <div style={{ fontSize: 12, color: C.fog, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {eng.sector && `${eng.sector} · `}{del.join(', ')}
                      </div>
                    </div>
                    <Pill label={eng.status.toUpperCase()} color={sc} />
                    <div style={{ fontSize: 10, color: C.slateLight, fontFamily: 'DM Mono, monospace' }}>{eng.id}</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{
            border: `1px dashed ${C.slateMid}`, borderRadius: 16,
            padding: '60px 40px', textAlign: 'center',
          }}>
            <Icon name="runner" size={40} color={C.slateLight} style={{ margin: '0 auto 16px', display: 'block' }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: C.cloud, marginBottom: 8 }}>No engagements yet</div>
            <div style={{ fontSize: 13, color: C.fog, marginBottom: 22 }}>Create your first engagement to get started.</div>
            <button onClick={() => setShowModal(true)} style={btnStyle(C.teal)}>
              <Icon name="plus" size={14} /> New Engagement
            </button>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW: Agents Roster
  // ═══════════════════════════════════════════════════════════════════════════
  function ViewAgents() {
    return (
      <div className="fadeIn" style={{ padding: '28px 36px', maxWidth: 980 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: C.white }}>Agent Roster</h1>
          <p style={{ color: C.fog, fontSize: 13, marginTop: 4 }}>21 registered agents across 6 tiers · claude-opus-4-6 and claude-sonnet-4-6</p>
        </div>

        {[1, 2, 3, 4, 5, 6].map(tier => {
          const tierAgents = AGENTS.filter(a => a.tier === tier);
          const tc = TIER_COLOR[tier];
          return (
            <div key={tier} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.slateMid}` }}>
                <div style={{ width: 3, height: 16, background: tc, borderRadius: 2 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: tc, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {TIER_LABELS[tier]}
                </span>
                <span style={{ fontSize: 10, color: C.slateLight }}>{tierAgents.length} agent{tierAgents.length !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
                {tierAgents.map(agent => {
                  const isActive = activeAgents.has(agent.id);
                  return (
                    <div key={agent.id} style={{
                      background: C.slate,
                      border: `1px solid ${isActive ? tc : C.slateMid}`,
                      borderRadius: 10, padding: '14px 16px',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      transition: 'border-color 0.2s',
                    }} className={isActive ? 'glow' : ''}>
                      <Avatar agent={agent} size={36} active={isActive} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: C.white }}>{agent.name}</span>
                          {isActive && <div className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: tc }} />}
                        </div>
                        <div style={{ fontSize: 11, color: C.fog, lineHeight: 1.45, marginBottom: 8 }}>{agent.description}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <Pill label={agent.model === 'opus' ? 'opus-4-6' : 'sonnet-4-6'} color={agent.model === 'opus' ? C.gold : C.teal} />
                          <span style={{ fontSize: 10, color: C.slateLight, fontFamily: 'DM Mono, monospace' }}>{agent.id}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW: Runner
  // ═══════════════════════════════════════════════════════════════════════════
  function ViewRunner() {
    const eng = activeEng;
    const statusBg = { running: C.teal + '18', gate: C.gold + '18', complete: C.green + '18', error: C.red + '18' };

    return (
      <div className="fadeIn" style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        {/* Feed panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{
            padding: '14px 24px', borderBottom: `1px solid ${C.slateMid}`,
            display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
            background: C.navy,
          }}>
            {eng ? (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.white }}>{eng.client}</div>
                  <div style={{ fontSize: 10, color: C.fog, fontFamily: 'DM Mono, monospace' }}>
                    {eng.id} · {eng.deliverables.map(id => DELIVERABLES.find(d => d.id === id)?.label).join(', ')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!running && runStatus !== 'gate' && (
                    <button onClick={() => runEngagement(eng)} style={btnStyle(C.teal)}>
                      <Icon name="runner" size={13} /> {runStatus === 'complete' ? 'Re-run' : 'Run'}
                    </button>
                  )}
                  {running && (
                    <button onClick={() => { abortRef.current?.abort(); setRunning(false); setRunStatus('idle'); }} style={btnStyle(C.red)}>
                      Stop
                    </button>
                  )}
                  <button onClick={() => setShowContext(true)} style={btnStyle(C.slateMid)}>
                    <Icon name="context" size={13} /> Context
                  </button>
                </div>
              </>
            ) : (
              <div style={{ color: C.fog, fontSize: 13 }}>No active engagement. Create one to get started.</div>
            )}
          </div>

          {/* Status bar */}
          {runStatus !== 'idle' && (
            <div style={{
              padding: '8px 24px', background: statusBg[runStatus] || 'transparent',
              borderBottom: `1px solid ${C.slateMid}`,
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, flexShrink: 0,
            }}>
              {runStatus === 'running'  && <><span className="spin"><Icon name="spinner" size={12} color={C.teal} /></span><span style={{ color: C.teal }}>Running…</span></>}
              {runStatus === 'gate'     && <>
                <Icon name="gate" size={12} color={C.gold} />
                <span style={{ color: C.gold }}>Gate review pending — </span>
                <button onClick={() => setView('gate')} style={{ background: 'none', border: 'none', color: C.gold, textDecoration: 'underline', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                  Open Gate Review
                </button>
              </>}
              {runStatus === 'complete' && <><Icon name="check" size={12} color={C.green} /><span style={{ color: C.green }}>Engagement complete</span></>}
              {runStatus === 'error'    && <><Icon name="warn"  size={12} color={C.red}   /><span style={{ color: C.red }}>Error — check feed below</span></>}
            </div>
          )}

          {/* Feed */}
          <div ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 24px' }}>
            {feed.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.slateLight, padding: '80px 0', fontSize: 13 }}>
                {eng ? 'Run the engagement to see live agent activity.' : 'Select or create an engagement.'}
              </div>
            ) : (
              feed.map(ev => <FeedEvent key={ev.id} event={ev} />)
            )}
          </div>
        </div>

        {/* Active agents sidebar */}
        <div style={{
          width: 196, borderLeft: `1px solid ${C.slateMid}`,
          padding: '16px 12px', overflowY: 'auto', flexShrink: 0, background: C.navy,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.fog, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
            Agents
          </div>
          {AGENTS.map(agent => {
            const isActive = activeAgents.has(agent.id);
            const wasSeen  = feed.some(e => e.agentId === agent.id);
            if (!isActive && !wasSeen) return null;
            const color = TIER_COLOR[agent.tier];
            return (
              <div key={agent.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 8px', borderRadius: 7, marginBottom: 3,
                background: isActive ? color + '15' : 'transparent',
              }}>
                <Avatar agent={agent} size={24} active={isActive} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? C.white : C.fog, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {agent.name.split(' ')[0]}
                  </div>
                  {isActive && <div className="pulse" style={{ fontSize: 9, color }}>● running</div>}
                  {!isActive && wasSeen && <div style={{ fontSize: 9, color: C.green }}>● done</div>}
                </div>
              </div>
            );
          }).filter(Boolean)}
          {activeAgents.size === 0 && !feed.some(e => e.agentId) && (
            <div style={{ fontSize: 11, color: C.slateLight }}>None active</div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW: Gate Review
  // ═══════════════════════════════════════════════════════════════════════════
  function ViewGate() {
    const gate = pendingGate?.gate;
    const VERDICT_COLOR = { PASS: C.green, CONDITIONAL: C.amber, REWORK: C.red };

    return (
      <div className="fadeIn" style={{ padding: '28px 40px', maxWidth: 820 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: C.gold + '22', border: `1.5px solid ${C.gold}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="gate" size={24} color={C.gold} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: C.white, marginBottom: 4 }}>
              {gate ? gate.name : 'Gate Review'}
            </h1>
            <p style={{ color: C.fog, fontSize: 13, lineHeight: 1.5 }}>
              {gate?.description || 'No gate currently pending. Gates are triggered automatically during engagement execution.'}
            </p>
          </div>
        </div>

        {pendingGate ? (
          <>
            {/* Engagement summary */}
            <div style={{ background: C.slate, border: `1px solid ${C.slateMid}`, borderRadius: 12, padding: '18px 22px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.fog, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Engagement Context</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                {[
                  ['Client',       context?.client],
                  ['Sector',       context?.sector || '—'],
                  ['Gate',         pendingGate.gateId],
                  ['Type',         context?.engagement_type || '—'],
                  ['Engagement',   context?.engagement_id],
                  ['Config',       context?.config || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: C.fog, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.white }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Artefacts */}
            {context?.artefacts && Object.keys(context.artefacts).length > 0 && (
              <div style={{ background: C.slate, border: `1px solid ${C.slateMid}`, borderRadius: 12, padding: '16px 22px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.fog, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Artefacts Produced</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Object.keys(context.artefacts).map(k => (
                    <Pill key={k} label={k.replace('_output', '')} color={C.teal} />
                  ))}
                </div>
              </div>
            )}

            {/* EP memo textarea */}
            <div style={{ background: C.slate, border: `1px solid ${C.slateMid}`, borderRadius: 12, padding: '16px 22px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.fog, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                EP Review Memo
              </div>
              <textarea
                value={gateMemo}
                onChange={e => setGateMemo(e.target.value)}
                placeholder="Record observations, conditions, or rework instructions for the team…"
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Verdict buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              {['PASS', 'CONDITIONAL', 'REWORK'].map(v => (
                <button
                  key={v}
                  onClick={() => submitGate(v)}
                  style={{
                    flex: 1, padding: '14px 0',
                    background: VERDICT_COLOR[v] + '22',
                    border: `1.5px solid ${VERDICT_COLOR[v]}`,
                    borderRadius: 10, color: VERDICT_COLOR[v],
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background 0.15s',
                  }}
                >
                  {v === 'PASS'        && <Icon name="check"  size={14} color={C.green} />}
                  {v === 'CONDITIONAL' && <Icon name="warn"   size={14} color={C.amber} />}
                  {v === 'REWORK'      && <Icon name="rework" size={14} color={C.red}   />}
                  {v}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ border: `1px dashed ${C.slateMid}`, borderRadius: 12, padding: '44px', textAlign: 'center', color: C.fog }}>
            <Icon name="gate" size={36} color={C.slateLight} style={{ margin: '0 auto 14px', display: 'block' }} />
            <div style={{ fontSize: 14, color: C.cloud, marginBottom: 6 }}>No gate pending</div>
            <div style={{ fontSize: 12 }}>Gates are triggered automatically during engagement execution.</div>
          </div>
        )}

        {/* Gate history */}
        {gateHistory.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.fog, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Gate History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {gateHistory.map((gr, i) => {
                const g = GATES.find(x => x.id === gr.gateId);
                return (
                  <div key={i} style={{
                    background: C.slate, border: `1px solid ${C.slateMid}`, borderRadius: 8,
                    padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: C.cloud, fontWeight: 600 }}>
                      {gr.gateId}
                    </span>
                    <span style={{ fontSize: 12, color: C.fog }}>{g?.name}</span>
                    <Pill label={gr.verdict} color={({ PASS: C.green, CONDITIONAL: C.amber, REWORK: C.red })[gr.verdict] || C.fog} />
                    {gr.memo && <span style={{ fontSize: 11, color: C.fog, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gr.memo}</span>}
                    <span style={{ fontSize: 10, color: C.slateLight, whiteSpace: 'nowrap' }}>{new Date(gr.ts).toLocaleTimeString()}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODAL: New Engagement
  // ═══════════════════════════════════════════════════════════════════════════
  function EngagementModal() {
    const salesD    = DELIVERABLES.filter(d => d.phase === 'Sales');
    const deliveryD = DELIVERABLES.filter(d => d.phase === 'Delivery');

    const seqAgents = [...new Set(
      draft.deliverables.flatMap(id => DELIVERABLES.find(d => d.id === id)?.agents || [])
    )];

    const canLaunch = draft.client.trim() && draft.brief.trim() && draft.deliverables.length > 0;

    const DeliverableRow = ({ d }) => {
      const checked = draft.deliverables.includes(d.id);
      return (
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
          background: checked ? C.teal + '18' : C.slateMid,
          border: `1px solid ${checked ? C.teal : 'transparent'}`,
          transition: 'all 0.15s',
        }}>
          <input
            type="checkbox" checked={checked} style={{ display: 'none' }}
            onChange={() => setDraft(p => ({
              ...p,
              deliverables: checked ? p.deliverables.filter(x => x !== d.id) : [...p.deliverables, d.id],
            }))}
          />
          <div style={{
            width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
            border: `1.5px solid ${checked ? C.teal : C.slateLight}`,
            background: checked ? C.teal : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {checked && <Icon name="check" size={10} color={C.white} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: checked ? C.white : C.cloud, fontWeight: checked ? 600 : 400 }}>{d.label}</div>
            <div style={{ fontSize: 10, color: C.slateLight, marginTop: 2 }}>
              {d.agents.slice(0, 7).join(' → ')}{d.agents.length > 7 ? ' → …' : ''}
            </div>
          </div>
        </label>
      );
    };

    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,27,45,0.88)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={e => e.target === e.currentTarget && setShowModal(false)}
      >
        <div className="slideUp" style={{
          width: 620, maxHeight: '92vh', overflowY: 'auto',
          background: C.slate, border: `1px solid ${C.slateMid}`,
          borderRadius: 18, padding: '28px 32px',
          boxShadow: '0 28px 72px rgba(0,0,0,0.7)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: C.white }}>New Engagement</h2>
            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.fog, padding: 4 }}>
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Client + Sector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Client Name *</label>
              <input value={draft.client} onChange={e => setDraft(p => ({ ...p, client: e.target.value }))}
                placeholder="e.g. Acme Corporation" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Sector</label>
              <select value={draft.sector} onChange={e => setDraft(p => ({ ...p, sector: e.target.value }))} style={inputStyle}>
                <option value="">Select sector…</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Brief */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Engagement Brief *</label>
            <textarea
              value={draft.brief}
              onChange={e => setDraft(p => ({ ...p, brief: e.target.value }))}
              placeholder="Describe the client's challenge, strategic objective, and engagement context…"
              rows={5}
              style={inputStyle}
            />
          </div>

          {/* File drop */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            style={{
              border: `1.5px dashed ${dragOver ? C.teal : C.slateMid}`,
              borderRadius: 10, padding: '16px 20px', marginBottom: 20,
              background: dragOver ? C.teal + '0D' : 'transparent',
              textAlign: 'center', transition: 'all 0.15s', cursor: 'pointer',
            }}
          >
            <Icon name="upload" size={20} color={dragOver ? C.teal : C.fog} style={{ margin: '0 auto 6px', display: 'block' }} />
            <div style={{ fontSize: 12, color: C.fog }}>Drop files to attach (brief, context documents)</div>
            {draft.files.map((f, i) => (
              <div key={i} style={{ fontSize: 11, color: C.teal, marginTop: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="file" size={10} color={C.teal} /> {f.name}
              </div>
            ))}
          </div>

          {/* Deliverables */}
          <div style={{ marginBottom: 6 }}>
            <label style={labelStyle}>Sales Phase</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
              {salesD.map(d => <DeliverableRow key={d.id} d={d} />)}
            </div>

            <label style={labelStyle}>Delivery Phase</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {deliveryD.map(d => <DeliverableRow key={d.id} d={d} />)}
            </div>
          </div>

          {/* Agent sequence preview */}
          {seqAgents.length > 0 && (
            <div style={{
              background: C.navy, border: `1px solid ${C.slateMid}`,
              borderRadius: 10, padding: '14px 16px', marginTop: 18, marginBottom: 4,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.fog, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Agent Sequence Preview
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                {seqAgents.map((id, i) => {
                  const agent = AGENTS.find(a => a.id === id);
                  if (!agent) return null;
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Avatar agent={agent} size={22} />
                      <span style={{ fontSize: 10, color: C.cloud }}>{agent.name.split(' ')[0]}</span>
                      {i < seqAgents.length - 1 && <Icon name="chevron" size={10} color={C.slateLight} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
            <button onClick={() => setShowModal(false)} style={btnStyle(C.slateMid)}>Cancel</button>
            <button
              onClick={launchEngagement}
              disabled={!canLaunch}
              style={{ ...btnStyle(C.teal), opacity: canLaunch ? 1 : 0.4, cursor: canLaunch ? 'pointer' : 'not-allowed' }}
            >
              <Icon name="runner" size={13} /> Launch Engagement
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PANEL: EngagementContext slide-in
  // ═══════════════════════════════════════════════════════════════════════════
  function ContextPanel() {
    return (
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: 340, height: '100vh',
        background: C.navy, borderLeft: `1px solid ${C.slateMid}`,
        zIndex: 100, display: 'flex', flexDirection: 'column',
        animation: 'slideRight 0.2s ease',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${C.slateMid}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: C.white }}>EngagementContext</span>
          <button onClick={() => setShowContext(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.fog }}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          {context ? (
            <pre style={{
              fontSize: 11, fontFamily: 'DM Mono, monospace', color: C.cloud,
              lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {JSON.stringify(context, null, 2)}
            </pre>
          ) : (
            <div style={{ color: C.slateLight, fontSize: 12, paddingTop: 8 }}>No active engagement context.</div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SIDEBAR
  // ═══════════════════════════════════════════════════════════════════════════
  function Sidebar() {
    const navItemSt = (active) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 14px', borderRadius: 8, cursor: 'pointer',
      color: active ? C.white : C.fog,
      background: active ? C.slateMid : 'transparent',
      fontSize: 13, fontWeight: active ? 600 : 400,
      transition: 'all 0.15s', margin: '1px 8px', userSelect: 'none',
    });

    return (
      <div style={{
        width: 210, height: '100vh', background: C.navy,
        borderRight: `1px solid ${C.slateMid}`,
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${C.slateMid}` }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 21, fontWeight: 700, color: C.white, letterSpacing: '-0.01em' }}>
            <span style={{ color: C.teal }}>APEX</span>
            <span style={{ fontSize: 12, color: C.fog, marginLeft: 8, fontFamily: 'Sora, sans-serif', fontWeight: 400 }}>Console</span>
          </div>
          <div style={{ fontSize: 10, color: C.slateLight, marginTop: 3, fontFamily: 'DM Mono, monospace' }}>
            v3.0 · 21 agents
          </div>
        </div>

        {/* New Engagement */}
        <div style={{ padding: '14px 12px 6px' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              ...btnStyle(C.teal), width: '100%', justifyContent: 'center', padding: '9px 0',
            }}
          >
            <Icon name="plus" size={14} /> New Engagement
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '6px 0', overflowY: 'auto' }}>
          {NAV.map(item => (
            <div key={item.id} onClick={() => setView(item.id)} style={navItemSt(view === item.id)}>
              <Icon name={item.icon} size={15} color={view === item.id ? C.teal : C.fog} />
              {item.label}
              {item.id === 'gate' && pendingGate && (
                <div className="pulse" style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: C.gold }} />
              )}
            </div>
          ))}

          {/* Recent engagements */}
          {engagements.length > 0 && (
            <div style={{ margin: '12px 8px 0', paddingTop: 10, borderTop: `1px solid ${C.slateMid}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 8px 8px' }}>
                Engagements
              </div>
              {engagements.slice(0, 7).map(eng => (
                <div
                  key={eng.id}
                  onClick={() => { setActiveEngId(eng.id); setView('runner'); }}
                  style={{
                    ...navItemSt(activeEngId === eng.id),
                    flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '7px 14px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: activeEngId === eng.id ? C.white : C.cloud, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {eng.client}
                  </div>
                  <div style={{ fontSize: 10, color: C.slateLight, fontFamily: 'DM Mono, monospace' }}>{eng.id}</div>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* API key */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.slateMid}` }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Anthropic API Key
          </div>
          {showKeyInput ? (
            <input
              type="password"
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); localStorage.setItem('apex_api_key', e.target.value); }}
              placeholder="sk-ant-api03-…"
              onBlur={() => setShowKeyInput(false)}
              autoFocus
              style={{ ...inputStyle, fontSize: 11, padding: '7px 10px', fontFamily: 'DM Mono, monospace' }}
            />
          ) : (
            <div
              onClick={() => setShowKeyInput(true)}
              style={{
                fontSize: 11, color: apiKey ? C.green : C.fog,
                cursor: 'pointer', fontFamily: 'DM Mono, monospace',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Icon name="key" size={11} color={apiKey ? C.green : C.fog} />
              {apiKey ? `sk-ant-…${apiKey.slice(-6)}` : 'Click to set'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ROOT RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE_TAG }} />
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.navy }}>
        <Sidebar />
        <div style={{ flex: 1, overflow: view === 'runner' ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
          {view === 'dashboard' && <ViewDashboard />}
          {view === 'agents'    && <ViewAgents />}
          {view === 'runner'    && <ViewRunner />}
          {view === 'gate'      && <ViewGate />}
        </div>
      </div>

      {showModal   && <EngagementModal />}
      {showContext && <ContextPanel />}
    </>
  );
}
