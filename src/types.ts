/**
 * Type definitions for report data structures
 */

// Report types
export type ReportType = 'list' | 'item' | 'ds' | 'solana'

// Source information
export interface Source {
  index: number // Index of the source (for citation references)
  url: string // URL of the source
}

// API metadata
export interface ApiMetadata {
  model: string // Model used for generation
  promptTokens: number // Number of tokens in the prompt
  completionTokens: number // Number of tokens in the completion
  totalTokens: number // Total number of tokens
  citationTokens: number // Number of tokens in citations
  numSearchQueries: number // Number of search queries
  reasoningTokens: number // Number of tokens in reasoning
}

// Agenda item structure
export interface AgendaItem {
  title: string // Title of the agenda item
  description: string // Description of the agenda item
  progress: number // Progress score (0-100)
  status: string // Current status
  impact: string // Why it matters
  sourceIndices: number[] // Indices of sources used for this item
}

// Update structure for Solana reports
export interface Update {
  title: string // Title of the update
  content: string // Content of the update
  sourceIndices: number[] // Indices of sources used for this update
}

// Base report interface with common fields
export interface BaseReport {
  id: string // Unique identifier for the report
  type: ReportType // Type of report
  timestamp: string // When the report was generated
  content: string // The full report content
  sources: Source[] // List of sources used
  apiMetadata: ApiMetadata // Metadata about the API call
}

// List report type
export interface ListReport extends BaseReport {
  type: 'list'
  agendaItems: AgendaItem[]
}

// Item report type
export interface ItemReport extends BaseReport {
  type: 'item'
  agendaItem: AgendaItem
}

// DeepSeek report type
export interface DeepSeekReport extends BaseReport {
  type: 'ds'
  topicSummary: string // Summary of the topic
  features: string[] // Key features extracted from the report
  impacts: string[] // Potential impacts extracted from the report
}

// Solana report type
export interface SolanaReport extends BaseReport {
  type: 'solana'
  updates: Update[] // Updates for Solana reports
}

// Union type for all report types
export type Report = ListReport | ItemReport | DeepSeekReport | SolanaReport

// Type guard functions to check report types
export function isListReport(report: Report): report is ListReport {
  return report.type === 'list'
}

export function isItemReport(report: Report): report is ItemReport {
  return report.type === 'item'
}

export function isDeepSeekReport(report: Report): report is DeepSeekReport {
  return report.type === 'ds'
}

export function isSolanaReport(report: Report): report is SolanaReport {
  return report.type === 'solana'
}
