# Skill: pdf

**Invoke:** `/anthropic-skills:pdf`
**Type:** PDF Creation, Extraction & Manipulation
**Package:** anthropic-skills

## Description

Reads, extracts, creates, and manipulates PDF files. Handles text extraction, table parsing, page operations (split, merge, rotate), watermarking, and generating new PDFs from structured content.

## Capabilities

- Extract text and tables from existing PDF files
- Combine (merge) multiple PDFs into one
- Split a PDF into individual pages or page ranges
- Rotate pages
- Add watermarks or stamps to pages
- Create new PDFs from structured content or templates
- Extract metadata (author, date, page count)
- Parse scanned PDFs with OCR (when available)

## Inputs

- Path to an existing PDF file (for read/extract/manipulate operations)
- Multiple PDF file paths (for merge operations)
- Page range specifications (e.g. `1-5`, `3,7,9`)
- Text or structured content (for create operations)
- Watermark text or image

## Outputs

- Extracted text, tables, or metadata (returned as text/JSON)
- A new or modified `.pdf` file written to disk

## Invocation

```
/anthropic-skills:pdf
```

Trigger phrase examples:
- "Extract the tables from this PDF"
- "Merge these PDF files into one"
- "Split the PDF into separate pages"
- "Add a watermark to every page"
- "Create a PDF report from this data"
