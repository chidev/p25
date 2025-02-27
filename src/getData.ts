import { body as list } from './prompts/key-list'
import { getItemPrompt } from './prompts/item-breakdown'

export const getData = async (args?: { item?: string }) => {
  const { item } = args || {}
  const body = item ? getItemPrompt(item) : list

  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer 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',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }

  return await fetch('https://api.perplexity.ai/chat/completions', options)
    .then((response) => response.json())
    .then((response) => {
      console.log(response)
      const footer = response.citations.map((c, i) => `[${i + 1}] ${c}`).join('\n\n')
      const report = `${response.choices[0].message.content}\n---\n${footer}`

      return { report, response }
    })
    .catch((err) => console.error(err))
}
