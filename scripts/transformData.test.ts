import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import {
  transformMarkdownToJson,
  transformFile,
  getReportTypeFromFilename,
  TransformationError,
  ValidationError,
} from './transformData'
import * as schema from '../config/schema'

// Mock the fs module
vi.mock('fs', async () => {
  return {
    default: {
      readFileSync: vi.fn(),
      writeFileSync: vi.fn(),
      existsSync: vi.fn(),
      mkdirSync: vi.fn(),
    },
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  }
})

// Mock the winston logger to avoid actual logging during tests
vi.mock('winston', async () => {
  return {
    default: {
      format: {
        combine: vi.fn(),
        timestamp: vi.fn(),
        printf: vi.fn((callback: any) => callback),
      },
      createLogger: vi.fn(() => ({
        info: vi.fn(),
        error: vi.fn(),
      })),
      transports: {
        Console: vi.fn(),
        File: vi.fn(),
      },
    },
    format: {
      combine: vi.fn(),
      timestamp: vi.fn(),
      printf: vi.fn((callback: any) => callback),
    },
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
    })),
    transports: {
      Console: vi.fn(),
      File: vi.fn(),
    },
  }
})

describe('transformData', () => {
  // Mock fetch for AI calls
  global.fetch = vi.fn()

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()

    // Mock fs.existsSync to return true for 'logs' directory
    vi.mocked(fs.existsSync).mockImplementation((path: fs.PathLike) => path === 'logs')
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getReportTypeFromFilename', () => {
    it('should correctly identify list report type', () => {
      expect(getReportTypeFromFilename('list-04-13--02-30-PM.md')).toBe('list')
    })

    it('should correctly identify item report type', () => {
      expect(getReportTypeFromFilename('item-04-13--02-30-PM.md')).toBe('item')
    })

    it('should correctly identify ds report type', () => {
      expect(getReportTypeFromFilename('ds-04-13--02-30-PM.md')).toBe('ds')
    })

    it('should correctly identify solana report type', () => {
      expect(getReportTypeFromFilename('solana-04-13--02-30-PM.md')).toBe('solana')
    })

    it('should throw an error for unknown report type', () => {
      expect(() => getReportTypeFromFilename('unknown-04-13--02-30-PM.md')).toThrow(TransformationError)
    })
  })

  describe('transformMarkdownToJson', () => {
    // Test for list report
    it('should transform list report markdown to JSON', async () => {
      // Mock successful AI response for this test
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    title: 'Agenda Item Title',
                    description: 'Description of agenda item and key initiatives.',
                    progress: 75,
                    status: 'Current status and accomplishments.',
                    impact: 'Impact on rights, economy, environment, etc.',
                  },
                ]),
              },
            },
          ],
        }),
      }

      // Mock fetch implementation for this test
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as any)

      const listMarkdown = `
<think>
Some internal reasoning
</think>

# Tracking the Progress of Project 2025 Agenda Items

Introduction paragraph about Project 2025.

---

## **1. Agenda Item Title**

**Progress: 75/100**  
**What**: Description of agenda item and key initiatives.  
**Status**: Current status and accomplishments.  
**Why it matters**: Impact on rights, economy, environment, etc.  
**Sources**: [1] [2]

---

## **Conclusion**

Two-sentence summary with overall progress percentage.

---

[1] https://example.com/source1
[2] https://example.com/source2
      `

      const result = await transformMarkdownToJson(listMarkdown, 'list-04-13--02-30-PM.md')

      expect(result.type).toBe('list')
      expect((result as schema.ListReport).agendaItems).toHaveLength(1)
      expect((result as schema.ListReport).agendaItems[0].title).toBe('Agenda Item Title')
      expect((result as schema.ListReport).agendaItems[0].progress).toBe(75)
      expect(result.sources).toHaveLength(2)
      expect(result.sources[0].url).toBe('https://example.com/source1')
    })

    // Test for item report
    it('should transform item report markdown to JSON', async () => {
      const itemMarkdown = `
<think>
Some internal reasoning
</think>

# Agenda Item Title

Detailed description of the agenda item.

---

## Section Title

### Subsection Title

Detailed paragraph about this aspect of the agenda item with source citations [1].

---

## Conclusion

Summary paragraph about the agenda item's progress and implications.

---

[1] https://example.com/source1
      `

      const result = await transformMarkdownToJson(itemMarkdown, 'item-04-13--02-30-PM.md')

      expect(result.type).toBe('item')
      expect((result as schema.ItemReport).agendaItem.title).toBe('Agenda Item Title')
      expect(result.sources).toHaveLength(1)
      expect(result.sources[0].url).toBe('https://example.com/source1')
    })

    // Test for DeepSeek report
    it('should transform DeepSeek report markdown to JSON', async () => {
      const dsMarkdown = `
## Recent Developments in DeepSeek AI: A Paradigm Shift

---

Introduction paragraph about DeepSeek AI.

### Key Features of DeepSeek AI:

- Feature 1
- Feature 2
- Feature 3

### Potential Impact on Crypto and Beyond:

- Impact 1
- Impact 2

## **Sources**: [1] [2]

[1] https://example.com/source1
[2] https://example.com/source2
      `

      const result = await transformMarkdownToJson(dsMarkdown, 'ds-04-13--02-30-PM.md')

      expect(result.type).toBe('ds')
      expect((result as schema.DeepSeekReport).features).toContain('Feature 1')
      expect((result as schema.DeepSeekReport).impacts).toContain('Impact 1')
      expect(result.sources).toHaveLength(2)
    })

    // Test for Solana report
    it('should transform Solana report markdown to JSON', async () => {
      const solanaMarkdown = `
Here are five summaries of recent Solana news:

## Update 1: Title 1

Brief paragraph about this update with source citations [1].

## Update 2: Title 2

Brief paragraph about this update with source citations [2].

## **Sources**: [1] [2]

[1] https://example.com/source1
[2] https://example.com/source2
      `

      const result = await transformMarkdownToJson(solanaMarkdown, 'solana-04-13--02-30-PM.md')

      expect(result.type).toBe('solana')
      expect((result as schema.SolanaReport).updates).toHaveLength(2)
      expect((result as schema.SolanaReport).updates[0].title).toBe('Title 1')
      expect((result as schema.SolanaReport).updates[1].title).toBe('Title 2')
      expect(result.sources).toHaveLength(2)
    })

    // Test error handling
    it('should throw an error for empty content', async () => {
      await expect(transformMarkdownToJson('', 'list-04-13--02-30-PM.md')).rejects.toThrow(TransformationError)
    })

    it('should throw an error for unknown report type', async () => {
      await expect(transformMarkdownToJson('Some content', 'unknown-04-13--02-30-PM.md')).rejects.toThrow(TransformationError)
    })

    it('should handle malformed markdown gracefully', async () => {
      const malformedMarkdown = `
# Title without proper structure
Some content without proper sections
      `

      // This should not throw but might have empty or default values for some fields
      const result = await transformMarkdownToJson(malformedMarkdown, 'list-04-13--02-30-PM.md')
      expect(result.type).toBe('list')
      // Expect empty agenda items or default values
      expect((result as schema.ListReport).agendaItems).toHaveLength(0)
    })
  })
  describe('extractAgendaItems functionality', () => {
    it('should extract agenda items from list report content', async () => {
      // Mock successful AI response
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    title: 'Agenda Item 1',
                    description: 'Description of agenda item 1',
                    progress: 75,
                    status: 'In Progress',
                    impact: 'High impact on policy',
                  },
                  {
                    title: 'Agenda Item 2',
                    description: 'Description of agenda item 2',
                    progress: 25,
                    status: 'To Do',
                    impact: 'Medium impact on economy',
                  },
                ]),
              },
            },
          ],
        }),
      }

      // Mock fetch implementation
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as any)

      // Sample list report content with agenda items
      const listMarkdown = `
# Project 2025 Agenda Items

## Agenda Item 1
Progress on this item has been significant.

## Agenda Item 2
This item is just getting started.

## Sources
[1] https://example.com/policy1
[2] https://example.com/economy2
    `

      // Test through the public transformMarkdownToJson function
      const result = await transformMarkdownToJson(listMarkdown, 'list-04-13--02-30-PM.md')

      // Verify the results
      expect(result.type).toBe('list')
      expect((result as schema.ListReport).agendaItems).toHaveLength(2)
      expect((result as schema.ListReport).agendaItems[0].title).toBe('Agenda Item 1')
      expect((result as schema.ListReport).agendaItems[0].progress).toBe(75)
      expect((result as schema.ListReport).agendaItems[1].title).toBe('Agenda Item 2')
      expect((result as schema.ListReport).agendaItems[1].progress).toBe(25)
    })

    it('should handle AI analysis errors gracefully for list reports', async () => {
      // Mock failed AI response
      vi.mocked(global.fetch).mockRejectedValue(new Error('API error'))

      // Simple list report content
      const listMarkdown = `
# Project 2025 Agenda Items
Some content about agenda items.

## Sources
[1] https://example.com/source1
    `

      // Test through the public transformMarkdownToJson function
      const result = await transformMarkdownToJson(listMarkdown, 'list-04-13--02-30-PM.md')

      // Verify the results - should have empty agendaItems array on error
      expect(result.type).toBe('list')
      expect((result as schema.ListReport).agendaItems).toHaveLength(0)
    })
  })

  describe('transformFile', () => {
    it('should read a file, transform it, and optionally write the result', async () => {
      // Mock readFileSync to return a sample markdown
      vi.mocked(fs.readFileSync).mockReturnValue(`
# Sample Report
Content
---
[1] https://example.com/source1
      `)

      // Call transformFile
      const result = await transformFile('reports/list-04-13--02-30-PM.md', 'data/list-04-13--02-30-PM.json')

      // Verify readFileSync was called with the correct path
      expect(fs.readFileSync).toHaveBeenCalledWith('reports/list-04-13--02-30-PM.md', 'utf-8')

      // Verify writeFileSync was called with the correct path and content
      expect(fs.writeFileSync).toHaveBeenCalledWith('data/list-04-13--02-30-PM.json', expect.any(String))

      // Verify the result is a valid report object
      expect(result.type).toBe('list')
    })

    it('should handle errors when reading or transforming files', async () => {
      // Mock readFileSync to throw an error
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File not found')
      })

      // Call transformFile and expect it to throw
      await expect(transformFile('nonexistent.md')).rejects.toThrow()
    })
  })
})
