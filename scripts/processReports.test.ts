import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'path'
import { main } from './processReports'
import { transformFile } from './transformData'

// Mock fs module
vi.mock('node:fs/promises', () => ({
  readdir: vi.fn(),
  writeFile: vi.fn(() => Promise.resolve()),
}))

// Mock transformFile function
vi.mock('./transformData', () => ({
  transformFile: vi.fn(() =>
    Promise.resolve({
      id: 'test-id',
      type: 'list',
      timestamp: new Date().toISOString(),
      content: 'Test content',
      sources: [],
      apiMetadata: {
        model: 'test-model',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        citationTokens: 0,
        numSearchQueries: 0,
        reasoningTokens: 0,
      },
    })
  ),
}))

// Mock winston logger
// Mock winston logger
vi.mock('winston', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
  }
  return {
    default: {
      format: {
        combine: vi.fn(),
        timestamp: vi.fn(),
        printf: vi.fn(),
      },
      transports: {
        Console: vi.fn(),
        File: vi.fn(),
      },
      createLogger: vi.fn(() => mockLogger),
    },
    format: {
      combine: vi.fn(),
      timestamp: vi.fn(),
      printf: vi.fn(),
    },
    transports: {
      Console: vi.fn(),
      File: vi.fn(),
    },
    createLogger: vi.fn(() => mockLogger),
  }
})

describe('processReports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up default mock implementation for readdir
    vi.mocked(fs.readdir).mockResolvedValue(['test-list-04-13.md', 'test-item-0-04-13.md'] as any)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('processes all markdown files in reports directory', async () => {
    await main()

    // Check if readdir was called to get markdown files
    expect(vi.mocked(fs.readdir)).toHaveBeenCalled()

    // Check if transformFile was called for each markdown file
    expect(vi.mocked(transformFile)).toHaveBeenCalledTimes(2)
  })

  it('handles errors gracefully', async () => {
    // Mock readdir to throw an error
    vi.mocked(fs.readdir).mockRejectedValueOnce(new Error('Failed to read directory'))

    // Mock console.error to prevent actual console output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock process.exit to prevent actual exit
    const exitMock = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)

    await main()

    // Check if error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Data transformation process failed. See logs for details.')

    // Check if process.exit was called with status code 1
    expect(exitMock).toHaveBeenCalledWith(1)

    // Restore console.error
    consoleErrorSpy.mockRestore()
  })

  it('filters for only markdown files', async () => {
    // Mock readdir to return mix of file types
    vi.mocked(fs.readdir).mockResolvedValueOnce(['test-list-04-13.md', 'test-item-0-04-13.md', 'test.json', 'test.txt'] as any)

    await main()

    // Check if transformFile was only called for markdown files
    expect(vi.mocked(transformFile)).toHaveBeenCalledTimes(2)
  })

  it('transforms files with correct paths', async () => {
    await main()

    // Check if transformFile was called with correct input and output paths
    expect(vi.mocked(transformFile)).toHaveBeenCalledWith(
      path.join('./reports', 'test-list-04-13.md'),
      path.join('./data', 'test-list-04-13.json')
    )
    expect(vi.mocked(transformFile)).toHaveBeenCalledWith(
      path.join('./reports', 'test-item-0-04-13.md'),
      path.join('./data', 'test-item-0-04-13.json')
    )
  })
})
