import { NextRequest, NextResponse } from 'next/server'
import { PromptManager } from '@/lib/prompt-manager'
import fs from 'fs'
import path from 'path'

interface Activity {
  title: string
  id: string
  slug: string
  content: string
  search_text: string
}

let activitiesCache: Activity[] | null = null

function loadActivities(): Activity[] {
  if (activitiesCache) {
    return activitiesCache
  }

  try {
    const filePath = path.join(process.cwd(), 'activities-search-index.json')
    const data = fs.readFileSync(filePath, 'utf8')
    activitiesCache = JSON.parse(data)
    return activitiesCache || []
  } catch (error) {
    console.error('Error loading activities:', error)
    return []
  }
}

function extractActivityMetadata(activity: Activity): {
  title: string
  slug: string
  url: string
  time: string
  type: string
  groupSize: string
  exertion: string
} {
  const lines = activity.search_text.split('\n')
  
  // Extract metadata from the "details" section
  let time = ''
  let type = ''
  let groupSize = ''
  let exertion = ''
  
  for (const line of lines) {
    if (line.includes('- **time:**')) {
      time = line.split('- **time:**')[1]?.trim() || ''
    }
    if (line.includes('- **type:**')) {
      type = line.split('- **type:**')[1]?.trim() || ''
    }
    if (line.includes('- **no. people:**')) {
      groupSize = line.split('- **no. people:**')[1]?.trim() || ''
    }
    if (line.includes('- **exertion:**')) {
      exertion = line.split('- **exertion:**')[1]?.trim() || ''
    }
  }
  
  return {
    title: activity.title,
    slug: activity.slug,
    url: `https://www.playmeo.com/activities/${activity.slug}/`,
    time: time || '10-15 min',
    type: type || 'Unknown',
    groupSize: groupSize || 'Any',
    exertion: exertion || 'Moderate'
  }
}

function formatActivityListForPrompt(activities: Activity[]): string {
  // Simplified format to reduce token usage - just essentials
  const formatted = activities.map(activity => {
    const meta = extractActivityMetadata(activity)
    // Format: Title|Slug|Time|Type
    return `${meta.title}|${meta.slug}|${meta.time}|${meta.type}`
  }).join('\n')
  
  return `Each line format: Title|Slug|Time|Type
URL format: https://www.playmeo.com/activities/[slug]/

Activities:
${formatted}`
}

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

    // Load all activities from database
    const allActivities = loadActivities()
    console.log(`Loaded ${allActivities.length} activities from database`)
    
    // Format activity list for injection into prompt
    const activityList = formatActivityListForPrompt(allActivities)

    // Load prompts efficiently (cached) - includes shared context
    const [sharedContext, functionPrompt, userTemplate] = await Promise.all([
      PromptManager.getPrompt('shared-context'),
      PromptManager.getPrompt('build-program-system'),
      PromptManager.getPrompt('build-program-user')
    ])

    // Combine shared context with function-specific prompt
    const systemPrompt = `${sharedContext}\n\n---\n\n${functionPrompt}`

    // Format the user prompt with the specific requirements AND activity list
    const userPrompt = PromptManager.format(userTemplate, {
      group_size: groupSize,
      available_time: availableTime,
      program_outcome: programOutcome,
      group_type: groupType,
      level_of_exertion: levelOfExertion,
      group_stage: groupStage || '',
      lazy_preference: lazyPreference || '',
      activity_list: activityList
    })

    // Debug logging
    console.log('--- Debug Build Program ---')
    console.log('Loaded Activities:', allActivities.length)
    console.log('Activity List Length:', activityList?.length)
    console.log('Shared Context Length:', sharedContext?.length)
    console.log('Function Prompt Length:', functionPrompt?.length)
    console.log('Combined System Prompt Length:', systemPrompt?.length)
    console.log('User Prompt Length:', userPrompt?.length)
    console.log('Total Estimated Tokens:', Math.ceil((systemPrompt?.length + userPrompt?.length) / 4))
    
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
      console.error('OpenAI Error Status:', openaiResponse.status)
      console.error('OpenAI Error Body:', errorBody)
      return NextResponse.json(
        { error: `OpenAI API error: ${openaiResponse.status}`, details: errorBody },
        { status: openaiResponse.status }
      )
    }

    const openaiData = await openaiResponse.json()
    
    if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
      console.error('Invalid OpenAI response structure:', openaiData)
      return NextResponse.json(
        { error: 'Invalid response from OpenAI' },
        { status: 500 }
      )
    }
    
    const program = openaiData.choices[0].message.content

    console.log('Programme generated successfully, length:', program?.length)

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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to build program', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

