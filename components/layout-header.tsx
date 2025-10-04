"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Moon, Sun, User, Settings, LogOut } from "lucide-react"

export function LayoutHeader() {
  const { isAuthenticated, logout, getAuthData } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  if (!isAuthenticated) {
    return null
  }

  const authData = getAuthData()
  const userName = authData?.name || "User"

  return (
    <header className="flex h-14 items-center gap-4 px-4">
      {/* Mobile menu trigger - only visible on mobile */}
      <SidebarTrigger className="md:hidden" />
      
      {/* Spacer to push right-side items to the end */}
      <div className="flex-1" />
      
      {/* Right side - theme and user menu */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm font-medium">
              {userName}
            </div>
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
      </div>
    </header>
  )
}
