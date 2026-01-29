"use client"

import { cn } from "@/lib/utils"
import { 
  Home, 
  Scan, 
  Heart,
  Leaf, 
  AlertTriangle, 
  UtensilsCrossed,
  BookOpen,
  NotebookPen,
  UserCog,
  Settings,
  MoreHorizontal,
  X
} from "lucide-react"
import { useWellnessStore } from "@/lib/wellness-store"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { brandShieldAlert } = useWellnessStore()
  const [moreOpen, setMoreOpen] = useState(false)

  // Primary tabs (bottom bar) - 5 most important
  const primaryTabs = [
    { id: "scanner", label: "Scan", icon: Scan, highlight: true },
    { id: "dashboard", label: "Home", icon: Home },
    { id: "boundaries", label: "ED", icon: Heart, color: "text-blue-500" },
    { id: "green-zone", label: "Safe", icon: Leaf },
    { id: "allergens", label: "Blocked", icon: AlertTriangle },
  ]

  // Secondary tabs (More drawer) - 5 additional
  const secondaryTabs = [
    { id: "meal-plan", label: "Meal Generator", icon: UtensilsCrossed },
    { id: "knowledge", label: "Knowledge Hub", icon: BookOpen },
    { id: "notes", label: "My Notes", icon: NotebookPen },
    { id: "profile", label: "Edit Profile", icon: UserCog },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId)
    setMoreOpen(false)
  }

  const isActiveInMore = secondaryTabs.some(tab => tab.id === activeTab)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom shadow-lg z-50">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {primaryTabs.map((tab) => {
            const isActive = activeTab === tab.id
            const isScanButton = tab.id === "scanner"

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 px-3 transition-all",
                  isActive ? "text-primary" : "text-muted-foreground",
                  isScanButton && "relative",
                )}
              >
                {isScanButton ? (
                  <div
                    className={cn(
                      "absolute -top-5 p-3 rounded-full transition-all shadow-lg",
                      isActive ? "bg-primary text-primary-foreground" : "bg-card border-2 border-primary text-primary",
                      brandShieldAlert && "bg-destructive border-destructive text-destructive-foreground animate-pulse",
                    )}
                  >
                    <tab.icon className="w-6 h-6" />
                  </div>
                ) : (
                  <tab.icon className={cn(
                    "w-5 h-5", 
                    isActive && "text-primary",
                    tab.color && !isActive && tab.color
                  )} />
                )}
                <span className={cn(
                  "text-xs font-medium", 
                  isScanButton && "mt-5",
                  tab.color && !isActive && tab.color
                )}>
                  {tab.label}
                </span>
              </button>
            )
          })}

          {/* More button */}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 px-3 transition-all",
                  isActiveInMore ? "text-primary" : "text-muted-foreground",
                )}
              >
                <MoreHorizontal className={cn("w-5 h-5", isActiveInMore && "text-primary")} />
                <span className="text-xs font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[60vh]">
              <SheetHeader className="pb-4">
                <SheetTitle className="text-left">More Options</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-4 pb-8">
                {secondaryTabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                        isActive 
                          ? "bg-primary/10 text-primary border border-primary/30" 
                          : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <tab.icon className={cn("w-6 h-6", isActive && "text-primary")} />
                      <span className="text-xs font-medium text-center">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  )
}
