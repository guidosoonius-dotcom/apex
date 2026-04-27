# Skill: docx

**Invoke:** `/anthropic-skills:docx`
**Type:** Document Generation & Manipulation
**Package:** anthropic-skills

## Description

Creates, reads, edits, and manipulates Word documents (`.docx` files). Handles professional formatting including tables, headers, footers, styles, bullet lists, numbered lists, images, and multi-section layouts.

## Capabilities

- Create new `.docx` files from scratch with full formatting
- Read and extract text, tables, and structure from existing `.docx` files
- Edit existing documents (append, replace, restructure content)
- Apply styles, themes, and formatting (bold, italic, font sizes, colors)
- Insert tables, images, headers, footers, and page breaks
- Merge multiple Word documents into one
- Convert structured data (JSON, CSV) into formatted Word reports

## Inputs

- Plain-text instructions describing the desired document
- Existing `.docx` file path (for read/edit operations)
- Structured data (tables, lists) to embed
- Template specifications

## Outputs

- A `.docx` file written to disk
- Extracted text / table data (for read operations)

## Invocation

```
/anthropic-skills:docx
```

Trigger phrase examples:
- "Create a Word document with..."
- "Read the .docx file at..."
- "Add a table to the Word doc..."
- "Produce a professional report in Word format"
