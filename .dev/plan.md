# Architecture Plan

## Overview

This document outlines the architecture plan for a Next.js 15 application that fetches data daily, transforms it into JSON, and serves it as a static site.

## Data Fetching and Scheduling

The data fetching and transformation task will be triggered daily by a CI/CD pipeline. The pipeline will fetch data from a local directory containing markdown files. A `getData.ts` file will handle the data fetching logic.

## Data Transformation

The fetched markdown data will be transformed into JSON format using a markdown parsing library like `remark` or `markdown-it`. A post-processing service will convert the markdown to JSON.

## Data Storage

The transformed JSON data will be stored in the file system. A directory (e.g., `data`) will store the JSON files, with each data item having its own JSON file.

## API Design

Since it's a static site, there's no need for a traditional API. Next.js will directly read the JSON files from the file system.

## Front-end Architecture

- Components:
  - `HomePage`: Displays the list of top 10 items.
  - `DetailPage`: Displays the details of a single item.
  - `Layout`: Provides the basic layout for all pages, including the header, footer, and navigation.
  - `ThemeToggle`: Component for switching between light and dark mode.
  - `ShareArticle`: Component for sharing the article.
  - `Newsletter`: Newsletter subscription widget.
- Routing:
  - Use Next.js's file-based routing.
  - `pages/index.tsx` for the home page.
  - `pages/[id].tsx` for the detail pages.
- State Management:
  - Use React Context for managing the theme (light/dark mode).
  - Store the theme preference in local storage.

## Deployment Strategy

The Next.js application will be deployed to a static hosting provider Vercel

### CI/CD Integration

- Vercel:
  - Use Vercel's Cron Jobs feature to trigger a daily build and deployment.
  - Configure a `vercel.json` file with the cron job schedule.

## Tech Stack

- Next.js 15
- Tailwind CSS / shadcn/ui
- TypeScript
- Node.js
- Bun

## Architecture Diagram

```mermaid
graph LR
    A[Local Directory (Markdown Files)] --> B(Data Fetching (CI/CD Pipeline));
    B --> C{Data Transformation (remark/markdown-it)};
    C --> D[Data Storage (JSON Files)];
    D --> E(Next.js 15);
    E --> F[HomePage (Top 10 Items)];
    E --> G[DetailPage (Single Item)];
    E --> H[Layout];
    H --> I[ThemeToggle];
    H --> J[ShareArticle];
    H --> K[Newsletter];
    H --> L[Header];
    H --> M[Footer];
    I --> N[LocalStorage];
    E --> O(Vercel/Netlify/Railway);
```
