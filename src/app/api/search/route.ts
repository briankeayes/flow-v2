import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const activities = loadActivities()
    const searchTerms = query.toLowerCase().split(' ').filter((term: string) => term.length > 0)

    // Score and rank activities
    const scoredResults = activities
      .map(activity => {
        let score = 0
        const searchText = activity.search_text

        // Title matches get highest score
        const titleLower = activity.title.toLowerCase()
        if (titleLower.includes(query.toLowerCase())) {
          score += 20
        }

        // Count term matches in title (weighted)
        searchTerms.forEach((term: string) => {
          if (titleLower.includes(term)) {
            score += 5
          }
        })

        // Count term matches in content
        searchTerms.forEach((term: string) => {
          const count = (searchText.match(new RegExp(term, 'g')) || []).length
          score += count
        })

        return { ...activity, score }
      })
      .filter(activity => activity.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50) // Top 50 results

    // Format results for frontend
    const results = scoredResults.map(activity => ({
      title: activity.title,
      id: activity.id,
      slug: activity.slug,
      content: activity.content,
      search_text: activity.search_text
    }))

    return NextResponse.json({ results })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
