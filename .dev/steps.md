# Implementation Steps

## Progress Tracking

- [x] Create architecture plan
- [x] Document implementation steps
- [x] Implement data fetching
- [x] Implement data transformation
- [ ] Implement data storage
- [ ] Set up the Next.js project
- [ ] Implement front-end components
- [ ] Implement routing
- [ ] Implement state management
- [ ] Implement CI/CD integration
- [ ] Implement mobile responsiveness
- [ ] Implement light and dark mode
- [ ] Implement share article feature
- [ ] Implement newsletter subscription widget
- [ ] Testing and optimization
- [ ] Deployment

## 1. Implement data fetching

- [x] Create a `scripts/getData.ts` file to fetch markdown files from the local directory
- [x] Add `build` to `package.json`, this script should invoke getting the list, processing it, then getting each list item and processing it. It can replace `index.ts`, rename the current `index.ts` to something more apt, and `index.ts` should house the build script that is invoked from `package.json`
- [x] The new index.ts file should call functiosn from the old index.ts (whatever it is renamed to), producing the list and 10 detail items as markdown in `reports/`
- [x] Do not scan `src/prompts/` from markdown.
- [x] After the reports have been scraped and are available, analyse them.
- [x] Put your findings on their formart in `.dev/format.md`
- [x] Use `fs.readdir` to read the directory containing markdown files
- [x] Use `fs.readFile` to read each markdown file
- [x] Create a scheduling script that will be triggered by the CI/CD pipeline

## 2. Implement data transformation

- [x] Install markdown parsing libraries with specific versions
  ```bash
  npm install remark@15.0.1 remark-parse@11.0.0 remark-html@16.0.1 gray-matter@4.0.3
  ```
- [x] Create a transformation function in `scripts/transformData.ts`
- [x] - Implement robust error handling with try-catch blocks
- [x] - Add detailed logging using Winston
- [x] - Include input validation
- [x] - Handle edge cases (empty files, malformed markdown)
- [x] - Leverage `.dev/format.md` findings to figure out how to consistently convert these .md files into strucuted JSON
- [x] - Create a json shape validation function and save the schema to `config/schema.ts`
- [x] - Refactor the transformation script to adhere to the schema
- [x] - Parse the markdown content using remark
- [x] - Extract metadata using gray-matter
- [x] - Convert the parsed content to JSON format
- [x] Create unit tests in `scripts/transformData.test.ts`
- [x] - Test successful transformation scenarios
- [x] - Test error handling for various edge cases
- [x] - Mock dependencies for isolated testing
- [x] - Test metadata extraction
- [x] - Test HTML conversion

## 3. Implement data storage

- [ ] Create a `data` directory to store the JSON files
- [ ] Save each transformed item as a separate JSON file
- [ ] Create an index file that lists all available items

## 4. Set up the Next.js project

- [ ] Create a new Next.js 15 project with TypeScript
  ```bash
  npx create-next-app@latest --typescript
  ```
- [ ] Install Tailwind CSS and shadcn/ui
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  npx shadcn-ui@latest init
  ```
- [ ] Configure Tailwind CSS in `tailwind.config.js`
- [ ] Set up the basic project structure

## 5. Implement front-end components

- [ ] Create the following components:
- [ ] - `components/HomePage.tsx`: Displays the list of top 10 items
- [ ] - `components/DetailPage.tsx`: Displays the details of a single item
- [ ] - `components/Layout.tsx`: Provides the basic layout for all pages
- [ ] - `components/ThemeToggle.tsx`: Component for switching between light and dark mode
- [ ] - `components/ShareArticle.tsx`: Component for sharing the article
- [ ] - `components/Newsletter.tsx`: Newsletter subscription widget
- [ ] - `components/Header.tsx`: Header component
- [ ] - `components/Footer.tsx`: Footer component

## 6. Implement routing

- [ ] Create `pages/index.tsx` for the home page
- [ ] Create `pages/[id].tsx` for the detail pages
- [ ] Implement getStaticProps and getStaticPaths for static site generation

## 7. Implement state management

- [ ] Create a `context/ThemeContext.tsx` file for managing the theme
- [ ] Use React Context API to provide theme state to all components
- [ ] Implement local storage to persist theme preference

## 8. Implement CI/CD integration

- [ ] Create configuration files for different hosting providers:
- [ ] - Vercel: Create `vercel.json` with cron job configuration
  ```json
  {
    "crons": [
      {
        "path": "/api/refresh-data",
        "schedule": "0 0 * * *"
      }
    ]
  }
  ```
- [ ] - Netlify: Create a build hook and a scheduled function
- [ ] - Railway: Configure cron job in the Railway project settings
- [ ] Create a portable solution using GitHub Actions:
- [ ] - Create `.github/workflows/daily-build.yml`
  ```yaml
  name: Daily Build
  on:
    schedule:
      - cron: '0 0 * * *'
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - uses: actions/setup-node@v2
          with:
            node-version: '18'
        - run: npm ci
        - run: npm run fetch-data
        - run: npm run build
        - name: Deploy
          # Deployment steps here
  ```

## 9. Implement mobile responsiveness

- [ ] Use Tailwind CSS responsive classes
- [ ] Test on different screen sizes
- [ ] Implement responsive navigation

## 10. Implement light and dark mode

- [ ] Configure Tailwind CSS for dark mode
- [ ] Create a theme toggle component
- [ ] Use React Context to manage the theme state
- [ ] Store the theme preference in local storage

## 11. Implement share article feature

- [ ] Add a share button to each detail page
- [ ] Use the Web Share API for modern browsers
- [ ] Provide fallback options for browsers that don't support the Web Share API

## 12. Implement newsletter subscription widget

- [ ] Create a newsletter subscription form
- [ ] Style it according to the Medium.com reading style
- [ ] Include the copy "Don't just stay updated, stay active"
- [ ] Integrate with a third-party service like Mailchimp or ConvertKit

## 13. Testing and optimization

- [ ] Write unit tests for components
- [ ] Test the data fetching and transformation process
- [ ] Optimize images and assets
- [ ] Implement SEO best practices

## 14. Deployment

- [ ] Build the static site
  ```bash
  npm run build
  ```
- [ ] Deploy to the chosen hosting provider
- [ ] Set up the CI/CD pipeline to trigger daily builds
