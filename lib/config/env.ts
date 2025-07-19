export interface AIConfig {
  gemini: {
    apiKey: string
    model: string
    temperature: number
    maxTokens: number
  }
  openai?: {
    apiKey: string
    model: string
    temperature: number
    maxTokens: number
  }
  enabled: boolean
  rateLimitPerMinute: number
  timeout: number
}

export const getAIConfig = (): AIConfig => {
  // For now, we'll use the hardcoded key you provided
  // In production, this should come from environment variables
  const geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyDtpoEZ98Dj6V8SMmlJ694iRRUaKIYY8Yk'

  return {
    gemini: {
      apiKey: geminiApiKey,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048')
    },
    openai: process.env.OPENAI_API_KEY ? {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2048')
    } : undefined,
    enabled: process.env.AI_ENABLED !== 'false',
    rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT || '10'),
    timeout: parseInt(process.env.AI_TIMEOUT || '30000')
  }
}

export const isAIEnabled = (): boolean => {
  const config = getAIConfig()
  return config.enabled && !!config.gemini.apiKey
}

export const validateAIConfig = (): { valid: boolean; errors: string[] } => {
  const config = getAIConfig()
  const errors: string[] = []

  if (!config.gemini.apiKey) {
    errors.push('Gemini API key is required')
  }

  if (config.gemini.temperature < 0 || config.gemini.temperature > 2) {
    errors.push('Gemini temperature must be between 0 and 2')
  }

  if (config.gemini.maxTokens < 1 || config.gemini.maxTokens > 8192) {
    errors.push('Gemini max tokens must be between 1 and 8192')
  }

  if (config.rateLimitPerMinute < 1) {
    errors.push('Rate limit must be at least 1 request per minute')
  }

  if (config.timeout < 1000) {
    errors.push('Timeout must be at least 1000ms')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
