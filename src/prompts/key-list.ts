export const list = [
  '**Dismantling Federal Agencies**: Eliminating Education, Homeland Security, EPA; merging others.',
  '**Immigration Overhaul**: Mass deportations, border wall, military deployment.',
  '**Environmental Policy Rollbacks**: Exiting Paris Agreement, promoting fossil fuels, any other environmental concerns.',
  '**Tax Reform**: Flat tax, corporate tax cuts.',
  '**Civil Service Overhaul**: Replace merit-based workers with loyalists.',
  '**Social Policies**: Anti-LGBTQ+ measures, anti-DEI initiatives.',
  '**Abortion and Reproductive Rights Restrictions**: Criminalizing abortion drugs, limiting federal funding.',
  '**Education Reform**: School choice, defunding public schools.',
  '**Trade and Tariffs**: Universal baseline tariffs, targeting China and other countries.',
  '**Law Enforcement Expansion**: Death penalty expansion, using military domestically, ice expansion and activities.',
]

export const body = {
  model: 'sonar-deep-research',
  // response_format: {
  //   type: 'json_schema',
  //   json_schema: {
  //     schema: {
  //       type: 'object',
  //       properties: {
  //         list: {
  //           type: 'array',
  //           items: {
  //             type: 'object',
  //             properties: {
  //               agenda_item_title: { type: 'string' },
  //               agenda_item_description: { type: 'string' },
  //               progress_score: { type: 'number', minimum: 1, maximum: 100 },
  //               sub_topics: {
  //                 type: 'array',
  //                 items: {
  //                   type: 'object',
  //                   properties: {
  //                     title: { type: 'string' },
  //                     description: { type: 'string' },
  //                   },
  //                 },
  //               },
  //               reasoning: { type: 'string' },
  //               status_overview: { type: 'string' },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // },
  messages: [
    {
      content: [
        'You are a research assistant tasked with tracking the progress of Project 2025 agenda items.',
        'The agenda items we will track are:',
        ...list.map((item, i) => `${i + 1}. ${item}`),
        '',
        'Rules:',
        '',
        '- For each agenda item, provide the title, description, key initiatives, progress, status, why it matters, and sources.',
        '- The conclusion should be 2 sentences and highlight the current overall progress %.',
        '- Be concise and speak in language a 5 year old can understand.',
        '- Feel free to expand on the topic, the examples listed in each item should warrant pulling up more related data.',
        '',
        'Formatting Example:',
        '',
        '## Agenda Item Title**',
        '---',
        '**Progress: 50/100**',
        '',
        '**What**: Description of agenda item, key initiatives and the purpose of the item',
        '',
        '**Status**: Explanation of what has been accomplished',
        '',
        '**Why it matters**: How it affects your rights, economy, environment, etc.',
        '',
        '**Sources**: [1][2][3]',
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
      content: 'Get the current progress of project 2025',
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
  search_recency_filter: 'month',
  // stream: true,
}
