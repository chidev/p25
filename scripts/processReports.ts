import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as winston from 'winston'
import { transformFile } from './transformData'

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
      filename: path.join('logs', `data-transformation-${new Date().toISOString().replace(/:/g, '-')}.log`),
    }),
  ],
})

// Configuration
const config = {
  reportsDir: './reports',
  dataDir: './data',
}

/**
 * Main function to process markdown reports into JSON
 */
async function main(): Promise<void> {
  logger.info('Starting data transformation process')

  try {
    // Get all markdown files from reports directory
    const files = await fs.readdir(config.reportsDir)
    const mdFiles = files.filter((file) => file.endsWith('.md'))

    // Transform each markdown file
    for (const file of mdFiles) {
      const inputPath = path.join(config.reportsDir, file)
      const outputPath = path.join(config.dataDir, file.replace('.md', '.json'))

      await transformFile(inputPath, outputPath)
      logger.info(`Transformed ${file} to JSON successfully`)
    }

    logger.info('Data transformation process completed successfully')
  } catch (error) {
    logger.error(`Data transformation process failed: ${error}`)
    console.error('Data transformation process failed. See logs for details.')
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
