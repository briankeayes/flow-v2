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
    const { activity, adaptations } = await request.json()

    if (!activity || !adaptations || adaptations.length === 0) {
      return NextResponse.json(
        { error: 'Activity and adaptations are required' },
        { status: 400 }
      )
    }

    // Load prompts efficiently (cached) - now includes shared context
    const [sharedContext, functionPrompt, userTemplate] = await Promise.all([
      PromptManager.getPrompt('shared-context'),
      PromptManager.getPrompt('adapt-activity-system'),
      PromptManager.getPrompt('adapt-activity-user')
    ])

    // Combine shared context with function-specific prompt
    const systemPrompt = `${sharedContext}\n\n---\n\n${functionPrompt}`

    // Format the user prompt with the SPECIFIC activity content
    const userPrompt = PromptManager.format(userTemplate, {
      activity_content: activity.content,
      adaptations_list: adaptations.map((a: string) => `- ${a}`).join('\n')
    })

    // Debug logging
    console.log('--- Debug Prompt Generation ---')
    console.log('Shared Context Length:', sharedContext?.length)
    console.log('Function Prompt Length:', functionPrompt?.length)
    console.log('Combined System Prompt Length:', systemPrompt?.length)
    console.log('User Prompt Length:', userPrompt?.length)
    console.log('Activity Content Present:', !!activity.content)
    console.log('Adaptations Count:', adaptations.length)
    
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
    const adaptedActivity = openaiData.choices[0].message.content

    return NextResponse.json({
      adaptedActivity: adaptedActivity,
      originalActivity: activity.title,
      adaptations: adaptations
    })

  } catch (error) {
    console.error('Adapt activity error:', error)
    return NextResponse.json(
      { error: 'Failed to adapt activity' },
      { status: 500 }
    )
  }
}
