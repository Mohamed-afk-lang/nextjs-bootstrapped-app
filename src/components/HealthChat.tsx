'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function HealthChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/health-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content,
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Invalid response format from AI service')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Enhanced Header */}
        <div className="text-center mb-8 space-y-6">
          <div className="relative">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              🏥 AI Health Assistant
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Your trusted companion for health information and guidance
            </p>
          </div>
          
          <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm max-w-4xl mx-auto">
            <AlertDescription className="text-blue-800 text-base">
              <strong>⚠️ Medical Disclaimer:</strong> This AI assistant provides general health information for educational purposes only. 
              It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare 
              professionals for medical concerns and emergencies.
            </AlertDescription>
          </Alert>
        </div>

        {/* Enhanced Chat Interface */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              💬 Health Chat Assistant
              <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                Powered by AI
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Messages Container with Fixed Height and Internal Scrolling */}
            <div className="h-[500px] flex flex-col">
              {/* Messages Area with Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {messages.length === 0 && (
                  <div className="text-center py-12 space-y-4">
                    <div className="text-6xl mb-4">🩺</div>
                    <h3 className="text-2xl font-semibold text-gray-700">Welcome to Your Health Assistant!</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Ask me anything about health, symptoms, wellness tips, or medical information. 
                      I'm here to help with reliable, evidence-based answers.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mt-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600">"What are the symptoms of flu?"</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600">"How to improve sleep quality?"</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600">"What foods boost immunity?"</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600">"How to manage stress naturally?"</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[85%]`}>
                      {message.role === 'assistant' && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          AI
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-2xl shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          You
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-start space-x-3 max-w-[85%]">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                        AI
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-md shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Error Display */}
              {error && (
                <div className="px-6 pb-2">
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-800">
                      ❌ Error: {error}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Enhanced Input Area */}
              <div className="p-6 bg-white border-t border-gray-200">
                <div className="flex space-x-4 items-end">
                  <div className="flex-1">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your health question here... (Press Enter to send)"
                      disabled={loading}
                      className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 rounded-xl px-4 shadow-sm"
                    />
                  </div>
                  <Button 
                    onClick={sendMessage} 
                    disabled={loading || !input.trim()}
                    className="h-12 px-8 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Send</span>
                        <span>📤</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Built with ❤️ for better health awareness • Always consult healthcare professionals for medical advice</p>
        </div>
      </div>
    </div>
  )
}
