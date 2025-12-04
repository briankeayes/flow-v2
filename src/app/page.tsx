'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type FlowMode = 'home' | 'adapt-activity' | 'build-program' | 'debrief-questions' | 'before-after'

function FlowApp() {
  const [currentMode, setCurrentMode] = useState<FlowMode>('home')
  const searchParams = useSearchParams()
  const activitySlug = searchParams.get('activity')

  // Handle deep linking
  useEffect(() => {
    if (activitySlug) {
      setCurrentMode('adapt-activity')
    }
  }, [activitySlug])

  if (currentMode === 'adapt-activity') {
    return (
      <AdaptActivity 
        onBack={() => setCurrentMode('home')} 
        initialSlug={activitySlug || undefined}
      />
    )
  }

  if (currentMode === 'build-program') {
    return <BuildProgram onBack={() => setCurrentMode('home')} />
  }

  if (currentMode === 'debrief-questions') {
    return <DebriefQuestions onBack={() => setCurrentMode('home')} />
  }

  if (currentMode === 'before-after') {
    return <BeforeAfter onBack={() => setCurrentMode('home')} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">Flow</h1>
          <p className="text-gray-600 text-xl">Your AI-powered activity assistant</p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div
            onClick={() => setCurrentMode('build-program')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-blue-300 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">🏗️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Build Program</h3>
              <p className="text-gray-600">Design a complete activity sequence tailored to your group & objectives.</p>
            </div>
          </div>

          <div
            onClick={() => setCurrentMode('adapt-activity')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-green-300 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Adapt Activity</h3>
              <p className="text-gray-600">Customise any activity to better fit your specific group or situation.</p>
            </div>
          </div>

          <div
            onClick={() => setCurrentMode('debrief-questions')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-purple-300 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">💭</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Debrief Questions</h3>
              <p className="text-gray-600">Generate thoughtful questions to deepen reflection after any activity.</p>
            </div>
          </div>

          <div
            onClick={() => setCurrentMode('before-after')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-orange-300 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Before & After</h3>
              <p className="text-gray-600">Get activity suggestions to run before & after your chosen activity.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Powered by AI • Built for facilitators</p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlowApp />
    </Suspense>
  )
}

interface AdaptActivityProps {
  onBack: () => void
  initialSlug?: string
}

interface AdaptationConfig {
  id: string
  label: string
  type: 'choice' | 'range' | 'text' | 'boolean'
  choices?: string[]
  placeholder?: string
  enabled: boolean
  value?: string | number
}

function AdaptActivity({ onBack, initialSlug }: AdaptActivityProps) {
  const [step, setStep] = useState<'select' | 'adapt' | 'result'>('select')
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [customInstructions, setCustomInstructions] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  // Handle deep linking fetch
  useEffect(() => {
    if (initialSlug && !selectedActivity) {
      setIsLoading(true)
      fetch(`/api/activity?slug=${initialSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data.activity) {
            setSelectedActivity(data.activity)
            setStep('adapt')
          }
        })
        .catch(err => console.error('Failed to load activity:', err))
        .finally(() => setIsLoading(false))
    }
  }, [initialSlug, selectedActivity])

  const generateAdaptedActivity = async () => {
    if (!selectedActivity) return

    if (!customInstructions.trim()) {
      alert('Please provide adaptation instructions')
      return
    }

    setIsLoading(true)
    try {
      // Use only the custom instructions
      const formattedAdaptations: string[] = [customInstructions.trim()]

      const response = await fetch('/api/adapt-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: selectedActivity,
          adaptations: formattedAdaptations
        })
      })

      const data = await response.json()
      setResult(data.adaptedActivity)
      setStep('result')
    } catch (error) {
      console.error('Adaptation failed:', error)
    }
    setIsLoading(false)
  }

  // Loading state for fetching initial activity
  if (isLoading && !selectedActivity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading activity...</div>
      </div>
    )
  }

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Adapt Activity</h1>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#189aca' }}>Step 1: Select an Activity</h2>
            <p className="text-black mb-6">Choose the activity you want to adapt:</p>

            <ActivitySelector
              onSelect={(activity) => {
                setSelectedActivity(activity)
                setStep('adapt')
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (step === 'adapt') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setStep('select')}
              className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Adapt Activity</h1>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-black">Selected Activity</h2>
              <p className="text-lg text-blue-600">{selectedActivity.title}</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#189aca' }}>Step 2: Describe Your Adaptation</h2>
              <p className="text-gray-700 mb-6">Tell us how you'd like to adapt this activity for your specific needs:</p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adaptation Instructions <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Describe how you'd like to adapt this activity. For example:&#10;• 'Make it work for 50 people instead of 20'&#10;• 'Adapt for a virtual/online setting'&#10;• 'Shorten to 15 minutes'&#10;• 'Make it wheelchair accessible'&#10;• 'Adapt for indoor use only'&#10;• 'Lower the energy level for tired participants'"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-gray-800"
                  rows={8}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Be as specific as possible about what you need to change and why.
                </p>
              </div>

              <button
                onClick={generateAdaptedActivity}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate Adapted Activity'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatMarkdownForDisplay = (markdown: string) => {
    if (!markdown) return ''

    // Split into lines for processing
    const lines = markdown.split('\n')
    const processedLines: string[] = []
    let inList = false
    let currentParagraph: string[] = []

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paraText = currentParagraph.join(' ').trim()
        if (paraText) {
          // Convert bold markers
          const withBold = paraText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-black">$1</strong>')
          processedLines.push(`<p class="mb-4 text-black leading-relaxed">${withBold}</p>`)
        }
        currentParagraph = []
      }
    }

    lines.forEach((line) => {
      const trimmed = line.trim()

      // Empty line - flush paragraph and close list if needed
      if (!trimmed) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        return
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h3 class="text-xl font-semibold mt-6 mb-3 text-black">${trimmed.substring(4)}</h3>`)
        return
      }

      if (trimmed.startsWith('#### ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h4 class="text-lg font-medium mt-4 mb-2 text-black">${trimmed.substring(5)}</h4>`)
        return
      }

      if (trimmed.startsWith('## ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h2 class="text-2xl font-bold mt-8 mb-4 text-black border-b border-gray-200 pb-2">${trimmed.substring(3)}</h2>`)
        return
      }

      // List items - remove existing bullets if present
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        flushParagraph()
        const listText = trimmed.replace(/^[-•]\s*/, '').trim()
        if (!inList) {
          processedLines.push('<ul class="list-disc ml-6 mb-4">')
          inList = true
        }
        const withBold = listText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-black">$1</strong>')
        processedLines.push(`<li class="mb-1 text-black">${withBold}</li>`)
        return
      }

      // Regular text - add to current paragraph
      currentParagraph.push(trimmed)
    })

    // Flush any remaining paragraph
    flushParagraph()
    if (inList) {
      processedLines.push('</ul>')
    }

    return processedLines.join('\n')
  }

  const exportToWord = () => {
    if (!result) return

    // Create a Word-compatible HTML document
    const wordContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Adapted Activity - ${selectedActivity?.title || 'Activity'}</title>
          <style>
            body {
              font-family: 'Calibri', 'Arial', sans-serif;
              font-size: 11pt;
              line-height: 1.5;
              margin: 1in;
            }
            h1 { font-size: 18pt; font-weight: bold; margin-bottom: 12pt; }
            h2 { font-size: 14pt; font-weight: bold; margin-top: 18pt; margin-bottom: 8pt; border-bottom: 1pt solid #ccc; padding-bottom: 4pt; }
            h3 { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
            h4 { font-size: 11pt; font-weight: bold; margin-top: 8pt; margin-bottom: 4pt; }
            p { margin-bottom: 8pt; }
            strong { font-weight: bold; }
            ul { margin-left: 0.25in; margin-bottom: 8pt; }
            li { margin-bottom: 2pt; }
            .activity-title { color: #2563eb; font-size: 16pt; margin-bottom: 12pt; }
            .activity-meta { font-size: 10pt; color: #666; margin-bottom: 12pt; }
          </style>
        </head>
        <body>
          <h1>Adapted Activity</h1>
          ${selectedActivity ? `
            <div class="activity-title">${selectedActivity.title}</div>
            <div class="activity-meta">
              <strong>ID:</strong> ${selectedActivity.id} |
              <strong>Slug:</strong> ${selectedActivity.slug}
            </div>
          ` : ''}
          <div>
            ${result
              .replace(/^### (.*$)/gm, '<h3>$1</h3>')
              .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
              .replace(/^## (.*$)/gm, '<h2>$1</h2>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/^- (.*$)/gm, '<li>• $1</li>')
              .replace(/\n\n/g, '</p><p>')
              .replace(/^/, '<p>')
              .replace(/$/, '</p>')
              .replace(/<p><\/p>/g, '')
              .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>')
            }
          </div>
          <div style="margin-top: 24pt; font-size: 9pt; color: #666; border-top: 1pt solid #ccc; padding-top: 8pt;">
            Generated by Flow - AI Activity Assistant
          </div>
        </body>
      </html>
    `

    // Create a blob and download it
    const blob = new Blob([wordContent], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `adapted-activity-${selectedActivity?.slug || 'activity'}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToText = () => {
    if (!result) return

    const textContent = result
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
      .replace(/^### /gm, '') // Remove header markers
      .replace(/^#### /gm, '')
      .replace(/^## /gm, '')
      .replace(/^- /gm, '• ') // Convert list markers

    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `adapted-activity-${selectedActivity?.slug || 'activity'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (step === 'result') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => setStep('select')}
                className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Adapted Activity</h1>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportToWord}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                📄 Export to Word
              </button>
              <button
                onClick={exportToText}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                📝 Export to Text
              </button>
            </div>
          </div>

          {/* Activity Header */}
          {selectedActivity && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
              <h2 className="text-2xl font-bold text-black mb-2">{selectedActivity.title}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-black">
                <span><strong>ID:</strong> {selectedActivity.id}</span>
                <span><strong>Slug:</strong> {selectedActivity.slug}</span>
              </div>
            </div>
          )}

          {/* Formatted Content */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div
              className="prose-custom max-w-none"
              dangerouslySetInnerHTML={{
                __html: formatMarkdownForDisplay(result)
              }}
            />
          </div>

          {/* Export Footer */}
          <div className="mt-8 text-center text-gray-500">
            <p className="text-sm">Generated by Flow - AI Activity Assistant</p>
            <p className="text-xs mt-2">Use the export buttons above to save this activity</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

interface ActivitySelectorProps {
  onSelect: (activity: any) => void
}

function ActivitySelector({ onSelect }: ActivitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const searchActivities = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      const data = await response.json()
      setResults(data.results.slice(0, 10)) // Limit to 10 for selection
    } catch (error) {
      console.error('Search failed:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchActivities(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div>
      <input
        type="text"
        placeholder="Search for an activity..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm mb-4"
        style={{ color: '#189aca' }}
      />

      <div className="max-h-96 overflow-y-auto">
        {results.map((activity, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelect(activity)}
          >
            <h3 className="font-semibold text-black">{activity.title}</h3>
            <p className="text-sm text-black mt-1">
              {activity.content.substring(0, 100).replace(/[#*]/g, '').trim()}...
            </p>
          </div>
        ))}

        {searchQuery && !isLoading && results.length === 0 && (
          <p className="text-black text-center py-4">No activities found</p>
        )}
        </div>
    </div>
  )
}

// Full feature components
interface FeatureProps {
  onBack: () => void
}

function BuildProgram({ onBack }: FeatureProps) {
  const [step, setStep] = useState<'input' | 'confirm' | 'result'>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [formData, setFormData] = useState({
    groupSize: '',
    availableTime: '',
    programOutcome: '',
    groupType: '',
    levelOfExertion: 'moderate',
    groupStage: '',
    lazyPreference: '1-3'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.groupSize || !formData.availableTime || !formData.programOutcome || !formData.groupType) {
      alert('Please fill in all required fields')
      return
    }

    // Go to confirmation step instead of building immediately
    setStep('confirm')
  }

  const handleConfirmBuild = async () => {
    setIsLoading(true)
    try {
      console.log('Sending request to build programme...')
      const response = await fetch('/api/build-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupSize: formData.groupSize,
          availableTime: formData.availableTime,
          programOutcome: formData.programOutcome,
          groupType: formData.groupType,
          levelOfExertion: formData.levelOfExertion,
          groupStage: formData.groupStage,
          lazyPreference: formData.lazyPreference
        })
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        alert(`Failed to build programme: ${errorData.error}\n${errorData.details || ''}`)
        setIsLoading(false)
        return
      }

      const data = await response.json()
      console.log('Programme received, length:', data.program?.length)
      
      if (!data.program) {
        console.error('No programme in response:', data)
        alert('No programme was generated. Please try again.')
        setIsLoading(false)
        return
      }
      
      setResult(data.program)
      setStep('result')
    } catch (error) {
      console.error('Build programme failed:', error)
      alert(`Failed to build programme: ${error instanceof Error ? error.message : String(error)}`)
      setStep('confirm') // Stay on confirm page
    }
    setIsLoading(false)
  }

  const formatMarkdownForDisplay = (markdown: string) => {
    if (!markdown) return ''
    
    const lines = markdown.split('\n')
    const processedLines: string[] = []
    let inList = false
    let currentParagraph: string[] = []

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paraText = currentParagraph.join(' ').trim()
        if (paraText) {
          const withBold = paraText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
          processedLines.push(`<p class="mb-4 text-gray-800 leading-relaxed">${withBold}</p>`)
        }
        currentParagraph = []
      }
    }

    lines.forEach((line) => {
      const trimmed = line.trim()

      if (!trimmed) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        return
      }

      if (trimmed.startsWith('### ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-900">${trimmed.substring(4)}</h3>`)
        return
      }

      if (trimmed.startsWith('#### ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h4 class="text-lg font-medium mt-4 mb-2 text-gray-900">${trimmed.substring(5)}</h4>`)
        return
      }

      if (trimmed.startsWith('## ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 border-b border-gray-200 pb-2">${trimmed.substring(3)}</h2>`)
        return
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        flushParagraph()
        const listText = trimmed.replace(/^[-•]\s*/, '').trim()
        if (!inList) {
          processedLines.push('<ul class="list-disc ml-6 mb-4 space-y-1">')
          inList = true
        }
        const withBold = listText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        processedLines.push(`<li class="text-gray-800">${withBold}</li>`)
        return
      }

      currentParagraph.push(trimmed)
    })

    flushParagraph()
    if (inList) {
      processedLines.push('</ul>')
    }

    return processedLines.join('\n')
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setStep('input')}
              className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Confirm Requirements</h1>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#189aca' }}>
              Here's what I understand:
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600 font-medium">Group Size</p>
                <p className="text-lg text-gray-800">{formData.groupSize}</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600 font-medium">Available Time</p>
                <p className="text-lg text-gray-800">{formData.availableTime}</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600 font-medium">Programme Outcome/Objective</p>
                <p className="text-lg text-gray-800">{formData.programOutcome}</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600 font-medium">Group Type</p>
                <p className="text-lg text-gray-800">{formData.groupType}</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600 font-medium">Level of Exertion</p>
                <p className="text-lg text-gray-800 capitalize">{formData.levelOfExertion}</p>
              </div>
              
              {formData.groupStage && (
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600 font-medium">Group Developmental Stage</p>
                  <p className="text-lg text-gray-800">{formData.groupStage}</p>
                </div>
              )}
              
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600 font-medium">Lazy Rating Preference</p>
                <p className="text-lg text-gray-800">{formData.lazyPreference}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleConfirmBuild}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Building Programme...' : '✓ Confirm & Build'}
              </button>
              
              <button
                onClick={() => setStep('input')}
                disabled={isLoading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ✎ Edit
              </button>
              
              <button
                onClick={onBack}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setStep('input')}
              className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Your Programme</h1>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div
              className="prose-custom max-w-none"
              dangerouslySetInnerHTML={{
                __html: formatMarkdownForDisplay(result)
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
          >
            ← Back
          </button>
            <h1 className="text-3xl font-bold text-gray-800">Build Programme</h1>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6" style={{ color: '#189aca' }}>
              Design Your Activity Sequence
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 30 people, 50 students, 200 conference delegates"
                  value={formData.groupSize}
                  onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 60 minutes, 2 hours, 30 mins"
                  value={formData.availableTime}
                  onChange={(e) => setFormData({ ...formData, availableTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programme Outcome/Objective <span className="text-red-500">*</span>
                </label>
              <textarea
                placeholder="e.g., Build team cohesion, Energize conference attendees, Develop leadership skills"
                value={formData.programOutcome}
                onChange={(e) => setFormData({ ...formData, programOutcome: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 resize-vertical"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Corporate team, School class, Conference attendees, Youth group"
                value={formData.groupType}
                onChange={(e) => setFormData({ ...formData, groupType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level of Exertion <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.levelOfExertion}
                onChange={(e) => setFormData({ ...formData, levelOfExertion: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              >
                <option value="low">Low - Mostly seated, minimal movement</option>
                <option value="moderate">Moderate - Mix of seated and active</option>
                <option value="high">High - Very active, energetic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Developmental Stage (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., New group, Established team, Mixed familiarity"
                value={formData.groupStage}
                onChange={(e) => setFormData({ ...formData, groupStage: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lazy Rating Preference
              </label>
              <select
                value={formData.lazyPreference}
                onChange={(e) => setFormData({ ...formData, lazyPreference: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              >
                <option value="1-3">1-3 (Low effort - Recommended)</option>
                <option value="1-5">1-5 (Any effort level)</option>
                <option value="3-5">3-5 (Higher effort activities)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Lower ratings = less preparation needed (Lazy Facilitator philosophy)
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continue to Review →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function DebriefQuestions({ onBack }: FeatureProps) {
  const [step, setStep] = useState<'select' | 'input' | 'result'>('select')
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [debriefFocus, setDebriefFocus] = useState('')
  const [groupDetails, setGroupDetails] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!debriefFocus.trim()) {
      alert('Please describe what you want to focus on in the debrief')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/debrief-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: selectedActivity,
          debriefFocus: debriefFocus,
          groupDetails: groupDetails
        })
      })

      const data = await response.json()
      setResult(data.debriefQuestions)
      setStep('result')
    } catch (error) {
      console.error('Generate debrief questions failed:', error)
      alert('Failed to generate questions. Please try again.')
    }
    setIsLoading(false)
  }

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Debrief Questions</h1>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#189aca' }}>
              Step 1: Select an Activity
            </h2>
            <p className="text-gray-700 mb-6">
              Choose the activity you want to create debrief questions for:
            </p>

            <ActivitySelector
              onSelect={(activity) => {
                setSelectedActivity(activity)
                setStep('input')
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setStep('select')}
              className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Debrief Questions</h1>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Selected Activity</h2>
              <p className="text-lg text-blue-600">{selectedActivity.title}</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#189aca' }}>
                Step 2: Define Your Debrief Focus
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Debrief Focus <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="e.g., 'Focus on communication issues in the team' or 'Help students identify limiting self-beliefs' or 'Generate three processes they can improve on'"
                    value={debriefFocus}
                    onChange={(e) => setDebriefFocus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 resize-vertical"
                    rows={4}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Describe what specific topic or learning you'd like your group to reflect upon
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Details (Optional)
                  </label>
                  <textarea
                    placeholder="e.g., 'Corporate leadership team, experienced with debriefing' or 'High school students, new to reflection activities'"
                    value={groupDetails}
                    onChange={(e) => setGroupDetails(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 resize-vertical"
                    rows={2}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Provide context about your group to help tailor the questions
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Generating Questions...' : 'Generate Debrief Questions'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatMarkdownForDisplay = (markdown: string) => {
    if (!markdown) return ''
    
    const lines = markdown.split('\n')
    const processedLines: string[] = []
    let inList = false
    let currentParagraph: string[] = []

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paraText = currentParagraph.join(' ').trim()
        if (paraText) {
          const withBold = paraText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
          processedLines.push(`<p class="mb-4 text-gray-800 leading-relaxed">${withBold}</p>`)
        }
        currentParagraph = []
      }
    }

    lines.forEach((line) => {
      const trimmed = line.trim()

      if (!trimmed) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        return
      }

      if (trimmed.startsWith('### ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-900">${trimmed.substring(4)}</h3>`)
        return
      }

      if (trimmed.startsWith('#### ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h4 class="text-lg font-medium mt-4 mb-2 text-gray-900">${trimmed.substring(5)}</h4>`)
        return
      }

      if (trimmed.startsWith('## ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 border-b border-gray-200 pb-2">${trimmed.substring(3)}</h2>`)
        return
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        flushParagraph()
        const listText = trimmed.replace(/^[-•]\s*/, '').trim()
        if (!inList) {
          processedLines.push('<ul class="list-disc ml-6 mb-4 space-y-1">')
          inList = true
        }
        const withBold = listText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        processedLines.push(`<li class="text-gray-800">${withBold}</li>`)
        return
      }

      currentParagraph.push(trimmed)
    })

    flushParagraph()
    if (inList) {
      processedLines.push('</ul>')
    }

    return processedLines.join('\n')
  }

  if (step === 'result') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setStep('select')}
              className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Debrief Questions</h1>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Activity</h2>
            <p className="text-lg text-blue-600">{selectedActivity.title}</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div
              className="prose-custom max-w-none"
              dangerouslySetInnerHTML={{
                __html: formatMarkdownForDisplay(result)
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}

function BeforeAfter({ onBack }: FeatureProps) {
  const [step, setStep] = useState<'select' | 'input' | 'result'>('select')
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [sequenceType, setSequenceType] = useState<'before' | 'after' | 'both'>('both')
  const [groupDetails, setGroupDetails] = useState('')
  const [context, setContext] = useState('')
  const [constraints, setConstraints] = useState('')
  const [programOutcome, setProgramOutcome] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      const response = await fetch('/api/before-after', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: selectedActivity,
          sequenceType: sequenceType,
          groupDetails: groupDetails,
          context: context,
          constraints: constraints,
          programOutcome: programOutcome
        })
      })

      const data = await response.json()
      setResult(data.sequence)
      setStep('result')
    } catch (error) {
      console.error('Generate sequence failed:', error)
      alert('Failed to generate activity sequence. Please try again.')
    }
    setIsLoading(false)
  }

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Before & After</h1>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#189aca' }}>
              Step 1: Select an Activity
            </h2>
            <p className="text-gray-700 mb-6">
              Choose the activity you want to build a sequence around:
            </p>

            <ActivitySelector
              onSelect={(activity) => {
                setSelectedActivity(activity)
                setStep('input')
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setStep('select')}
              className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Before & After</h1>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Selected Activity</h2>
              <p className="text-lg text-blue-600">{selectedActivity.title}</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#189aca' }}>
                Step 2: Define Your Sequence
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sequence Type <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="sequenceType"
                        value="before"
                        checked={sequenceType === 'before'}
                        onChange={(e) => setSequenceType(e.target.value as 'before')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-800">Activities Before</div>
                        <div className="text-sm text-gray-500">Get warm-up activities to prepare for this activity</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="sequenceType"
                        value="after"
                        checked={sequenceType === 'after'}
                        onChange={(e) => setSequenceType(e.target.value as 'after')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-800">Activities After</div>
                        <div className="text-sm text-gray-500">Get follow-up activities to build upon this activity</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="sequenceType"
                        value="both"
                        checked={sequenceType === 'both'}
                        onChange={(e) => setSequenceType(e.target.value as 'both')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-800">Before & After</div>
                        <div className="text-sm text-gray-500">Get a complete sequence with activities before and after</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Details (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 30 high school students, Corporate team of 15"
                    value={groupDetails}
                    onChange={(e) => setGroupDetails(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Context (Optional)
                  </label>
                  <textarea
                    placeholder="e.g., Team building workshop, Conference energizer session, Leadership training"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 resize-vertical"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Constraints (Optional)
                  </label>
                  <textarea
                    placeholder="e.g., Limited space, Seated only, 45 minutes total time"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 resize-vertical"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Outcome (Optional)
                  </label>
                  <textarea
                    placeholder="e.g., Build trust and communication, Increase energy and engagement"
                    value={programOutcome}
                    onChange={(e) => setProgramOutcome(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 resize-vertical"
                    rows={2}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Generating Sequence...' : 'Generate Activity Sequence'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatMarkdownForDisplay = (markdown: string) => {
    if (!markdown) return ''
    
    const lines = markdown.split('\n')
    const processedLines: string[] = []
    let inList = false
    let currentParagraph: string[] = []

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paraText = currentParagraph.join(' ').trim()
        if (paraText) {
          const withBold = paraText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
          processedLines.push(`<p class="mb-4 text-gray-800 leading-relaxed">${withBold}</p>`)
        }
        currentParagraph = []
      }
    }

    lines.forEach((line) => {
      const trimmed = line.trim()

      if (!trimmed) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        return
      }

      if (trimmed.startsWith('### ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-900">${trimmed.substring(4)}</h3>`)
        return
      }

      if (trimmed.startsWith('#### ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h4 class="text-lg font-medium mt-4 mb-2 text-gray-900">${trimmed.substring(5)}</h4>`)
        return
      }

      if (trimmed.startsWith('## ')) {
        flushParagraph()
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        processedLines.push(`<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 border-b border-gray-200 pb-2">${trimmed.substring(3)}</h2>`)
        return
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        flushParagraph()
        const listText = trimmed.replace(/^[-•]\s*/, '').trim()
        if (!inList) {
          processedLines.push('<ul class="list-disc ml-6 mb-4 space-y-1">')
          inList = true
        }
        const withBold = listText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        processedLines.push(`<li class="text-gray-800">${withBold}</li>`)
        return
      }

      currentParagraph.push(trimmed)
    })

    flushParagraph()
    if (inList) {
      processedLines.push('</ul>')
    }

    return processedLines.join('\n')
  }

  if (step === 'result') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setStep('select')}
              className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Activity Sequence</h1>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Central Activity</h2>
            <p className="text-lg text-blue-600">{selectedActivity.title}</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div
              className="prose-custom max-w-none"
              dangerouslySetInnerHTML={{
                __html: formatMarkdownForDisplay(result)
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}
