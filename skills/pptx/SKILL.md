# Skill: pptx

**Invoke:** `/anthropic-skills:pptx`
**Type:** Presentation Creation & Manipulation
**Package:** anthropic-skills

## Description

Creates, reads, edits, and manipulates PowerPoint presentations (`.pptx` files). Builds slide decks with titles, bullet points, charts, tables, images, speaker notes, and consistent themes.

## Capabilities

- Create new `.pptx` presentations from scratch
- Read and extract text, structure, and speaker notes from existing presentations
- Add, remove, or reorder slides
- Apply themes, layouts, fonts, and color schemes
- Insert charts, tables, images, and shapes
- Add speaker notes to slides
- Generate pitch decks, status updates, or executive summaries
- Convert structured outlines or JSON into slide decks

## Inputs

- Plain-text outline or structured content to convert into slides
- Existing `.pptx` file path (for read/edit operations)
- Theme or color scheme specifications
- Data tables or chart data to visualize

## Outputs

- A `.pptx` file written to disk
- Extracted text / outline (for read operations)

## Invocation

```
/anthropic-skills:pptx
```

Trigger phrase examples:
- "Create a slide deck about..."
- "Build a pitch deck for..."
- "Read the PowerPoint at..."
- "Add a new slide to the presentation"
- "Convert this outline into a .pptx"
