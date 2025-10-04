"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SwitchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        ref={ref}
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          onCheckedChange?.(!checked)
        }}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          "bg-input data-[state=checked]:bg-primary",
          className
        )}
        {...props}
      >
        <span
          data-state={checked ? "checked" : "unchecked"}
          className="pointer-events-none block h-5 w-5 translate-x-0 rounded-full bg-background shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-5"
        />
      </button>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }
