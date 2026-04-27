# APEX Skills Index

Installed skills that APEX agents can invoke via the Claude Code skill system.

---

## docx — Word Document Skill

| Field | Value |
|---|---|
| **Invoke** | `/anthropic-skills:docx` |
| **Definition** | `skills/docx/SKILL.md` |
| **Produces** | `.docx` files; extracted text/tables from existing Word docs |

**What it does:** Creates, reads, edits, and formats Word documents — reports, proposals, contracts, meeting notes, structured narratives — with full style and layout control.

**APEX agents that should invoke it:**

| Agent | Code | Rationale |
|---|---|---|
| Personal Assistant | `pa` | Drafts letters, memos, meeting notes, and general documents on behalf of the user |
| Executive Processor | `ep` | Produces formal executive summaries, board briefs, and decision documents |
| Knowledge Manager | `km` | Exports knowledge articles, SOPs, and wikis to portable Word format |
| Research Coordinator | `rc` | Packages research findings and literature reviews as Word reports |
| Solution Architect | `sa` | Writes technical specifications, architecture decision records, and proposals |
| Business Development | `bd` | Creates proposals, RFP responses, partnership briefs, and client deliverables |
| Senior Researcher | `sr` | Formats long-form research papers and annotated bibliographies |
| Marketing Director | `md` | Produces copy documents, campaign briefs, and content calendars |
| Operations Manager | `oma` | Generates process documentation, runbooks, and operational reports |

---

## pdf — PDF Skill

| Field | Value |
|---|---|
| **Invoke** | `/anthropic-skills:pdf` |
| **Definition** | `skills/pdf/SKILL.md` |
| **Produces** | `.pdf` files; extracted text, tables, and metadata from existing PDFs |

**What it does:** Reads and extracts content from PDFs, merges or splits PDF files, rotates pages, adds watermarks, and generates new PDFs from structured content.

**APEX agents that should invoke it:**

| Agent | Code | Rationale |
|---|---|---|
| Personal Assistant | `pa` | Reads incoming PDFs (invoices, forms, contracts) and generates outbound PDFs |
| Executive Processor | `ep` | Ingests PDF reports and produces signed-off, watermarked executive PDFs |
| Document Production | `dp` | Primary consumer — produces all written `.docx` deliverables |
| Knowledge Manager | `km` | Extracts and indexes content from PDF knowledge sources |
| Financial Analyst | `fa` | Parses PDF financial statements, invoices, and bank reports |
| Data Analyst | `da` | Extracts tabular data from PDF data dumps and regulatory filings |
| Research Coordinator | `rc` | Extracts text and citations from academic PDF papers |
| Senior Researcher | `sr` | Reads and annotates PDF literature; produces PDF research outputs |
| Competitive Intelligence | `ci` | Ingests competitor PDF reports, whitepapers, and press releases |
| Supply Chain Agent | `sca` | Processes PDF purchase orders, shipping manifests, and compliance docs |

---

## pptx — PowerPoint Presentation Skill

| Field | Value |
|---|---|
| **Invoke** | `/anthropic-skills:pptx` |
| **Definition** | `skills/pptx/SKILL.md` |
| **Produces** | `.pptx` files; extracted outlines/text from existing presentations |

**What it does:** Creates slide decks and pitch decks, edits existing presentations, applies themes and layouts, embeds charts and tables, and adds speaker notes.

**APEX agents that should invoke it:**

| Agent | Code | Rationale |
|---|---|---|
| Personal Assistant | `pa` | Assembles status-update and weekly-review slide decks |
| Executive Processor | `ep` | Builds executive briefings and board-level presentation packages |
| Solution Architect | `sa` | Creates architecture overview and technology comparison decks |
| Business Development | `bd` | Produces pitch decks, investor presentations, and partnership proposals |
| Marketing Director | `md` | Builds campaign presentations, brand decks, and go-to-market slides |
| Intelligent Sales Assistant | `isa` | Generates tailored sales decks and product-demo presentations |
| Research Coordinator | `rc` | Converts research findings into stakeholder presentation decks |
| UX Analyst | `uxa` | Creates design-review, user-research, and prototype-walkthrough decks |

---

## xlsx — Excel Spreadsheet Skill

| Field | Value |
|---|---|
| **Invoke** | `/anthropic-skills:xlsx` |
| **Definition** | `skills/xlsx/SKILL.md` |
| **Produces** | `.xlsx` / `.csv` files; extracted data as JSON or markdown tables |

**What it does:** Creates and edits Excel workbooks, writes formulas, formats cells, generates charts, aggregates multi-sheet data, and converts between CSV/TSV/XLSX formats.

**APEX agents that should invoke it:**

| Agent | Code | Rationale |
|---|---|---|
| Financial Analyst | `fa` | Primary consumer — budgets, P&L models, financial projections, and reconciliations |
| Deck Agent | `da` | Primary consumer — builds all presentation decks and slide deliverables |
| Exploratory Data Analyst | `eda` | Quick data profiling and statistical summaries before full pipeline ingestion |
| Document Processor | `dp` | Converts structured data outputs to formatted Excel deliverables |
| Data Transfer Agent | `dta` | Moves data between systems via CSV/XLSX as an interchange format |
| Operations Manager | `oma` | Tracks KPIs, capacity plans, and resource allocation in workbooks |
| Supply Chain Agent | `sca` | Manages inventory tables, order tracking, and supplier scorecards |
| Virtual Assistant | `va` | Builds simple tracking sheets, checklists, and scheduling grids on request |

---

## Quick-reference matrix

| Skill | `pa` | `ep` | `bd` | `sa` | `km` | `rc` | `sr` | `md` | `fa` | `da` | `eda` | `dp` | `dta` | `oma` | `sca` | `isa` | `ci` | `uxa` | `va` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **docx** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | | | | ✓ | | | | | |
| **pdf**  | ✓ | ✓ | | | ✓ | ✓ | ✓ | | ✓ | ✓ | | ✓ | | | ✓ | | ✓ | | |
| **pptx** | ✓ | ✓ | ✓ | ✓ | | ✓ | | ✓ | | | | | | | | ✓ | | ✓ | |
| **xlsx** | | | | | | | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | | ✓ |
