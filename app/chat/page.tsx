"use client"

import { Suspense } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useSearchParams } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { LayoutHeader } from "@/components/layout-header"

function ChatPageContent() {
  const searchParams = useSearchParams()
  const chatId = searchParams.get('id')

  return (
    <div className="flex h-full flex-col">
      <LayoutHeader />
      <div className="flex-1 overflow-hidden">
        <ChatInterface chatId={chatId} />
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-foreground"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Suspense fallback={
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-foreground"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}
