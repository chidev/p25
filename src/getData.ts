import { body as list } from './prompts/key-list'
import { getItemPrompt } from './prompts/item-breakdown'
import { ds } from './prompts/deepseek'

export const getData = async (args?: { item?: string; prompt?: any }) => {
  const { item, prompt } = args || {}
  let body = item ? getItemPrompt(item) : list
  if (prompt) {
    body = prompt
  }

  console.log(body)

  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer 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',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }

  return await fetch('https://api.perplexity.ai/chat/completions', options)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status} - ${response.statusText}`)
      }
      return response.json()
    })
    .then((response) => {
      console.log(response)
      const footer = response.citations.map((c: string, i: number) => `[${i + 1}] ${c}`).join('\n\n')
      const report = `${response.choices[0].message.content}\n---\n${footer}`

      return { report, response }
    })
    .catch((err) => console.error(err))
}
