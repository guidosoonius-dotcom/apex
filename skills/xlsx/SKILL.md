# Skill: xlsx

**Invoke:** `/anthropic-skills:xlsx`
**Type:** Spreadsheet Creation & Manipulation
**Package:** anthropic-skills

## Description

Creates, reads, edits, and manipulates Excel spreadsheets (`.xlsx`, `.xlsm`, `.csv`, `.tsv` files). Handles data entry, formula authoring, formatting, charts, pivot-table-style aggregations, and multi-sheet workbooks.

## Capabilities

- Create new `.xlsx` workbooks from scratch
- Read and extract data from existing spreadsheets (including `.csv`, `.tsv`)
- Add, rename, or reorder sheets in a workbook
- Write and apply Excel formulas (`SUM`, `VLOOKUP`, `IF`, `INDEX/MATCH`, etc.)
- Format cells (number formats, colors, borders, conditional formatting)
- Insert and configure charts (bar, line, pie, scatter, etc.)
- Sort, filter, and aggregate data
- Merge data from multiple sheets or files

## Inputs

- Structured data (lists, dicts, CSV text) to load into a spreadsheet
- Existing `.xlsx` / `.csv` file path (for read/edit operations)
- Formula or transformation instructions
- Chart type and data range specifications

## Outputs

- An `.xlsx` (or `.csv`) file written to disk
- Extracted data as text, JSON, or markdown table (for read operations)

## Invocation

```
/anthropic-skills:xlsx
```

Trigger phrase examples:
- "Create a spreadsheet with..."
- "Read the Excel file at..."
- "Add a SUM formula to column D"
- "Generate a bar chart from this data"
- "Convert this CSV to a formatted .xlsx"
