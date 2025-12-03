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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  const activities = loadActivities()
  const activity = activities.find(a => a.slug === slug)

  if (!activity) {
    return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
  }

  return NextResponse.json({ activity })
}

