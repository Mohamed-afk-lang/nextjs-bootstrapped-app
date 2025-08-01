import { NextRequest, NextResponse } from 'next/server'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: Message[]
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // System message with health assistant context and disclaimer
    const systemMessage: Message = {
      role: 'system',
      content: `You are a helpful AI health assistant. You provide general health information and guidance based on medical knowledge. 

IMPORTANT DISCLAIMERS:
- You are not a replacement for professional medical advice, diagnosis, or treatment
- Always recommend consulting with healthcare professionals for serious concerns
- Do not provide specific medical diagnoses
- Encourage users to seek immediate medical attention for emergencies
- Be empathetic and supportive while maintaining professional boundaries

Provide accurate, helpful information while being clear about limitations. Always include appropriate disclaimers when discussing health topics.`
    }

    // Combine system message with user messages
    const allMessages = [systemMessage, ...body.messages]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get response from AI service' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Health chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
