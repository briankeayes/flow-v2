import { NextRequest, NextResponse } from 'next/server'
import { PromptManager } from '@/lib/prompt-manager'

export async function POST(request: NextRequest) {
  try {
    const { groupSize, availableTime, programOutcome, groupType, levelOfExertion, groupStage, lazyPreference } = await request.json()

    // Validate required fields
    if (!groupSize || !availableTime || !programOutcome || !groupType || !levelOfExertion) {
      return NextResponse.json(
        { error: 'Group size, available time, program outcome, group type, and level of exertion are required' },
        { status: 400 }
      )
    }

    // Load prompts efficiently (cached) - includes shared context
    const [sharedContext, functionPrompt, userTemplate] = await Promise.all([
      PromptManager.getPrompt('shared-context'),
      PromptManager.getPrompt('build-program-system'),
      PromptManager.getPrompt('build-program-user')
    ])

    // Combine shared context with function-specific prompt
    const systemPrompt = `${sharedContext}\n\n---\n\n${functionPrompt}`

    // Format the user prompt with the specific requirements
    const userPrompt = PromptManager.format(userTemplate, {
      group_size: groupSize,
      available_time: availableTime,
      program_outcome: programOutcome,
      group_type: groupType,
      level_of_exertion: levelOfExertion,
      group_stage: groupStage || '',
      lazy_preference: lazyPreference || ''
    })

    // Debug logging
    console.log('--- Debug Build Program ---')
    console.log('Shared Context Length:', sharedContext?.length)
    console.log('Function Prompt Length:', functionPrompt?.length)
    console.log('Combined System Prompt Length:', systemPrompt?.length)
    console.log('User Prompt Length:', userPrompt?.length)
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 4000,
        temperature: 0.7
      })
    })

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text()
      console.error('OpenAI Error Body:', errorBody)
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorBody}`)
    }

    const openaiData = await openaiResponse.json()
    const program = openaiData.choices[0].message.content

    return NextResponse.json({
      program: program,
      parameters: {
        groupSize,
        availableTime,
        programOutcome,
        groupType,
        levelOfExertion,
        groupStage,
        lazyPreference
      }
    })

  } catch (error) {
    console.error('Build program error:', error)
    return NextResponse.json(
      { error: 'Failed to build program' },
      { status: 500 }
    )
  }
}

