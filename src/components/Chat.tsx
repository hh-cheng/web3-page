import z from 'zod'
import { useEffect, useMemo, useRef, useState } from 'react'

type Message = {
  id: string
  content: string
  role: 'user' | 'assistant'
}

const responseSchema = z.object({
  content: z.string(),
  role: z.enum(['user', 'assistant']),
})

function useAutoScroll(msgLength: number, isThinking: boolean) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight })
  }, [msgLength, isThinking])
  return ref
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1" aria-label="typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-bounce"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: "Hi! I'm your AI assistant. Ask me anything.",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchChatResponse = async (messages: Message[]) => {
    try {
      setIsLoading(true)
      // const res = await fetch('http://localhost:8787/chat', {
      const res = await fetch('https://chat.bonelycheng.cc/chat', {
        method: 'POST',
        body: JSON.stringify({ messages }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text}`)
      }

      const data = await res.json()
      return responseSchema.parse(data)
    } catch (err) {
      console.error(err)
      return {
        role: 'assistant' as const,
        content: 'Error contacting AI',
      }
    } finally {
      setIsLoading(false)
    }
  }

  const scrollRef = useAutoScroll(messages.length, isLoading)

  const canSend = useMemo(
    () => input.trim().length > 0 && !isLoading,
    [input, isLoading],
  )

  const sendMessage = async () => {
    if (!canSend) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      id: crypto.randomUUID(),
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')

    try {
      const assistantMessage = await fetchChatResponse(updatedMessages)
      setMessages((prev) => [
        ...prev,
        { ...assistantMessage, id: crypto.randomUUID() },
      ])
    } catch (err: any) {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error contacting AI: ${err?.message || String(err)}`,
      }
      setMessages((prev) => [...prev, assistantMessage])
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-3 rounded-lg border border-white/10 bg-slate-950/55"
      >
        {messages.map((m) => (
          <div key={m.id} className="flex mb-2.5">
            <div
              className={`max-w-[80%] p-2.5 rounded-[10px] border border-white/12 whitespace-pre-wrap ${
                m.role === 'assistant'
                  ? 'bg-slate-900/90 mr-auto'
                  : 'bg-indigo-900/90 ml-auto'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex mb-2.5">
            <div className="max-w-[80%] p-2.5 rounded-[10px] bg-slate-900/90 border border-white/12">
              <TypingDots />
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask something..."
          rows={3}
          className="flex-1 resize-vertical p-2.5 rounded-lg border border-white/15 bg-black/40 text-white chat-input"
        />
        <button
          className="text-white disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => sendMessage()}
          disabled={!canSend}
        >
          Send
        </button>
      </div>
      <div className="opacity-70 text-xs">Press ⌘/Ctrl + Enter to send</div>
    </div>
  )
}
