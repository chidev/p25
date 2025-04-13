import { z } from 'zod'
import type { Source, ApiMetadata, AgendaItem, Update, Report } from '../src/types'

// Source schema
export const sourceSchema = z.object({
  index: z.number().int().nonnegative(),
  url: z.string().url(),
})

// Type is imported from src/types.ts

// API Metadata schema
export const apiMetadataSchema = z.object({
  model: z.string(),
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  citationTokens: z.number().int().nonnegative(),
  numSearchQueries: z.number().int().nonnegative(),
  reasoningTokens: z.number().int().nonnegative(),
})

// Type is imported from src/types.ts

// Agenda Item schema
export const agendaItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  progress: z.number().int().min(0).max(100),
  status: z.string(),
  impact: z.string(),
  sourceIndices: z.array(z.number().int().nonnegative()),
})

// Type is imported from src/types.ts

// Update schema (for Solana reports)
export const updateSchema = z.object({
  title: z.string(),
  content: z.string(),
  sourceIndices: z.array(z.number().int().nonnegative()),
})

// Type is imported from src/types.ts

// Base Report schema (common fields for all report types)
const baseReportSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  content: z.string(),
  sources: z.array(sourceSchema),
  apiMetadata: apiMetadataSchema,
})

// List Report schema
export const listReportSchema = baseReportSchema.extend({
  type: z.literal('list'),
  agendaItems: z.array(agendaItemSchema),
})
export interface ListReport {
  id: string
  type: 'list'
  timestamp: string
  content: string
  sources: Source[]
  apiMetadata: ApiMetadata
  agendaItems: AgendaItem[]
}

// Item Report schema
export const itemReportSchema = baseReportSchema.extend({
  type: z.literal('item'),
  agendaItem: agendaItemSchema,
})
export interface ItemReport {
  id: string
  type: 'item'
  timestamp: string
  content: string
  sources: Source[]
  apiMetadata: ApiMetadata
  agendaItem: AgendaItem
}

// DeepSeek AI Report schema
export const deepSeekReportSchema = baseReportSchema.extend({
  type: z.literal('ds'),
  topicSummary: z.string(),
  features: z.array(z.string()),
  impacts: z.array(z.string()),
})
export interface DeepSeekReport {
  id: string
  type: 'ds'
  timestamp: string
  content: string
  sources: Source[]
  apiMetadata: ApiMetadata
  topicSummary: string
  features: string[]
  impacts: string[]
}

// Solana Report schema
export const solanaReportSchema = baseReportSchema.extend({
  type: z.literal('solana'),
  updates: z.array(updateSchema),
})
export interface SolanaReport {
  id: string
  type: 'solana'
  timestamp: string
  content: string
  sources: Source[]
  apiMetadata: ApiMetadata
  updates: Update[]
}

// Combined Report schema (union of all report types)
export const reportSchema = z.discriminatedUnion('type', [
  listReportSchema,
  itemReportSchema,
  deepSeekReportSchema,
  solanaReportSchema,
])

// Type is imported from src/types.ts

// Helper function to validate a report
export function validateReport(data: unknown): Report {
  return reportSchema.parse(data) as Report
}

// Helper functions to validate specific report types
export function validateListReport(data: unknown): ListReport {
  return listReportSchema.parse(data) as ListReport
}

export function validateItemReport(data: unknown): ItemReport {
  return itemReportSchema.parse(data) as ItemReport
}

export function validateDeepSeekReport(data: unknown): DeepSeekReport {
  return deepSeekReportSchema.parse(data) as DeepSeekReport
}

export function validateSolanaReport(data: unknown): SolanaReport {
  return solanaReportSchema.parse(data) as SolanaReport
}
