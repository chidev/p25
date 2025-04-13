# Data Fetching Implementation Checklist

## Data Fetching Script (`scripts/getData.ts`)

- [ ] Create the `scripts/getData.ts` file.
- [ ] Implement the following steps in the script:
  - [ ] Check if the `reports` and `data` directories exist, and create them if they don't.
  - [ ] Empty the `reports` folder if it has contents
  - [ ] Archive `data` folder into `archives/{date}.zip`
  - [ ] Analyze `package.json`, the `item` command takes a string argument.
  - [ ] Consolidate list and item into a single `build` command.
  - [ ] Instead of using npm commands, just execute the functions directly from `src/index.ts`, refactoring where needed.
  - [ ] Use `fs.readdir` to read the directory containing markdown files.
  - [ ] Use `fs.readFile` to read each markdown file.
  - [ ] Process the markdown files as needed.
  - [ ] At this point pause, and analyze the structure of `reports/*.md` files and save a schema to the root directory so that we know what the data might look like, as well as expected out put.
  - [ ] In between builds we should expect the same JSON format.
  - [ ] Save the processed data to the `data` directory.
  - [ ] Generate reports and save them to the `reports` directory.
- [ ] Implement error handling for file reading operations.
- [ ] Implement logging for progress and errors.

## Scheduling

- [ ] Create a scheduling script that will be triggered by the CI/CD pipeline.
- [ ] Configure the CI/CD pipeline to execute the scheduling script.
- [ ] Refactor `package.json` to include a single `build` command that executes the data fetching script (`bun scripts/getData.ts`).

## Updating Step 2 in `.dev/steps.md`

- [ ] Review the current description of step 2 in `.dev/steps.md`.
- [ ] Update step 2 to be more robust and reflect the actual data transformation process.

## Dry Run

- [ ] Perform a dry run of generating the list and 10 items.
- [ ] Verify that the data is fetched and processed correctly.
- [ ] Verify that the reports are generated correctly.

## Best Practices

- [ ] Implement logging using a library like `winston` or `pino`.
- [ ] Save logs to a timestamped file in the `logs/` directory if there are failures.
- [ ] Write unit tests for the data fetching script using a testing framework like `jest` or `mocha`.
- [ ] Verify that the script can:
  - [ ] Read markdown files.
  - [ ] Handle errors gracefully.
  - [ ] Generate the correct output.
- [ ] Follow these best practices:
  - [ ] **Error Handling**: All file operations should include proper error handling.
  - [ ] **Logging**: The script should log its progress and any errors encountered.
  - [ ] **Configuration**: Configuration values (e.g., directory paths) should be stored in environment variables or a configuration file.
  - [ ] **Testing**: The script should be thoroughly tested with unit tests.
  - [ ] **Documentation**: The code should be well-documented with comments and JSDoc annotations.
