# Flow - AI Activity Assistant

An AI-powered web application for facilitators to design, adapt, and enhance group activities. Built with Next.js, TypeScript, Tailwind CSS, and OpenAI GPT-4.

## Features

### 🎯 **Four Core Functions:**

1. **🏗️ Build Program** - Design complete activity sequences tailored to your group & objectives
2. **🔧 Adapt Activity** - Customize any activity to better fit your specific group or situation
3. **💭 Debrief Questions** - Generate thoughtful questions to deepen reflection after any activity
4. **🔄 Before & After** - Get activity suggestions to run before & after your chosen activity

### 🚀 **Key Features:**

- **AI-Powered Adaptation**: Use GPT-4 to intelligently modify activities while maintaining structure
- **Smart Search**: Search through 500+ activities with relevance ranking
- **Advanced Adaptation Options**: Choose from predefined options or enter custom details
- **Export Functionality**: Export adapted activities to Word (.doc) or plain text formats
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Serverless Architecture**: Cheap to host and scale automatically

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the app directory:
```bash
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### 🔍 **Search Algorithm**

The app uses an intelligent search algorithm:

1. **Title Priority**: Exact title matches get the highest score (20 points)
2. **Title Keywords**: Keywords found in titles get 5 points each
3. **Content Keywords**: Keywords found in content get 1 point each
4. **Ranking**: Results are sorted by total score, highest first

### 🤖 **AI Adaptation Process**

When adapting activities, the system:

1. **Analyzes the original activity** structure and content
2. **Identifies requested adaptations** (group size, age, virtual, etc.)
3. **Uses GPT-4** to intelligently modify the activity
4. **Maintains PlayMeo format** with all standard sections
5. **Preserves educational value** while meeting new requirements

### 🎛️ **Adaptation Options**

The Adapt Activity feature offers comprehensive customization:

**Choice-Based Options:**
- Group Size: Smaller/Larger/Exact number (with number input)
- Age Group: Younger/Older/Specific age range (with text input)
- Time Constraints: Shorter/Longer/Exact time (with minutes input)
- Environment: Indoor only/Outdoor only/Both available
- Energy Level: Lower energy/Higher energy/Maintain current
- Skill Level: Beginner friendly/Advanced level/Mixed abilities

**Free-Form Options:**
- Physical Limitations: Describe accessibility needs
- Cultural Considerations: Cultural adaptation requirements
- Equipment Availability: Available/unavailable resources
- Other Requirements: Any additional customizations

### 📊 **Data Source**

The app uses `activities-search-index.json`, containing:
- 532 activities from the PlayMeo database
- Each activity includes: title, ID, slug, full content, and search text
- Data is pre-processed for fast searching and AI processing

## API Endpoints

### POST `/api/search`

Search for activities using intelligent ranking.

**Request Body:**
```json
{
  "query": "team building large group"
}
```

**Response:**
```json
{
  "results": [
    {
      "title": "Activity Title",
      "id": "12345",
      "slug": "activity-slug",
      "content": "Full markdown content...",
      "search_text": "lowercase searchable text"
    }
  ]
}
```

### POST `/api/adapt-activity`

Adapt an existing activity using AI to meet specific requirements.

**Request Body:**
```json
{
  "activity": {
    "title": "Original Activity Title",
    "content": "Full activity markdown content...",
    "id": "12345",
    "slug": "activity-slug"
  },
  "adaptations": [
    "Group size (smaller/larger)",
    "Virtual/online adaptation",
    "Age group (younger/older)"
  ]
}
```

**Response:**
```json
{
  "adaptedActivity": "<Full adapted activity in PlayMeo markdown format>",
  "originalActivity": "Original Activity Title",
  "adaptations": ["Group size (smaller/larger)", "Virtual/online adaptation"]
}
```

## Deployment

### Vercel (Recommended - Free)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

Follow the prompts to connect your GitHub account and deploy.

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `out` folder to Netlify.

### Manual Deployment

1. Build for production:
```bash
npm run build
npm run start
```

The app will be available on port 3000.

## Cost Analysis

- **Development**: Free (local)
- **Hosting**: Vercel free tier ($0/month)
  - 100GB bandwidth/month
  - 100GB-hours serverless compute
- **OpenAI API**: Pay-per-use (~$0.03 per adaptation)
  - GPT-4: ~$0.03/1K tokens for adaptation requests
  - Light usage: ~$1-5/month
  - Heavy usage: ~$10-20/month
- **API Calls**: Minimal (searching) + AI calls (adapting)
- **Storage**: Static files (activities data is bundled)

## Customization

### Adding More Activities

1. Update `activities-search-index.json` with new activities
2. Each activity should have: `title`, `id`, `slug`, `content`, `search_text`

### Improving Search

- Add fuzzy matching
- Include taxonomy-based filtering
- Add semantic search with embeddings
- Implement autocomplete

### Styling

The app uses Tailwind CSS. Customize colors and layout in:
- `src/app/page.tsx` (components)
- `src/app/globals.css` (global styles)

## Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── api/search/
│   │   │   └── route.ts      # Search API endpoint
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # App layout
│   │   └── page.tsx          # Main search page
│   └── ...
├── activities-search-index.json  # Search data
├── package.json
└── README.md
```

## Troubleshooting

### Search Not Working

- Check that `activities-search-index.json` exists
- Verify the API endpoint is responding
- Check browser console for errors

### Build Errors

- Ensure all TypeScript types are correct
- Check that dependencies are installed
- Verify Node.js version (18+ required)

### Performance Issues

- The search index is loaded on every API call
- Consider caching or database storage for production
- Add pagination for large result sets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is part of the PlayMeo activity database system.
