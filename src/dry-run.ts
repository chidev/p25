import * as fs from 'node:fs'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { list } from './prompts/key-list'
import { getData } from './getData'
import { solana } from './prompts/solana'
import { ds } from './prompts/deepseek'

const argvPromise = yargs(hideBin(process.argv)) //
  .option('topic', { type: 'string' })
  .option('list', { type: 'boolean' })
  .option('item', { type: 'string' }).argv

type ReportArgs = {
  data: { report: string; response: object } | void
  name: string
}

// Modified function to log report instead of writing to file
function logReport(args: ReportArgs) {
  const { data, name } = args

  if (!data) {
    return
  }

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

  console.log(`\n--- ${name}-${date}.md ---`)
  console.log(report)
  console.log(`\n--- debug-${name}-${date}.json ---`)
  console.log(JSON.stringify(response, null, 2))
  console.log('\n')
}

async function getList() {
  console.log('Starting report for all agenda items...')

  const data = await getData()

  logReport({ data, name: 'list' })
}

async function getItem(i: number) {
  const item = list[i]

  console.log(`Starting report for ${item}...`)

  const data = await getData({ item })

  logReport({ data, name: `item-${i}` })
}

async function getTopic(topic: string) {
  if (!topic) {
    console.error('No topic provided')
    return
  }

  let prompt
  switch (topic) {
    case 'ds':
      prompt = ds
      break
    case 'solana':
      prompt = solana
      break
  }

  if (!prompt) {
    console.error('Invalid topic')
    return
  }

  const data = await getData({ prompt })
  logReport({ data, name: topic })
}

async function main() {
  const argv = await argvPromise

  const start = Date.now()

  if (argv.list) {
    await getList()
  } else if (argv.item) {
    await getItem(parseInt(argv.item))
  } else if (argv.topic) {
    await getTopic(argv.topic)
  }

  const end = Date.now()
  console.log(`Report took ${(end - start) / 1000} seconds`)
}

main().catch(console.error)
