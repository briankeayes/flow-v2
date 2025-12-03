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
    const { activity, debriefFocus, groupDetails } = await request.json()

    // Validate required fields
    if (!activity || !debriefFocus) {
      return NextResponse.json(
        { error: 'Activity and debrief focus are required' },
        { status: 400 }
      )
    }

    // Load prompts efficiently (cached) - includes shared context
    const [sharedContext, functionPrompt, userTemplate] = await Promise.all([
      PromptManager.getPrompt('shared-context'),
      PromptManager.getPrompt('debrief-questions-system'),
      PromptManager.getPrompt('debrief-questions-user')
    ])

    // Combine shared context with function-specific prompt
    const systemPrompt = `${sharedContext}\n\n---\n\n${functionPrompt}`

    // Format the user prompt with the specific requirements
    const userPrompt = PromptManager.format(userTemplate, {
      activity_content: activity.content,
      debrief_focus: debriefFocus,
      group_details: groupDetails || ''
    })

    // Debug logging
    console.log('--- Debug Debrief Questions ---')
    console.log('Shared Context Length:', sharedContext?.length)
    console.log('Function Prompt Length:', functionPrompt?.length)
    console.log('Combined System Prompt Length:', systemPrompt?.length)
    console.log('User Prompt Length:', userPrompt?.length)
    console.log('Activity Content Present:', !!activity.content)
    
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
    const debriefQuestions = openaiData.choices[0].message.content

    return NextResponse.json({
      debriefQuestions: debriefQuestions,
      activity: activity.title,
      debriefFocus: debriefFocus
    })

  } catch (error) {
    console.error('Debrief questions error:', error)
    return NextResponse.json(
      { error: 'Failed to generate debrief questions' },
      { status: 500 }
    )
  }
}

