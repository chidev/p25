export const solana = {
  model: 'sonar',
  messages: [
    {
      content: [
        'You are a crypto influencer tasked with tracking the state of crypto, specifically Solana.',
        '',
        'Rules:',
        '- Be concise and speak in language a 5 year old can understand.',
        '',
        'Formatting Example:',
        '',
        '## Title**',
        '---',
        'Summary of recent news around Solana',
        '',
        '- Bullet point list of market trends',
        '- Bullet point list of the most popular meme coins',
        '- Bullet point list of SEC related news',
        '- Bullet point list of fortune 500 companies investing in crypto',
        '- Bullet point list of businesses integration Solana',
        '',
        '**Sources**: [1][2][3]',
        '',
        '---',
      ].join('\n'),
      role: 'system',
    },
    // {
    //   content: [
    //     'You are a research assistant tasked with tracking the progress of Project 2025 agenda items.',
    //     'Please provide a JSON response with the following fields: agenda_item_title, agenda_item_description,',
    //     'progress_score, sub_topics, reasoning, status_overview. The progress_score should be a number from 1-100.',
    //     'Explain why you came to the conclusion in the reasoning field and give a',
    //     'brief overview of current status in the status_overview field.',
    //   ].join(' '),
    //   role: 'system',
    // },
    {
      role: 'user',
      content: 'Create 5 summaries of recent solana news.',
    },
    // {
    //   role: 'assistant',
    //   content:
    //     "Federal Workforce Restructuring (Schedule F): Replacing merit-based workers with loyalists. Mentioned in 1, 2, 3. Progress could be high since it's started via executive orders.  Immigration Enforcement Expansion: Mass deportations using military, DHS restructuring. Covered in 1, 2, 3, 4. Some actions started but logistical challenges.  Tax Code Overhaul: Flat tax, corporate tax cuts. From 1, 2. Requires legislation, so lower progress.  Climate Deregulation: Exiting Paris Agreement, expanding drilling. In 1, 2, progress might be advanced via executive actions.  DEI Program Elimination: Terminating diversity initiatives across agencies. Started in DoD and Education per 2, 3.  Healthcare Rollbacks: Ending Medicare negotiations, Medicaid work requirements. From 1, 3. Some FDA actions but legislative hurdles.  Education Privatization: Dismantling Dept of Education, school vouchers. Funds shifted per 1, but legal delays.  TikTok Ban: Forcing divestiture or ban. CFIUS actions mentioned in 2, high progress.  Federal Agency Consolidation: Abolishing DHS, merging agencies. Needs Congress approval, low progress.  Social Policy Enforcement: Criminalizing pornography, restricting abortion. DOJ task force started but legal challenges.",
    // },
    // { role: 'user', content: 'Now provide the structured output of their progress on a scale from 1-100' },
  ],
  return_images: false,
  return_related_questions: false,
  search_recency_filter: 'week',
  // stream: true,
}
