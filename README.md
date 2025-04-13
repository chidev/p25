# Project 2025 Data Pipeline

This project implements a data pipeline that fetches and transforms data through two separate scripts:

## 1. Data Fetching (getData.ts)

The first script fetches data from various sources and generates markdown reports:

- Fetches a list of all agenda items
- Retrieves details for individual items
- Gets information about specific topics (DeepSeek AI, Solana)
- Saves reports in markdown format to the `reports` directory

Run the data fetching process:

```bash
ts-node scripts/getData.ts
```

## 2. Data Transformation (processReports.ts)

The second script processes the markdown reports into structured JSON:

- Reads all markdown files from the `reports` directory
- Transforms them into structured JSON format using transformData.ts
- Validates the data against predefined schemas
- Saves the transformed data to the `data` directory

Run the transformation process:

```bash
ts-node scripts/processReports.ts
```

## Directory Structure

- `reports/` - Contains the raw markdown reports generated by getData.ts
- `data/` - Contains the transformed JSON data produced by processReports.ts
- `logs/` - Contains execution logs for both fetching and transformation processes
- `archives/` - Contains archived data from previous runs

## Error Handling

Both scripts include comprehensive error handling and logging:

- All operations are logged to files in the `logs` directory
- getData.ts logs to data-fetching-{timestamp}.log
- processReports.ts logs to data-transformation-{timestamp}.log
- The process exits with status code 1 if any critical errors occur

## Data Types

The transformation process supports several types of reports:

- List reports (overview of all agenda items)
- Item reports (detailed information about specific items)
- DeepSeek reports (AI technology updates)
- Solana reports (blockchain/cryptocurrency updates)

Each report type is validated against a specific schema to ensure data consistency.

## Typical Workflow

1. Run getData.ts to fetch data and generate markdown reports:

   ```bash
   ts-node scripts/getData.ts
   ```

2. Once data fetching is complete, run processReports.ts to transform the reports:
   ```bash
   ts-node scripts/processReports.ts
   ```

This separation of concerns allows for:

- Independent execution of fetching and transformation steps
- Better error isolation and handling
- Ability to transform existing reports without re-fetching data
- Clearer logging and debugging of each process
