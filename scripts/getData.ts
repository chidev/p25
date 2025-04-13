import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as winston from 'winston'
import * as crypto from 'node:crypto'
import { getData } from '../src/getData'
import { list } from '../src/prompts/key-list'
import { getItemPrompt } from '../src/prompts/item-breakdown'
import { ds } from '../src/prompts/deepseek'
import { solana } from '../src/prompts/solana'

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join('logs', `data-fetching-${new Date().toISOString().replace(/:/g, '-')}.log`),
    }),
  ],
})

// Configuration
const config = {
  reportsDir: './reports',
  dataDir: './data',
  archivesDir: './archives',
  logsDir: './logs',
  firstRunFlag: './.first_run',
}

/**
 * Ensures that a directory exists, creating it if it doesn't
 * @param dirPath Path to the directory
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath)
    logger.info(`Directory ${dirPath} exists`)
  } catch (error) {
    logger.info(`Creating directory ${dirPath}`)
    await fs.mkdir(dirPath, { recursive: true })
  }
}

/**
 * Empties a directory by removing all files and subdirectories
 * @param dirPath Path to the directory
 */
async function emptyDirectory(dirPath: string): Promise<void> {
  logger.info(`Emptying directory ${dirPath}`)
  try {
    const files = await fs.readdir(dirPath)
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      await fs.rm(filePath, { recursive: true, force: true })
    }
    logger.info(`Directory ${dirPath} emptied successfully`)
  } catch (error) {
    logger.error(`Error emptying directory ${dirPath}: ${error}`)
    throw error
  }
}

/**
 * Archives the data directory
 */
async function archiveData(): Promise<void> {
  try {
    await ensureDirectoryExists(config.archivesDir)

    const date = new Date().toISOString().split('T')[0]
    const archivePath = path.join(config.archivesDir, `${date}.json`)

    logger.info(`Archiving data to ${archivePath}`)

    // Read all files in the data directory
    const files = await fs.readdir(config.dataDir)
    const dataFiles = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(config.dataDir, file)
        const content = await fs.readFile(filePath, 'utf-8')
        return { name: file, content }
      })
    )

    // Create archive
    await fs.writeFile(
      archivePath,
      JSON.stringify(
        {
          archivedAt: new Date().toISOString(),
          files: dataFiles,
        },
        null,
        2
      )
    )

    logger.info(`Data archived successfully to ${archivePath}`)
  } catch (error) {
    logger.error(`Error archiving data: ${error}`)
    throw error
  }
}

/**
 * Writes a report to the reports directory
 * @param data The data to write
 * @param name The name of the report
 */
async function writeReport(data: { report: string; response: any } | void, name: string): Promise<void> {
  if (!data) {
    logger.error(`No data provided for report ${name}`)
    return
  }

  try {
    const { report, response } = data

    const date = new Date()
      .toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
      .replace(/[/, ]/g, '-')
      .replace(/:/g, '-')

    const reportPath = path.join(config.reportsDir, `${name}-${date}.md`)
    const debugPath = path.join(config.reportsDir, `debug-${name}-${date}.json`)

    await fs.writeFile(reportPath, report)
    await fs.writeFile(debugPath, JSON.stringify(response, null, 2))

    logger.info(`Report written to ${reportPath}`)
    logger.info(`Debug info written to ${debugPath}`)
  } catch (error) {
    logger.error(`Error writing report ${name}: ${error}`)
    throw error
  }
}

/**
 * Fetches the list of items
 */
async function getList(): Promise<void> {
  logger.info('Starting report for all agenda items...')

  try {
    const data = await getData()
    await writeReport(data, 'list')
    logger.info('List report completed successfully')
  } catch (error) {
    logger.error(`Error getting list: ${error}`)
    throw error
  }
}

/**
 * Fetches a specific item
 * @param i The index of the item to fetch
 */
async function getItem(i: number): Promise<void> {
  const item = list[i]

  logger.info(`Starting report for ${item}...`)

  try {
    const data = await getData({ item })
    await writeReport(data, `item-${i}`)
    logger.info(`Item ${i} (${item}) report completed successfully`)
  } catch (error) {
    logger.error(`Error getting item ${i} (${item}): ${error}`)
    throw error
  }
}

/**
 * Fetches a specific topic
 * @param topic The topic to fetch
 */
async function getTopic(topic: string): Promise<void> {
  logger.info(`Starting report for topic ${topic}...`)

  try {
    let prompt
    switch (topic) {
      case 'ds':
        prompt = ds
        break
      case 'solana':
        prompt = solana
        break
      default:
        logger.error(`Invalid topic: ${topic}`)
        throw new Error(`Invalid topic: ${topic}`)
    }

    const data = await getData({ prompt })
    await writeReport(data, topic)
    logger.info(`Topic ${topic} report completed successfully`)
  } catch (error) {
    logger.error(`Error getting topic ${topic}: ${error}`)
    throw error
  }
}

/**
 * Main function to run the data fetching process
 */
async function main(): Promise<void> {
  logger.info('Starting data fetching process')
  const startTime = Date.now()

  try {
    // Ensure directories exist
    await ensureDirectoryExists(config.reportsDir)
    await ensureDirectoryExists(config.dataDir)
    await ensureDirectoryExists(config.logsDir)

    // Empty the reports directory
    await emptyDirectory(config.reportsDir)

    // Archive data directory
    await archiveData()

    // Get the list
    await getList()

    // Get the first 10 items
    const itemCount = Math.min(10, list.length)
    logger.info(`Fetching ${itemCount} items`)

    for (let i = 0; i < itemCount; i++) {
      await getItem(i)
    }

    // Get specific topics
    await getTopic('ds')
    await getTopic('solana')

    const endTime = Date.now()
    logger.info(`Data fetching process completed successfully in ${(endTime - startTime) / 1000} seconds`)
    console.log(`Data fetching process completed successfully in ${(endTime - startTime) / 1000} seconds`)
  } catch (error) {
    logger.error(`Data fetching process failed: ${error}`)
    console.error('Data fetching process failed. See logs for details.')
    process.exit(1)
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error(`Unhandled error in main function: ${error}`)
    console.error('Unhandled error in main function. See logs for details.')
    process.exit(1)
  })
}

// Export functions for testing
export { main, getList, getItem, getTopic, writeReport, ensureDirectoryExists, emptyDirectory, archiveData }
