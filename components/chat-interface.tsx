"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Copy, Check, Paperclip, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { useChatStore, type Message } from "@/hooks/use-chat-store"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const dummyResponses = [
  "That's an interesting question! Based on my analysis, I would suggest exploring multiple approaches to find the best solution.",
  "I understand what you're asking. Let me break this down for you in a clear and structured way.",
  "Great question! Here's what I think: This requires careful consideration of several factors.",
  "I can help you with that. The key here is to focus on the fundamentals and build from there.",
  "Thanks for sharing that! From my perspective, the most important thing to consider is the long-term impact.",
  "Absolutely! I've processed your request and here's my recommendation based on current best practices.",
  "That's a valid point. Let me provide you with a comprehensive answer that covers all aspects.",
  "Interesting approach! I would add that it's also important to consider alternative solutions.",
]

const suggestionPrompts = [
  "What are the advantages of using Next.js?",
  "Write code to demonstrate Dijkstra's algorithm",
  "Help me write an essay about Silicon Valley",
  "What is the weather in San Francisco?",
]

const formatTimestamp = (date: Date | string): string => {
  const now = new Date()
  const messageDate = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`

  return messageDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

const generateDummyMessages = (count: number, startId: number): Message[] => {
  const messages: Message[] = []
  const sampleContents = [
    "Can you explain how React hooks work?",
    "Sure! React hooks are functions that let you use state and lifecycle features in functional components.",
    "What's the difference between useMemo and useCallback?",
    "useMemo memoizes values, while useCallback memoizes functions. Both help optimize performance.",
    "How do I optimize my Next.js app?",
    "Great question! Consider implementing code splitting, image optimization, and using the built-in Image component.",
  ]

  for (let i = 0; i < count; i++) {
    const isUser = i % 2 === 0
    const hoursAgo = count - i
    const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)

    messages.push({
      id: (startId + i).toString(),
      role: isUser ? "user" : "assistant",
      content: sampleContents[i % sampleContents.length],
      timestamp,
    })
  }

  return messages
}

interface ChatInterfaceProps {
  chatId?: string | null
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const { getAuthData } = useAuth()
  const authData = getAuthData()
  const userName = authData?.name || "User"

  const { getChatById, updateChat, setCurrentChat, currentChatId, createChat } = useChatStore()

  const [messages, setMessages] = useState<Message[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesStartRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load chat on mount or when chatId changes
  useEffect(() => {
    if (chatId) {
      const chat = getChatById(chatId)
      if (chat) {
        setMessages(chat.messages)
        setActiveChatId(chatId)
        setCurrentChat(chatId)
      }
    } else {
      // No chatId, start fresh
      setMessages([])
      setActiveChatId(null)
    }
  }, [chatId, getChatById, setCurrentChat])

  // Save messages to store whenever they change
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      updateChat(activeChatId, messages)
    }
  }, [messages, activeChatId, updateChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    const newHeight = textarea.scrollHeight
    textarea.style.height = `${newHeight}px`

    // Show scrollbar only when max height is reached
    if (newHeight >= 200) {
      textarea.style.overflow = "auto"
    } else {
      textarea.style.overflow = "hidden"
    }
  }, [input])

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current
      if (!container || isLoadingMore || !hasMore) return

      if (container.scrollTop === 0 && messages.length > 0) {
        loadMoreMessages()
      }
    }

    const container = scrollContainerRef.current
    container?.addEventListener("scroll", handleScroll)
    return () => container?.removeEventListener("scroll", handleScroll)
  }, [isLoadingMore, hasMore, messages.length])

  const loadMoreMessages = () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const currentScrollHeight = scrollContainerRef.current?.scrollHeight || 0

    setTimeout(() => {
      const oldestId = messages.length > 0 ? parseInt(messages[0].id) : 1000
      const olderMessages = generateDummyMessages(20, oldestId - 20)

      setMessages((prev) => [...olderMessages, ...prev])
      setPage((prev) => prev + 1)
      setIsLoadingMore(false)

      if (page >= 3) {
        setHasMore(false)
      }

      setTimeout(() => {
        const container = scrollContainerRef.current
        if (container) {
          const newScrollHeight = container.scrollHeight
          container.scrollTop = newScrollHeight - currentScrollHeight
        }
      }, 0)
    }, 1000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(messageId)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  const sendMessage = (content: string) => {
    if ((!content.trim() && !uploadedImage) || isLoading) return

    // Create new chat if none exists
    if (!activeChatId) {
      const newChatId = createChat()
      setActiveChatId(newChatId)
      // Update URL without reload
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/chat?id=${newChatId}`)
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      image: uploadedImage || undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setIsLoading(true)

    const delay = Math.floor(Math.random() * 2000) + 2000

    setTimeout(() => {
      const randomResponse = dummyResponses[Math.floor(Math.random() * dummyResponses.length)]
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
      textareaRef.current?.focus()
    }, delay)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
    // Shift+Enter creates new lines
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl">
            {isLoadingMore && (
              <div ref={messagesStartRef} className="mb-4 flex justify-center">
                <div className="text-sm text-muted-foreground">Loading older messages...</div>
              </div>
            )}

            {messages.length === 0 && !isLoading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
              <div className="space-y-2 text-center">
                <h1 className="text-4xl font-bold">Hello {userName}!</h1>
                <p className="text-lg text-muted-foreground">
                  What should we do today?
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div className="relative group">
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {message.image && (
                          <img
                            src={message.image}
                            alt="Uploaded"
                            className="mb-2 max-w-full rounded-md"
                          />
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>

                      {message.role === "assistant" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleCopy(message.content, message.id)}
                              className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedId === message.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy message</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    <span className="text-xs text-muted-foreground px-1">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="rounded-lg bg-muted px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Gemini is typing</span>
                        <div className="flex gap-1">
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.3s]"></div>
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.15s]"></div>
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

        <div className="bg-background px-4 py-4">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            {uploadedImage && (
              <div className="mb-3 relative inline-block">
                <img
                  src={uploadedImage}
                  alt="Preview"
                  className="max-h-32 rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="relative flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="h-[44px] w-[44px]"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach image</p>
                </TooltipContent>
              </Tooltip>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                disabled={isLoading}
                rows={1}
                style={{ overflow: 'hidden' }}
                className="max-h-[200px] flex-1 resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={(!input.trim() && !uploadedImage) || isLoading}
                size="icon"
                className="h-[44px] w-[44px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  )
}
