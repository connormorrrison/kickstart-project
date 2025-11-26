import React from "react"
import { cn } from "@/lib/utils"

interface Text4Props extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
}

export const Text4 = ({ children, className, ...props }: Text4Props) => {
  return (
    <p
      className={cn(
        "!block !text-base !font-normal !text-zinc-400",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}
