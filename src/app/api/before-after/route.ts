import { NextRequest, NextResponse } from 'next/server'
import { PromptManager } from '@/lib/prompt-manager'

interface Activity {
  title: string
  id: string
  slug: string
  content: string
  search_text: string
}

export async function POST(request: NextRequest) {
  try {
    const { activity, sequenceType, groupDetails, context, constraints, programOutcome } = await request.json()

    // Validate required fields
    if (!activity || !sequenceType) {
      return NextResponse.json(
        { error: 'Activity and sequence type (before/after/both) are required' },
        { status: 400 }
      )
    }

    // Validate sequenceType
    if (!['before', 'after', 'both'].includes(sequenceType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Sequence type must be "before", "after", or "both"' },
        { status: 400 }
      )
    }

    // Load prompts efficiently (cached) - includes shared context
    const [sharedContext, functionPrompt, userTemplate] = await Promise.all([
      PromptManager.getPrompt('shared-context'),
      PromptManager.getPrompt('before-after-system'),
      PromptManager.getPrompt('before-after-user')
    ])

    // Combine shared context with function-specific prompt
    const systemPrompt = `${sharedContext}\n\n---\n\n${functionPrompt}`

    // Format the user prompt with the specific requirements
    const userPrompt = PromptManager.format(userTemplate, {
      activity_content: activity.content,
      sequence_type: sequenceType,
      group_details: groupDetails || '',
      context: context || '',
      constraints: constraints || '',
      program_outcome: programOutcome || ''
    })

    // Debug logging
    console.log('--- Debug Before/After ---')
    console.log('Shared Context Length:', sharedContext?.length)
    console.log('Function Prompt Length:', functionPrompt?.length)
    console.log('Combined System Prompt Length:', systemPrompt?.length)
    console.log('User Prompt Length:', userPrompt?.length)
    console.log('Activity Content Present:', !!activity.content)
    console.log('Sequence Type:', sequenceType)
    
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
    const sequence = openaiData.choices[0].message.content

    return NextResponse.json({
      sequence: sequence,
      activity: activity.title,
      sequenceType: sequenceType
    })

  } catch (error) {
    console.error('Before/After error:', error)
    return NextResponse.json(
      { error: 'Failed to generate activity sequence' },
      { status: 500 }
    )
  }
}

