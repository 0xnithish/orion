"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
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
import { Home, Search, MessageSquare, User, Settings, LogOut, SquarePen } from "lucide-react"

export function AppSidebar() {
  const { isAuthenticated, logout, getAuthData } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    return null
  }

  const authData = getAuthData()
  const userName = authData?.name || "User"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <SidebarTrigger />
          <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent group-data-[collapsible=icon]:hidden">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => router.push("/chat")}>
              <SquarePen className="h-4 w-4" />
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
  )
}
