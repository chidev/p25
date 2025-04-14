# Architecture for `extractAgendaItems` Function

## Goal

To implement the `extractAgendaItems` function in `scripts/transformData.ts` to accurately extract agenda items from a given content string, using AI analysis.

## 1. Understanding the Input and Output

- **Input:**
  - `content`: A string containing the full report content. This content needs to be parsed to identify individual agenda items.
  - `sources`: An array of `Source` objects, providing context and URLs for the report content.
- **Output:**
  - `Promise<AgendaItem[]>`: A promise that resolves to an array of `AgendaItem` objects. Each `AgendaItem` should contain:
    - `title`: Title of the agenda item.
    - `description`: Description of the agenda item.
    - `progress`: Progress score (0-100).
    - `status`: Current status.
    - `impact`: Why it matters.
    - `sourceIndices`: Indices of the sources used for this item.

## 2. AI Analysis Function

- **Choice of AI Model:**
  - Leverage an existing AI model or create a new one specifically for list reports. Existing prompts like `src/prompts/item-breakdown.ts` or `src/prompts/key-list.ts` could be adapted.
- **Input Format:**
  - The `content` string will be the primary input to the AI model.
- **Output Format:**
  - The AI model should return a structured JSON format that can be easily parsed into an array of `AgendaItem` objects. The structure should include fields for title, description, progress, status, impact, and relevant source URLs.
  - Example:
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

## 3. Implementation in `extractAgendaItems`

1.  **Call the AI Analysis Function:**
    - Pass the `content` string to the chosen AI analysis function.
2.  **Parse the AI Output:**
    - Parse the JSON output from the AI model into an array of JavaScript objects.
3.  **Map to `AgendaItem` Objects:**
    - Map each JavaScript object to an `AgendaItem` object, populating the fields with the extracted data.
    - Determine the correct `sourceIndices` for each agenda item by matching keywords or phrases in the agenda item description to the content of the `sources`.
4.  **Error Handling:**
    - Implement error handling to catch cases where the AI fails to parse the content or returns an invalid format. In such cases, return an empty array or a default `AgendaItem` with an error message.

## 4. Error Handling

- Wrap the AI call in a try-catch block.
- If an error occurs, log the error and return an empty array or a default AgendaItem with an error message indicating parsing failure.

## 5. Integration with Existing Code

- Ensure the `extractAgendaItems` function integrates seamlessly with the existing `processReports.ts` and other related files.
- Write unit tests (`scripts/transformData.test.ts`) to verify the functionality of the `extractAgendaItems` function.

## 6. Diagram

```mermaid
graph LR
    A[Content String] --> B(AI Analysis Function);
    B --> C{JSON Output};
    C -- Parse --> D[JavaScript Objects];
    D -- Map --> E[AgendaItem[]];
    E --> F(Return AgendaItem[]);
```
