# P25 Report Processing

This project processes markdown reports and converts them to structured JSON data.

## Features

- Extracts structured data from markdown reports
- Supports multiple report types: list, item, deepseek, solana
- AI-powered content analysis for deriving progress, status, and impact
- Fallback to regex-based extraction if AI analysis fails

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:
   Create a `.env` file with the following content:

```
OPENAI_API_KEY=your-openai-api-key-here
```

## Usage

### Transform a markdown file to JSON

```bash
bun scripts/transformData.ts <inputPath> [outputPath]
```

Example:

```bash
bun scripts/transformData.ts reports/item-0-04-13--01-14-57-PM.md data/item-0-04-13--01-14-57-PM.json
```

### Process all reports

```bash
bun scripts/processReports.ts
```

## AI-Powered Content Analysis

For item reports, the system uses OpenAI's GPT-3.5-Turbo model to analyze the content and derive:

1. **Progress**: A number from 0-100 representing completion percentage
2. **Status**: A concise summary of the current status
3. **Impact**: A concise explanation of why this matters

If the AI analysis fails, the system falls back to regex-based extraction.

## Report Types

- **List Report**: Contains multiple agenda items
- **Item Report**: Contains a single agenda item with detailed analysis
- **DeepSeek Report**: Contains topic summary, features, and impacts
- **Solana Report**: Contains updates on Solana-related topics
