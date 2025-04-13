# Execution Plan: Implement Data Transformation (Step 2)

**Goal:** Create a robust script (`scripts/transformData.ts`) that takes raw markdown content (fetched in Step 1, conforming to formats in `.dev/format.md`), parses it, extracts relevant information, and transforms it into a structured JSON object validated against a defined schema.

**Execution Plan:**

1.  **Install Dependencies:**

    - Run `npm install remark@15.0.1 remark-parse@11.0.0 remark-html@16.0.1 gray-matter@4.0.3` (as specified).
    - Run `npm install winston` for logging.
    - Run `npm install zod` for schema definition and validation.

2.  **Define Data Structure and Schema:**

    - Create a new directory: `config`.
    - Create `config/schema.ts`.
    - Inside `config/schema.ts`, define TypeScript interfaces representing the desired JSON structure for the different report types found in `.dev/format.md` (List, Item, DeepSeek, Solana).
    - Use `zod` within `config/schema.ts` to create validation schemas corresponding to these TypeScript interfaces.

3.  **Implement Transformation Script (`scripts/transformData.ts`):**

    - Create the file `scripts/transformData.ts`.
    - **Setup:** Import necessary libraries (`remark`, `gray-matter`, `winston`, `zod`, and the schemas from `config/schema.ts`). Configure a Winston logger instance.
    - **Main Function:** Define an asynchronous function (e.g., `transformMarkdownToJson`) that accepts the markdown content string and potentially the report type as input.
    - **Core Logic (within try-catch block):**
      - **Input Validation:** Check for empty or invalid input.
      - **Metadata Extraction:** Use `gray-matter` to parse frontmatter (if any) and the main content.
      - **Content Parsing:** Use `remark` and `remark-parse` to generate an Abstract Syntax Tree (AST) from the main markdown content.
      - **Structure Mapping:** Traverse the remark AST. Identify headings, paragraphs, lists, code blocks, etc., and map them to the fields defined in the appropriate `config/schema.ts` interface/schema based on the report type and patterns observed in `.dev/format.md`. _Note: `remark-html` might be useful for converting specific markdown parts (like paragraphs with formatting) to HTML strings if needed within the JSON, but the primary goal is structured JSON._
      - **Data Aggregation:** Combine extracted metadata and parsed/structured content into a single JavaScript object matching the target schema.
      - **Validation:** Use the `zod` schema (imported from `config/schema.ts`) to validate the generated object. If validation fails, throw a specific error.
      - **Return:** Return the validated JSON object.
    - **Error Handling:** Implement robust try-catch blocks to handle parsing errors, validation errors, and unexpected structures. Log errors using Winston.
    - **Logging:** Add detailed Winston logs for key steps (e.g., starting transformation, metadata found, content parsed, validation success/failure, errors).
    - **Edge Cases:** Explicitly handle potential edge cases like empty files, files with only metadata, malformed markdown syntax, etc.

4.  **Implement Unit Tests (`scripts/transformData.test.ts`):**
    - Create the file `scripts/transformData.test.ts`.
    - **Setup:** Import the `transformMarkdownToJson` function and necessary testing utilities (assuming Jest/Vitest).
    - **Test Cases:**
      - Test successful transformation for each report type defined in `.dev/format.md` using sample markdown strings.
      - Verify the output JSON structure matches the `zod` schema.
      - Test with edge cases: empty input, malformed markdown, missing expected sections.
      - Test error handling: ensure appropriate errors are thrown for invalid input or failed validation.
      - Mock any external dependencies if necessary (though this function primarily works on strings, mocking might be needed if it evolves).

**Visualization of `transformMarkdownToJson` Logic:**

```mermaid
graph TD
    A[Input: Markdown String] --> B{Input Validation};
    B -- Valid --> C{Parse Metadata (gray-matter)};
    B -- Invalid --> Z[Throw Input Error];
    C --> D{Parse Content (remark)};
    D -- Success --> E{Traverse AST & Map to Schema};
    D -- Error --> Y[Throw Parsing Error];
    E --> F{Aggregate Data};
    F --> G{Validate with Zod Schema};
    G -- Valid --> H[Return Validated JSON];
    G -- Invalid --> X[Throw Validation Error];
    subgraph Error Handling
        Z; Y; X;
    end
    subgraph Logging
        L1[Log Start] --> C;
        L2[Log Parsing] --> D;
        L3[Log Validation] --> G;
        L4[Log Success/Error] --> H;
        L4 --> X; L4 --> Y; L4 --> Z;
    end

    style Error Handling fill:#f9f,stroke:#333,stroke-width:2px
```
