import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
import type { Root, Heading, Paragraph, List, ListItem, Text, Code, HTML } from 'mdast'
import matter from 'gray-matter'
import winston from 'winston'
import * as types from '../src/types'

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`
    })
  ),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'logs/transform.log' })],
})

// Ensure logs directory exists
import fs from 'fs'
import path from 'path'
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs')
}

// Validation function
/**
 * Validates a report object against the expected structure
 * @param data The report object to validate
 * @returns The validated report object
 * @throws ValidationError if the report is invalid
 */
function validateReport(data: unknown): types.Report {
  // Basic type checking
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Report must be an object')
  }

  const report = data as types.Report

  // Check required fields
  if (!report.id || typeof report.id !== 'string') {
    throw new ValidationError('Report must have a valid id')
  }

  if (!report.type || !['list', 'item', 'ds', 'solana'].includes(report.type)) {
    throw new ValidationError('Report must have a valid type')
  }

  if (!report.timestamp || typeof report.timestamp !== 'string') {
    throw new ValidationError('Report must have a valid timestamp')
  }

  if (!report.content || typeof report.content !== 'string') {
    throw new ValidationError('Report must have valid content')
  }

  if (!Array.isArray(report.sources)) {
    throw new ValidationError('Report must have a sources array')
  }

  if (!report.apiMetadata || typeof report.apiMetadata !== 'object') {
    throw new ValidationError('Report must have valid apiMetadata')
  }

  // Type-specific validation
  switch (report.type) {
    case 'list':
      if (!Array.isArray((report as types.ListReport).agendaItems)) {
        throw new ValidationError('List report must have agendaItems array')
      }
      // Note: We allow empty agendaItems arrays for malformed markdown handling
      break

    case 'item':
      if (!(report as types.ItemReport).agendaItem || typeof (report as types.ItemReport).agendaItem !== 'object') {
        throw new ValidationError('Item report must have an agendaItem object')
      }
      break

    case 'ds':
      if (typeof (report as types.DeepSeekReport).topicSummary !== 'string') {
        throw new ValidationError('DeepSeek report must have a topicSummary')
      }
      break

    case 'solana':
      if (!Array.isArray((report as types.SolanaReport).updates) || (report as types.SolanaReport).updates.length === 0) {
        throw new ValidationError('Solana report must have updates array')
      }
      break

    default:
      throw new ValidationError(`Unknown report type: ${(report as any).type}`)
  }

  return report
}

// Error types
export class TransformationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TransformationError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Extracts the report type from the filename
 * @param filename The filename of the report
 * @returns The report type ('list', 'item', 'ds', or 'solana')
 */
export function getReportTypeFromFilename(filename: string): types.Report['type'] {
  if (filename.startsWith('list-')) return 'list'
  if (filename.startsWith('item-')) return 'item'
  if (filename.startsWith('ds-')) return 'ds'
  if (filename.startsWith('solana-')) return 'solana'
  throw new TransformationError(`Unknown report type in filename: ${filename}`)
}

/**
 * Extracts sources from the markdown content
 * @param content The markdown content
 * @returns Array of Source objects
 */
function extractSources(content: string): types.Source[] {
  const sources: types.Source[] = []
  const sourceRegex = /\[(\d+)\]\s*(https?:\/\/[^\s\n]+?)(?=\n|$)/g

  let match
  while ((match = sourceRegex.exec(content)) !== null) {
    const index = parseInt(match[1], 10)
    const url = match[2].trim()
    sources.push({ index, url })
  }

  return sources
}

/**
 * Extracts agenda items from list report content
 * @param content The markdown content
 * @param sources The extracted sources
 * @returns Array of AgendaItem objects
 */
function extractAgendaItems(content: string, sources: types.Source[]): types.AgendaItem[] {
  const agendaItems: types.AgendaItem[] = []
  const agendaItemRegex =
    /## \*\*\d+\. (.+?)\*\*\n\n\*\*Progress: (\d+)\/100\*\*\s+\n\*\*What\*\*: (.+?)\s+\n\*\*Status\*\*: (.+?)\s+\n\*\*Why it matters\*\*: (.+?)\s+\n\*\*Sources\*\*: (.+?)(?=\n\n---|\n*$)/gs

  let match
  while ((match = agendaItemRegex.exec(content)) !== null) {
    const title = match[1].trim()
    const progress = parseInt(match[2], 10)
    const description = match[3].trim()
    const status = match[4].trim()
    const impact = match[5].trim()

    // Extract source indices from the sources text
    const sourcesText = match[6].trim()
    const sourceIndices = sourcesText.match(/\[(\d+)\]/g)?.map((s) => parseInt(s.slice(1, -1), 10)) || []

    agendaItems.push({
      title,
      description,
      progress,
      status,
      impact,
      sourceIndices,
    })
  }

  return agendaItems
}

/**
 * Extracts a single agenda item from item report content
 * @param content The markdown content
 * @param sources The extracted sources
 * @returns AgendaItem object
 */
function extractAgendaItem(content: string, sources: types.Source[]): types.AgendaItem {
  // Extract title from the first heading
  const titleMatch = content.match(/# (.+?)(?=\n)/)
  if (!titleMatch) throw new TransformationError('Could not extract title from item report')
  const title = titleMatch[1].trim()

  // Extract description from the first paragraph
  const descriptionMatch = content.match(/# .+?\n\n(.+?)(?=\n\n---|\n*$)/s)
  if (!descriptionMatch) throw new TransformationError('Could not extract description from item report')
  const description = descriptionMatch[1].trim()

  // Extract status from the content (this is more complex and might need refinement)
  const statusMatch = content.match(/## (?:Status|Progress).*?\n\n(.+?)(?=\n\n##|\n*$)/s)
  const status = statusMatch ? statusMatch[1].trim() : 'Status not explicitly stated'

  // Extract impact from the conclusion
  const impactMatch = content.match(/## Conclusion\n\n(.+?)(?=\n\n---|\n*$)/s)
  const impact = impactMatch ? impactMatch[1].trim() : 'Impact not explicitly stated'

  // Determine progress (this is a heuristic and might need refinement)
  let progress = 0
  const progressMatch = content.match(/Progress:?\s*(\d+)%/i) || content.match(/(\d+)%\s*complete/i)
  if (progressMatch) {
    progress = parseInt(progressMatch[1], 10)
  }

  // Extract source indices (all sources are potentially relevant)
  const sourceIndices = sources.map((s) => s.index)

  return {
    title,
    description,
    progress,
    status,
    impact,
    sourceIndices,
  }
}

/**
 * Extracts updates from Solana report content
 * @param content The markdown content
 * @param sources The extracted sources
 * @returns Array of Update objects
 */
function extractUpdates(content: string, sources: types.Source[]): types.Update[] {
  const updates: types.Update[] = []
  const updateRegex = /## Update \d+: (.+?)\n\n(.+?)(?=\n\n## Update|\n\n## \*\*Sources|\n*$)/gs

  let match
  while ((match = updateRegex.exec(content)) !== null) {
    const title = match[1].trim()
    const updateContent = match[2].trim()

    // Extract source indices from the update content
    const sourceIndices: number[] = []
    const sourceRefRegex = /\[(\d+)\]/g
    let sourceMatch
    while ((sourceMatch = sourceRefRegex.exec(updateContent)) !== null) {
      sourceIndices.push(parseInt(sourceMatch[1], 10))
    }

    updates.push({
      title,
      content: updateContent,
      sourceIndices,
    })
  }

  return updates
}

/**
 * Extracts features and impacts from DeepSeek report content
 * @param content The markdown content
 * @returns Object with features and impacts arrays
 */
function extractDeepSeekInfo(content: string): { features: string[]; impacts: string[] } {
  const features: string[] = []
  const impacts: string[] = []

  // Extract features
  const featuresMatch = content.match(/### Key Features of DeepSeek AI:.*?-(.*?)(?=###|$)/s)
  if (featuresMatch) {
    const featuresText = featuresMatch[1].trim()
    const featureItems = featuresText.split(/\n-\s*/)
    features.push(...featureItems.filter((f) => f.trim().length > 0).map((f) => f.trim()))
  }

  // Extract impacts
  const impactsMatch = content.match(/### Potential Impact.*?-(.*?)(?=##|$)/s)
  if (impactsMatch) {
    const impactsText = impactsMatch[1].trim()
    const impactItems = impactsText.split(/\n-\s*/)
    impacts.push(...impactItems.filter((i) => i.trim().length > 0).map((i) => i.trim()))
  }

  return { features, impacts }
}

/**
 * Transforms markdown content to a structured JSON object
 * @param content The markdown content
 * @param filename The filename of the report (used to determine the report type)
 * @returns A validated Report object
 */
export async function transformMarkdownToJson(content: string, filename: string): Promise<types.Report> {
  logger.info(`Starting transformation of ${filename}`)

  try {
    // Input validation
    if (!content || content.trim().length === 0) {
      throw new TransformationError('Empty or invalid markdown content')
    }

    // Extract report type from filename
    const reportType = getReportTypeFromFilename(filename)
    logger.info(`Detected report type: ${reportType}`)

    // Extract metadata using gray-matter
    const { data: frontmatter, content: mainContent } = matter(content)
    logger.info(`Extracted frontmatter: ${JSON.stringify(frontmatter)}`)

    // Remove <think> tags and their content
    const cleanedContent = mainContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

    // Extract sources
    const sources = extractSources(cleanedContent)
    logger.info(`Extracted ${sources.length} sources`)

    // Generate a unique ID for the report
    const id = `${reportType}-${Date.now()}`
    const timestamp = new Date().toISOString()

    // Create base report object
    const baseReport = {
      id,
      timestamp,
      content: cleanedContent,
      sources,
      apiMetadata: {
        model: frontmatter.model || 'unknown',
        promptTokens: frontmatter.promptTokens || 0,
        completionTokens: frontmatter.completionTokens || 0,
        totalTokens: frontmatter.totalTokens || 0,
        citationTokens: frontmatter.citationTokens || 0,
        numSearchQueries: frontmatter.numSearchQueries || 0,
        reasoningTokens: frontmatter.reasoningTokens || 0,
      },
    }

    // Create specific report object based on type
    let report: types.Report

    switch (reportType) {
      case 'list':
        const agendaItems = extractAgendaItems(cleanedContent, sources)
        logger.info(`Extracted ${agendaItems.length} agenda items for list report`)
        report = {
          ...baseReport,
          type: 'list',
          agendaItems,
        }
        break

      case 'item':
        const agendaItem = extractAgendaItem(cleanedContent, sources)
        logger.info(`Extracted agenda item: ${agendaItem.title}`)
        report = {
          ...baseReport,
          type: 'item',
          agendaItem,
        }
        break

      case 'ds':
        const { features, impacts } = extractDeepSeekInfo(cleanedContent)
        logger.info(`Extracted ${features.length} features and ${impacts.length} impacts for DeepSeek report`)

        // Store the extracted features and impacts in the content field
        const enhancedContent = `${cleanedContent}\n\n## Features\n${features.join('\n')}\n\n## Impacts\n${impacts.join('\n')}`

        report = {
          ...baseReport,
          content: enhancedContent, // Override with enhanced content
          type: 'ds',
          topicSummary: cleanedContent.split('\n\n')[0] || '',
          features,
          impacts,
        }
        break

      case 'solana':
        const updates = extractUpdates(cleanedContent, sources)
        logger.info(`Extracted ${updates.length} updates for Solana report`)
        report = {
          ...baseReport,
          type: 'solana',
          updates,
        }
        break

      default:
        throw new TransformationError(`Unsupported report type: ${reportType}`)
    }

    // Validate the report structure
    try {
      validateReport(report)
      logger.info(`Successfully validated ${reportType} report`)
    } catch (error) {
      logger.error(`Validation error: ${error instanceof Error ? error.message : String(error)}`)
      throw new ValidationError(
        `Failed to validate ${reportType} report: ${error instanceof Error ? error.message : String(error)}`
      )
    }

    return report
  } catch (error) {
    if (error instanceof TransformationError || error instanceof ValidationError) {
      throw error
    }
    logger.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
    throw new TransformationError(`Failed to transform markdown: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Main function to transform a markdown file to JSON
 * @param inputPath Path to the markdown file
 * @param outputPath Path to save the JSON output (optional)
 * @returns The transformed JSON object
 */
export async function transformFile(inputPath: string, outputPath?: string): Promise<types.Report> {
  try {
    logger.info(`Transforming file: ${inputPath}`)

    // Read the markdown file
    const content = fs.readFileSync(inputPath, 'utf-8')
    const filename = path.basename(inputPath)

    // Transform the content
    const result = await transformMarkdownToJson(content, filename)

    // Save the result to a JSON file if outputPath is provided
    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
      logger.info(`Saved JSON output to: ${outputPath}`)
    }

    return result
  } catch (error) {
    logger.error(`Failed to transform file: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.error('Usage: node transformData.js <inputPath> [outputPath]')
    process.exit(1)
  }

  const inputPath = args[0]
  const outputPath = args[1]

  transformFile(inputPath, outputPath)
    .then((result) => {
      console.log('Transformation successful')
      if (!outputPath) {
        console.log(JSON.stringify(result, null, 2))
      }
    })
    .catch((error) => {
      console.error('Transformation failed:', error.message)
      process.exit(1)
    })
}
