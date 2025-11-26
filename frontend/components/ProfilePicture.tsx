import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfilePictureProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
}

export const ProfilePicture = ({ size = 'md', className }: ProfilePictureProps) => {
  return (
    <div
      className={cn(
        "rounded-full bg-gray-400 flex items-center justify-center shrink-0",
        sizeClasses[size],
        className
      )}
    >
      <User size={iconSizes[size]} className="text-white" />
    </div>
  )
}
