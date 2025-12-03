import { promises as fs } from 'fs'
import path from 'path'

// Cache for loaded prompts to avoid reading disk on every request
const promptCache: Record<string, string> = {}

export class PromptManager {
  static async getPrompt(promptName: string): Promise<string> {
    // Return cached version in production
    if (process.env.NODE_ENV === 'production' && promptCache[promptName]) {
      return promptCache[promptName]
    }

    try {
      // Adjust path to where your prompts are stored
      // In Next.js, process.cwd() is usually the project root
      const promptsDir = path.join(process.cwd(), 'src', 'prompts')
      const filePath = path.join(promptsDir, `${promptName}.md`)
      
      const content = await fs.readFile(filePath, 'utf-8')
      promptCache[promptName] = content
      return content
    } catch (error) {
      console.error(`Failed to load prompt: ${promptName}`, error)
      throw new Error(`Prompt file not found: ${promptName}`)
    }
  }

  static format(template: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce((text, [key, value]) => {
      return text.replace(new RegExp(`{{${key}}}`, 'g'), value || '')
    }, template)
  }
}


