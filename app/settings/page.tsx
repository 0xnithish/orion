"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/hooks/use-auth"
import { useAuthStore } from "@/hooks/use-auth-store"
import { toast } from "sonner"
import { LayoutHeader } from "@/components/layout-header"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { getAuthData } = useAuth()
  const { setAuthData } = useAuthStore()
  const authData = getAuthData()

  const [name, setName] = useState(authData?.name || "")
  const [phone, setPhone] = useState(authData?.phone || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty")
      return
    }

    if (!phone.match(/^\d{10}$/)) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    setIsSaving(true)
    
    // Simulate save delay
    setTimeout(() => {
      if (authData) {
        setAuthData({
          ...authData,
          name: name.trim(),
          phone: phone,
        })
        toast.success("Settings saved successfully")
      }
      setIsSaving(false)
    }, 500)
  }

  return (
    <div className="flex h-full flex-col">
      <LayoutHeader />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-2xl p-6 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          <Separator />

          {/* Profile Settings */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Profile</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                  />
                </div>

                <Button onClick={handleSave} disabled={isSaving} variant="default">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Theme Settings */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Appearance</h2>
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-3">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex-1"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex-1"
                  >
                    Dark
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
