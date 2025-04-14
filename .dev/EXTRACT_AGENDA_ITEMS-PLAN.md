# Plan for Implementing `extractAgendaItems` Function

## Goal

To implement the `extractAgendaItems` function in `scripts/transformData.ts` to accurately extract agenda items from a given content string, using AI analysis.

## Steps

1.  **Explore Existing AI Prompts:**
    - Examine `src/prompts/item-breakdown.ts` and `src/prompts/key-list.ts` to determine if an existing prompt can be adapted for agenda item extraction.
    - If no suitable prompt exists, design a new prompt specifically for this purpose.
2.  **Define AI Function Input/Output:**
    - Clearly define the input format for the AI function (likely the `content` string).
    - Specify the desired output format (structured JSON representing agenda items).
    - Example JSON structure:
      ```json
      [
        {
          "title": "Agenda Item 1",
          "description": "Description of agenda item 1",
          "progress": 75,
          "status": "In Progress",
          "impact": "High",
          "sourceIndices": [0, 1]
        },
        {
          "title": "Agenda Item 2",
          "description": "Description of agenda item 2",
          "progress": 25,
          "status": "To Do",
          "impact": "Medium",
          "sourceIndices": [2]
        }
      ]
      ```
3.  **Implement `extractAgendaItems` Function:**
    - **Step 1: Call the AI Analysis Function:**
      - Invoke the chosen AI analysis function, passing the `content` string as input.
    - **Step 2: Parse the AI Output:**
      - Parse the JSON output from the AI model into an array of JavaScript objects.
    - **Step 3: Map to `AgendaItem` Objects:**
      - Iterate through the parsed JavaScript objects and map each object to an `AgendaItem` object.
      - Populate the `AgendaItem` fields (title, description, progress, status, impact) with the extracted data.
      - Determine the `sourceIndices` for each agenda item by matching keywords or phrases in the agenda item description to the content of the `sources` array.
    - **Step 4: Error Handling:**
      - Implement a try-catch block to handle potential errors during AI analysis or JSON parsing.
      - If an error occurs, log the error and return an empty array or a default `AgendaItem` with an error message.
4.  **Write Unit Tests:**
    - Create unit tests in `scripts/transformData.test.ts` to verify the functionality of the `extractAgendaItems` function.
    - Test cases should include:
      - Successful extraction of agenda items from valid content.
      - Handling of errors when the AI fails to parse the content.
      - Correct mapping of data to `AgendaItem` objects.
      - Accurate determination of `sourceIndices`.
5.  **Integrate and Test:**
    - Integrate the `extractAgendaItems` function with the existing `processReports.ts` and other related files.
    - Run end-to-end tests to ensure the entire report processing pipeline works correctly.

## Checklist

- [x] Explore existing AI prompts (`src/prompts/item-breakdown.ts`, `src/prompts/key-list.ts`)
- [x] Define AI function input/output format
- [x] Implement `extractAgendaItems` function
  - [x] Call AI analysis function
  - [x] Parse AI output
  - [x] Map to `AgendaItem` objects
  - [x] Implement error handling
- [x] Write unit tests (`scripts/transformData.test.ts`)
- [x] Integrate and test with existing code
