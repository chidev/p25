# Report Format Documentation

This document describes the format of the reports generated in the `reports/` directory and provides a schema for the report data.

## Overview

The system generates several types of reports using the Perplexity AI API. Each report is stored as a Markdown file (`.md`) with a corresponding debug JSON file (`.json`) that contains the raw API response data. Reports are named with a timestamp in the format `{type}-MM-DD--hh-mm-ss-AM/PM.md`.

## Report Types

### 1. List Report (`list-*.md`)

A comprehensive report that tracks the progress of all Project 2025 agenda items.

#### Format:

```markdown
<think>
[Internal reasoning/analysis by the AI - not part of the final output]
</think>

# Tracking the Progress of Project 2025 Agenda Items

[Introduction paragraph about Project 2025]

---

## **1. [Agenda Item Title]**

**Progress: [X]/100**  
**What**: [Description of agenda item and key initiatives]  
**Status**: [Current status and accomplishments]  
**Why it matters**: [Impact on rights, economy, environment, etc.]  
**Sources**: [Source references]

---

[Repeated sections for each agenda item]

---

## **Conclusion**

[Two-sentence summary with overall progress percentage]

---

[1] [Source URL 1]

[2] [Source URL 2]

[...] [Additional source URLs]
```

### 2. Item Report (`item-*.md`)

A detailed report for a specific Project 2025 agenda item.

#### Format:

```markdown
<think>
[Internal reasoning/analysis by the AI - not part of the final output]
</think>

# [Agenda Item Title]

[Detailed description of the agenda item]

---

## [Section Title, e.g., "Dismantling the Department of Education"]

### [Subsection Title, e.g., "Executive Actions and Workforce Reductions"]

[Detailed paragraph about this aspect of the agenda item with source citations]

### [Additional Subsections]

[More detailed paragraphs with source citations]

---

[Additional sections as needed]

---

## Conclusion

[Summary paragraph about the agenda item's progress and implications]

---

[1] [Source URL 1]

[2] [Source URL 2]

[...] [Additional source URLs]
```

### 3. DeepSeek AI Report (`ds-*.md`)

Information about DeepSeek AI and its developments.

#### Format:

```markdown
## Recent Developments in DeepSeek AI: A Paradigm Shift

---

[Introduction paragraph about DeepSeek AI]

### Key Features of DeepSeek AI:

- [Feature 1]
- [Feature 2]
- [Additional features]

### Potential Impact on Crypto and Beyond:

- [Impact 1]
- [Impact 2]
- [Additional impacts]

## **Sources**: [Source references]

[1] [Source URL 1]

[2] [Source URL 2]

[...] [Additional source URLs]
```

### 4. Solana Report (`solana-*.md`)

Updates on Solana cryptocurrency.

#### Format:

```markdown
Here are five summaries of recent Solana news:

## Update 1: [Title]

[Brief paragraph about this update with source citations]

## Update 2: [Title]

[Brief paragraph about this update with source citations]

[Additional updates]

## **Sources**: [Source references]

[1] [Source URL 1]

[2] [Source URL 2]

[...] [Additional source URLs]
```

## Debug JSON Files (`debug-*.json`)

Each report has a corresponding debug JSON file that contains the raw API response data.

### Structure:

```json
{
  "id": "string",
  "model": "string",
  "created": number,
  "usage": {
    "prompt_tokens": number,
    "completion_tokens": number,
    "total_tokens": number,
    "citation_tokens": number,
    "num_search_queries": number,
    "reasoning_tokens": number
  },
  "citations": [
    "string" // Array of source URLs
  ],
  "object": "string",
  "choices": [
    {
      "index": number,
      "finish_reason": "string",
      "message": {
        "role": "string",
        "content": "string" // The full report content including <think> tags
      },
      "delta": {
        "role": "string",
        "content": "string"
      }
    }
  ]
}
```

## Report Generation Process

Reports are generated using the following process:

1. A prompt is constructed based on the report type (list, item, or topic).
2. The prompt is sent to the Perplexity AI API.
3. The API response is processed to extract the report content and citations.
4. The report is written to a Markdown file, and the raw API response is written to a JSON file.

## Data Schema

### Report Data Schema

```typescript
interface ReportData {
  // Common fields for all report types
  id: string // Unique identifier for the report
  type: 'list' | 'item' | 'ds' | 'solana' // Type of report
  timestamp: string // When the report was generated
  content: string // The full report content

  // Fields specific to list and item reports
  agendaItems?: AgendaItem[] // For list reports
  agendaItem?: AgendaItem // For item reports

  // Fields specific to topic reports
  topicSummary?: string // Summary of the topic
  updates?: Update[] // For solana reports

  // Common metadata
  sources: Source[] // List of sources used
  apiMetadata: ApiMetadata // Metadata about the API call
}

interface AgendaItem {
  title: string // Title of the agenda item
  description: string // Description of the agenda item
  progress: number // Progress score (0-100)
  status: string // Current status
  impact: string // Why it matters
  sourceIndices: number[] // Indices of sources used for this item
}

interface Update {
  title: string // Title of the update
  content: string // Content of the update
  sourceIndices: number[] // Indices of sources used for this update
}

interface Source {
  index: number // Index of the source (for citation references)
  url: string // URL of the source
}

interface ApiMetadata {
  model: string // Model used for generation
  promptTokens: number // Number of tokens in the prompt
  completionTokens: number // Number of tokens in the completion
  totalTokens: number // Total number of tokens
  citationTokens: number // Number of tokens in citations
  numSearchQueries: number // Number of search queries
  reasoningTokens: number // Number of tokens in reasoning
}
```

## Implementation Notes

- Reports are generated using the Perplexity AI API with the `sonar-deep-research` model.
- The API responses include both the visible report content and internal reasoning (in `<think>` tags).
- Citations are included at the end of each report and are referenced in the text using `[n]` notation.
- Report filenames include a timestamp to ensure uniqueness and to track when reports were generated.
- Debug JSON files contain the complete API response, which can be useful for debugging and analysis.
