import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as winston from 'winston'
import { validateReport } from '../config/schema'

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
      filename: path.join('logs', `index-creation-${new Date().toISOString().replace(/:/g, '-')}.log`),
    }),
  ],
})

// Configuration
const config = {
  dataDir: './data',
  indexFile: './data/index.json',
}

interface IndexItem {
  id: string
  type: string
  timestamp: string
  title?: string
  path: string
}

/**
 * Main function to create an index file
 */
async function main(): Promise<void> {
  logger.info('Starting index file creation process')

  try {
    // Get all JSON files from data directory
    const files = await fs.readdir(config.dataDir)
    const jsonFiles = files.filter((file) => file.endsWith('.json') && file !== 'index.json')

    // Create index items
    const indexItems: IndexItem[] = []

    for (const file of jsonFiles) {
      const filePath = path.join(config.dataDir, file)

      try {
        // Read and parse the JSON file
        const content = await fs.readFile(filePath, 'utf-8')
        const data = JSON.parse(content)

        // Validate the report
        const report = validateReport(data)

        // Create index item
        const indexItem: IndexItem = {
          id: report.id,
          type: report.type,
          timestamp: report.timestamp,
          path: file,
        }

        // Add title if available
        if (report.type === 'item' && report.agendaItem) {
          indexItem.title = report.agendaItem.title
        } else if (report.type === 'list' && report.agendaItems && report.agendaItems.length > 0) {
          indexItem.title = 'List Report'
        } else if (report.type === 'ds') {
          indexItem.title = 'DeepSeek Report'
        } else if (report.type === 'solana') {
          indexItem.title = 'Solana Report'
        }

        indexItems.push(indexItem)
      } catch (error) {
        logger.error(`Error processing file ${file}: ${error}`)
        // Continue with the next file
      }
    }

    // Sort index items by timestamp (newest first)
    indexItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Write index file
    await fs.writeFile(config.indexFile, JSON.stringify({ items: indexItems }, null, 2))

    logger.info(`Index file created successfully with ${indexItems.length} items`)
  } catch (error) {
    logger.error(`Index file creation process failed: ${error}`)
    console.error('Index file creation process failed. See logs for details.')
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

// Export for testing
export { main }
