"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { useChatStore } from "@/hooks/use-chat-store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Home, Search, MessageSquare, User, Settings, LogOut, SquarePen, Trash2, MoreHorizontal } from "lucide-react"
import { useState, useEffect } from "react"

export function AppSidebar() {
  const { isAuthenticated, logout, getAuthData } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentChatId = searchParams.get('id')
  
  const { getRecentChats, createChat, deleteChat, chats } = useChatStore()
  const recentChats = getRecentChats()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  if (!isAuthenticated) {
    return null
  }

  const authData = getAuthData()
  const userName = authData?.name || "User"

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return chat.title.toLowerCase().includes(query) ||
           chat.messages.some(msg => msg.content.toLowerCase().includes(query))
  })

  const handleNewChat = () => {
    const newChatId = createChat()
    router.push(`/chat?id=${newChatId}`)
  }

  const handleChatClick = (chatId: string) => {
    router.push(`/chat?id=${chatId}`)
  }

  const handleSearchChatClick = (chatId: string) => {
    handleChatClick(chatId)
    setSearchDialogOpen(false)
    setSearchQuery("")
  }

  const confirmDelete = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete)
      if (currentChatId === chatToDelete) {
        router.push('/chat')
      }
    }
    setDeleteDialogOpen(false)
    setChatToDelete(null)
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
            <SidebarTrigger />
            <button 
              onClick={() => setSearchDialogOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent group-data-[collapsible=icon]:hidden"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="px-2">
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleNewChat}>
                <SquarePen className="h-4 w-4" />
                <span>New Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="group-data-[collapsible=icon]:hidden">
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent
              </h3>
            </div>

            <SidebarMenu className="px-2">
              {recentChats.length === 0 ? (
                <div className="px-3 py-2 text-xs truncate text-muted-foreground">
                  No recent chats
                </div>
              ) : (
                recentChats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <div className="group/item relative flex items-center">
                      <SidebarMenuButton
                        onClick={() => handleChatClick(chat.id)}
                        className={`flex-1 ${currentChatId === chat.id ? "bg-accent" : ""}`}
                      >
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <span 
                          className="truncate flex-1 text-left pr-8"
                          style={{
                            maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
                          }}
                        >
                          {chat.title}
                        </span>
                      </SidebarMenuButton>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-2 opacity-0 group-hover/item:opacity-100 hover:bg-accent rounded-md p-1.5 transition-opacity"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => {
                              setChatToDelete(chat.id)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </div>
        </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-2 hover:bg-accent w-full group-data-[collapsible=icon]:justify-center">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate min-w-0 group-data-[collapsible=icon]:hidden">
                {userName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chat</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this chat? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Search Chats</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search by chat title or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full"
          />
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery.trim() ? "No chats found" : "No chats available"}
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSearchChatClick(chat.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium truncate flex-1">{chat.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chat.messages.length} {chat.messages.length === 1 ? 'message' : 'messages'}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
