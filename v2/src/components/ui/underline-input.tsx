import * as React from "react"

import { cn } from "@/lib/utils"

function UnderlineInput({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="underline-input"
      className={cn(
        "h-9 w-full min-w-0 border-0 border-b border-input bg-transparent px-0 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className
      )}
      {...props}
    />
  )
}

function UnderlineTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="underline-textarea"
      className={cn(
        "flex min-h-8 w-full resize-none border-0 border-b border-input bg-transparent px-0 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive field-sizing-content md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { UnderlineInput, UnderlineTextarea }
