"use client"

import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  image?: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatState {
  chats: Chat[]
  currentChatId: string | null
  hasHydrated: boolean
  
  createChat: () => string
  deleteChat: (chatId: string) => void
  updateChat: (chatId: string, messages: Message[]) => void
  setCurrentChat: (chatId: string) => void
  getChatById: (chatId: string) => Chat | undefined
  getRecentChats: () => Chat[]
  setHydrated: (value: boolean) => void
}

const generateChatTitle = (messages: Message[]): string => {
  const firstUserMessage = messages.find(m => m.role === "user")
  if (!firstUserMessage) return "New Chat"
  
  const title = firstUserMessage.content.trim()
  return title.length > 40 ? title.substring(0, 40) + "..." : title
}

const createStorage = () => {
  if (typeof window === 'undefined') {
    const memoryStorage: StateStorage = {
      getItem: () => null,
      setItem: () => void 0,
      removeItem: () => void 0
    }
    return memoryStorage
  }

  return window.localStorage
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      hasHydrated: false,

      createChat: () => {
        const newChatId = `chat-${Date.now()}`
        const newChat: Chat = {
          id: newChatId,
          title: "New Chat",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }

        set((state) => {
          const updatedChats = [newChat, ...state.chats]
          
          // Keep only 20 most recent chats
          if (updatedChats.length > 20) {
            updatedChats.pop()
          }

          return {
            chats: updatedChats,
            currentChatId: newChatId
          }
        })

        return newChatId
      },

      deleteChat: (chatId: string) => {
        set((state) => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId
        }))
      },

      updateChat: (chatId: string, messages: Message[]) => {
        set((state) => {
          const chatIndex = state.chats.findIndex(c => c.id === chatId)
          if (chatIndex === -1) return state

          const updatedChats = [...state.chats]
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            messages,
            title: generateChatTitle(messages),
            updatedAt: new Date()
          }

          // Move updated chat to top
          const [updatedChat] = updatedChats.splice(chatIndex, 1)
          updatedChats.unshift(updatedChat)

          return { chats: updatedChats }
        })
      },

      setCurrentChat: (chatId: string) => {
        set({ currentChatId: chatId })
      },

      getChatById: (chatId: string) => {
        return get().chats.find(chat => chat.id === chatId)
      },

      getRecentChats: () => {
        return get().chats.slice(0, 10)
      },

      setHydrated: (value: boolean) => {
        set({ hasHydrated: value })
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(createStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      }
    }
  )
)
