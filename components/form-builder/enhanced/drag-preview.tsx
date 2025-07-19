import { memo } from "react"
import { DragOverlay } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { FormElement } from "../elements"

interface EnhancedDragPreviewProps {
  formElement: FormElement | null
  isDragging: boolean
}

function EnhancedDragPreview({ formElement, isDragging }: EnhancedDragPreviewProps) {
  if (!formElement || !isDragging) return null

  const { label, icon: Icon } = formElement.designerButtonElement

  return (
    <DragOverlay>
      <div className={cn(
        "flex flex-col gap-2 h-[120px] w-[120px] rounded-md border-2 border-primary bg-background/95 backdrop-blur-sm shadow-2xl transition-all duration-200",
        "ring-4 ring-primary/20 scale-105"
      )}>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-3">
          <div className="relative">
            <Icon className="h-8 w-8 text-primary" />
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm -z-10" />
          </div>
          <p className="text-xs font-medium text-center leading-tight">{label}</p>
        </div>
        
        {/* Drag indicator */}
        <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-b-md" />
      </div>
    </DragOverlay>
  )
}

export default memo(EnhancedDragPreview)

// Enhanced drag overlay wrapper for better visual feedback
export function EnhancedDragOverlayWrapper({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn(
      "relative transform-gpu transition-all duration-200 ease-out",
      "drop-shadow-2xl",
      className
    )}>
      {children}
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary/10 rounded-md blur-xl -z-10 scale-110" />
      
      {/* Pulse animation */}
      <div className="absolute inset-0 bg-primary/5 rounded-md animate-pulse -z-10" />
    </div>
  )
}