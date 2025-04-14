import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import { main } from './createIndexFile'

// Mock fs module
vi.mock('node:fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}))

// Mock winston logger
vi.mock('winston', () => ({
  format: {
    combine: vi.fn(),
    timestamp: vi.fn(),
    printf: vi.fn((callback) => callback),
  },
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
  })),
  transports: {
    Console: vi.fn(),
    File: vi.fn(),
  },
}))

describe('createIndexFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should create an index file with all valid JSON files', async () => {
    // Mock readdir to return a list of files
    vi.mocked(fs.readdir).mockResolvedValue([
      'item-1.json',
      'item-2.json',
      'list-1.json',
      'ds-1.json',
      'solana-1.json',
      'index.json', // This should be ignored
      'invalid.json', // This will be invalid
    ] as any)

    // Mock readFile to return valid JSON for each file
    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      const pathStr = String(path)
      if (pathStr.includes('item-1')) {
        return JSON.stringify({
          id: 'item-1',
          type: 'item',
          timestamp: '2025-04-13T13:14:57.000Z',
          content: 'Item 1 content',
          sources: [],
          apiMetadata: {
            model: 'test',
            promptTokens: 100,
            completionTokens: 200,
            totalTokens: 300,
            citationTokens: 0,
            numSearchQueries: 0,
            reasoningTokens: 0,
          },
          agendaItem: {
            title: 'Item 1 Title',
            description: 'Item 1 Description',
            progress: 50,
            status: 'In Progress',
            impact: 'Medium',
            sourceIndices: [],
          },
        })
      } else if (pathStr.includes('item-2')) {
        return JSON.stringify({
          id: 'item-2',
          type: 'item',
          timestamp: '2025-04-13T13:17:28.000Z',
          content: 'Item 2 content',
          sources: [],
          apiMetadata: {
            model: 'test',
            promptTokens: 100,
            completionTokens: 200,
            totalTokens: 300,
            citationTokens: 0,
            numSearchQueries: 0,
            reasoningTokens: 0,
          },
          agendaItem: {
            title: 'Item 2 Title',
            description: 'Item 2 Description',
            progress: 75,
            status: 'In Progress',
            impact: 'High',
            sourceIndices: [],
          },
        })
      } else if (pathStr.includes('list-1')) {
        return JSON.stringify({
          id: 'list-1',
          type: 'list',
          timestamp: '2025-04-13T13:12:45.000Z',
          content: 'List content',
          sources: [],
          apiMetadata: {
            model: 'test',
            promptTokens: 100,
            completionTokens: 200,
            totalTokens: 300,
            citationTokens: 0,
            numSearchQueries: 0,
            reasoningTokens: 0,
          },
          agendaItems: [
            {
              title: 'Agenda Item 1',
              description: 'Agenda Item 1 Description',
              progress: 50,
              status: 'In Progress',
              impact: 'Medium',
              sourceIndices: [],
            },
          ],
        })
      } else if (pathStr.includes('ds-1')) {
        return JSON.stringify({
          id: 'ds-1',
          type: 'ds',
          timestamp: '2025-04-13T13:28:36.000Z',
          content: 'DeepSeek content',
          sources: [],
          apiMetadata: {
            model: 'test',
            promptTokens: 100,
            completionTokens: 200,
            totalTokens: 300,
            citationTokens: 0,
            numSearchQueries: 0,
            reasoningTokens: 0,
          },
          topicSummary: 'Topic Summary',
          features: ['Feature 1', 'Feature 2'],
          impacts: ['Impact 1', 'Impact 2'],
        })
      } else if (pathStr.includes('solana-1')) {
        return JSON.stringify({
          id: 'solana-1',
          type: 'solana',
          timestamp: '2025-04-13T13:28:42.000Z',
          content: 'Solana content',
          sources: [],
          apiMetadata: {
            model: 'test',
            promptTokens: 100,
            completionTokens: 200,
            totalTokens: 300,
            citationTokens: 0,
            numSearchQueries: 0,
            reasoningTokens: 0,
          },
          updates: [
            {
              title: 'Update 1',
              content: 'Update 1 Content',
              sourceIndices: [],
            },
          ],
        })
      } else if (pathStr.includes('invalid')) {
        return 'Invalid JSON'
      }
      return '{}'
    })

    // Call the main function
    await main()

    // Verify that writeFile was called with the correct arguments
    expect(fs.writeFile).toHaveBeenCalledTimes(1)

    // Get the arguments passed to writeFile
    const [filePath, content] = vi.mocked(fs.writeFile).mock.calls[0]

    // Verify the file path
    expect(filePath).toContain('index.json')

    // Parse the content and verify it
    const indexData = JSON.parse(content as string)

    // Verify the structure
    expect(indexData).toHaveProperty('items')
    expect(Array.isArray(indexData.items)).toBe(true)
    expect(indexData.items.length).toBe(5) // 5 valid files

    // Verify the items are sorted by timestamp (newest first)
    expect(indexData.items[0].id).toBe('solana-1')
    expect(indexData.items[1].id).toBe('ds-1')
    expect(indexData.items[2].id).toBe('item-2')
    expect(indexData.items[3].id).toBe('item-1')
    expect(indexData.items[4].id).toBe('list-1')

    // Verify the item properties
    const item = indexData.items.find((i: any) => i.id === 'item-1')
    expect(item).toHaveProperty('id', 'item-1')
    expect(item).toHaveProperty('type', 'item')
    expect(item).toHaveProperty('timestamp', '2025-04-13T13:14:57.000Z')
    expect(item).toHaveProperty('title', 'Item 1 Title')
    expect(item).toHaveProperty('path', 'item-1.json')
  })

  it('should handle errors gracefully', async () => {
    // Mock readdir to throw an error
    vi.mocked(fs.readdir).mockRejectedValue(new Error('Directory not found'))

    // Call the main function and expect it to exit with code 1
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process.exit(${code})`)
    })

    await expect(main()).rejects.toThrow('Process.exit(1)')

    // Restore the mock
    mockExit.mockRestore()
  })
})
