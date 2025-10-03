"use client"

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,

  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Home, Users, Settings, BarChart3, Package, FileText, CreditCard, User } from 'lucide-react'

export default function DashboardPage() {
  const { logout, getAuthData, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null // User will be redirected by the useAuth hook
  }

  const authData = getAuthData()

  if (!authData) {
    return null
  }

  const handleLogout = () => {
    logout()
  }


  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1">
              <Image src="logo/logo_light.svg" alt="Logo" width={24} height={24} className="h-6 w-6" />
              <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Gemma</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel></SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-border">
            <div className="px-2 py-1 flex items-center justify-between group-data-[collapsible=icon]:flex-col">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="truncate group-data-[collapsible=icon]:hidden">{authData.name}</span>
              </div>
              <SidebarTrigger />
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}