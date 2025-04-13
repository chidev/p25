import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { main, getList, getItem, getTopic, writeReport, ensureDirectoryExists, emptyDirectory, archiveData } from './getData'
import { main as processReports } from './processReports'

// Mock fs module
vi.mock('node:fs/promises', () => ({
  access: vi.fn(() => Promise.resolve()),
  mkdir: vi.fn(() => Promise.resolve()),
  readdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(() => Promise.resolve()),
  rm: vi.fn(() => Promise.resolve()),
}))

// Mock getData function
vi.mock('../src/getData', () => ({
  getData: vi.fn(() =>
    Promise.resolve({
      report: 'Test report content',
      response: { choices: [{ message: { content: 'Test content' } }], citations: [] },
    })
  ),
}))

// Mock list from key-list
vi.mock('../src/prompts/key-list', () => ({
  list: ['Item 1', 'Item 2', 'Item 3'],
  body: { messages: [] },
}))

// Mock getItemPrompt
vi.mock('../src/prompts/item-breakdown', () => ({
  getItemPrompt: vi.fn((item: string) => ({ messages: [{ content: `Item prompt for ${item}` }] })),
}))

// Mock ds and solana prompts
vi.mock('../src/prompts/deepseek', () => ({
  ds: { messages: [{ content: 'DeepSeek prompt' }] },
}))

vi.mock('../src/prompts/solana', () => ({
  solana: { messages: [{ content: 'Solana prompt' }] },
}))

// Mock processReports
vi.mock('./processReports', () => ({
  main: vi.fn(() => Promise.resolve()),
}))

describe('getData script', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Set up default mock implementations
    vi.mocked(fs.readdir).mockImplementation((path) => {
      const pathStr = String(path)
      if (pathStr.includes('data')) {
        return Promise.resolve(['file1.json', 'file2.json'] as any)
      }
      return Promise.resolve(['report1.md', 'report2.md'] as any)
    })

    vi.mocked(fs.readFile).mockImplementation((path) => {
      const pathStr = String(path)
      if (pathStr.includes('file1.json')) {
        return Promise.resolve('{"content": "Content of file1"}')
      }
      if (pathStr.includes('file2.json')) {
        return Promise.resolve('{"content": "Content of file2"}')
      }
      return Promise.resolve('')
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('ensureDirectoryExists creates directory if it does not exist', async () => {
    // Mock fs.access to throw an error (directory doesn't exist)
    vi.mocked(fs.access).mockRejectedValueOnce(new Error('Directory does not exist'))

    await ensureDirectoryExists('test-dir')

    // Check if mkdir was called
    expect(vi.mocked(fs.mkdir)).toHaveBeenCalledWith('test-dir', { recursive: true })
  })

  it('ensureDirectoryExists does not create directory if it exists', async () => {
    // Mock fs.access to resolve (directory exists)
    vi.mocked(fs.access).mockResolvedValueOnce(undefined)

    await ensureDirectoryExists('test-dir')

    // Check if mkdir was not called
    expect(vi.mocked(fs.mkdir)).not.toHaveBeenCalled()
  })

  it('emptyDirectory removes files in the directory', async () => {
    await emptyDirectory('test-dir')

    // Check if rm was called for each file
    expect(vi.mocked(fs.rm)).toHaveBeenCalledTimes(2)
  })

  it('archiveData archives the data directory', async () => {
    await archiveData()

    // Check if writeFile was called with the correct archive data
    const writeFileCalls = vi.mocked(fs.writeFile).mock.calls
    expect(writeFileCalls.length).toBe(1)
    expect(writeFileCalls[0][0]).toContain('archives/')

    const archivedContent = JSON.parse(writeFileCalls[0][1] as string)
    expect(archivedContent).toHaveProperty('archivedAt')
    expect(archivedContent.files).toEqual([
      { name: 'file1.json', content: '{"content": "Content of file1"}' },
      { name: 'file2.json', content: '{"content": "Content of file2"}' },
    ])
  })

  it('writeReport writes report and debug files', async () => {
    const data = {
      report: 'Test report',
      response: { test: 'data' },
    }

    await writeReport(data, 'test-report')

    // Check if writeFile was called twice (for report and debug)
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledTimes(2)
  })

  it('getList fetches and writes the list report without transformation', async () => {
    await getList()

    // Check if writeReport was called
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalled()
  })

  it('getItem fetches and writes an item report without transformation', async () => {
    await getItem(0)

    // Check if writeReport was called
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalled()
  })

  it('getTopic fetches and writes a topic report without transformation', async () => {
    await getTopic('ds')

    // Check if writeReport was called
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalled()
  })
})
