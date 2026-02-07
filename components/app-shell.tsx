"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
  Search, Home, Heart, ShieldCheck, Activity,
  ChefHat, BookOpen, FileText, User, Settings,
  MoreHorizontal, X, BarChart3, CreditCard, ShieldAlert
} from "lucide-react"
import { ScanHub } from "./scan-hub"
import { Dashboard } from "./dashboard"
import { BoundariesPanel } from "./boundaries-panel"
import SafeList from "./safe-list"
import BlockedList from "./blocked-list"
import { MealPlanner } from "./meal-planner"
import { KnowledgeHub } from "./knowledge-hub"
import { MyNotes } from "./my-notes"
import { EditProfile } from "./edit-profile"
import { SettingsPanel } from "./settings-panel"
import ZenHealth from "./zen-health"
import { BrandLogo } from "./brand-logo"
import ZenHabits from "./zen-habits"
import EmergencyButton from "./emergency-button"
import { InsightsPanel } from "./insights-panel"
import { SubscriptionPanel } from "./subscription-panel"
import BusinessTab from "./business-tab"
import { cn } from "@/lib/utils"
import userProfile, { THEME_COLORS, ThemeColor } from "@/lib/profile"

type TabId = "scan" | "safe" | "home" | "boundaries" | "zenhealth" | "blocked" | "meals" | "knowledge" | "notes" | "habits" | "emergency" | "profile" | "settings" | "insights" | "subscription" | "business"

interface TabConfig {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  primary: boolean
  color?: string
  emoji?: string
}

const TABS: TabConfig[] = [
  { id: "scan", label: "Scan", icon: Search, primary: true },
  { id: "safe", label: "Safe", icon: ShieldCheck, primary: true, color: "text-green-500" },
  { id: "home", label: "Home", icon: Home, primary: true },
  { id: "boundaries", label: "ED", icon: Heart, primary: true, color: "text-blue-500", emoji: "blue_heart" },
  { id: "zenhealth", label: "ZenHealth", icon: Activity, primary: true, color: "text-purple-500", emoji: "purple_heart" },
  { id: "business", label: "Handshake", icon: ShieldCheck, primary: false },
  { id: "blocked", label: "Blocked List", icon: ShieldCheck, primary: false },
  { id: "meals", label: "Meal Generator", icon: ChefHat, primary: false },
  { id: "knowledge", label: "Knowledge Hub", icon: BookOpen, primary: false },
  { id: "notes", label: "My allerZEN Notes", icon: FileText, primary: false },
  { id: "habits", label: "Zen Habits", icon: Activity, primary: false },
  { id: "emergency", label: "Emergency Relief", icon: Heart, primary: false },
  { id: "profile", label: "Edit Profile", icon: User, primary: false },
  { id: "settings", label: "Settings", icon: Settings, primary: false },
  { id: "insights", label: "Usage Insights", icon: BarChart3, primary: false },
  { id: "subscription", label: "Subscription", icon: CreditCard, primary: false },
]

const PRIMARY_TABS = TABS.filter(t => t.primary)
const SECONDARY_TABS = TABS.filter(t => !t.primary)

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("home")
  const [showMoreDrawer, setShowMoreDrawer] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isShieldActive, setIsShieldActive] = useState(false)
  const [theme, setTheme] = useState<ThemeColor>("purple")

  useEffect(() => {
    setMounted(true)
    
    const syncWithProfile = () => {
      const activeProfile = userProfile.getActiveProfile()
      const currentTheme = activeProfile?.themeColor || "purple"
      setTheme(currentTheme)
      setIsShieldActive(userProfile.isProtectionActive())
      
      // Update CSS variables for global theme "stickiness"
      const colors = THEME_COLORS[currentTheme]
      document.documentElement.style.setProperty('--profile-theme', colors.primary)
      document.documentElement.style.setProperty('--profile-accent', colors.accent)
      document.documentElement.style.setProperty('--profile-bg', colors.bg)
    }

    syncWithProfile()
    const interval = setInterval(() => {
        setIsShieldActive(userProfile.isProtectionActive())
    }, 2000)

    window.addEventListener("themeChanged", syncWithProfile)
    window.addEventListener("profileSwitched", syncWithProfile)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener("themeChanged", syncWithProfile)
      window.removeEventListener("profileSwitched", syncWithProfile)
    }
  }, [])

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId)
    setShowMoreDrawer(false)
  }

  const goHome = () => handleTabChange("home")
  const goToSafe = () => handleTabChange("safe")
  
  const renderContent = () => {
    switch (activeTab) {
      case "scan": return <ScanHub onNavigateToSafe={goToSafe} />
      case "safe": return <SafeList onBack={goHome} />
      case "home": return <Dashboard onNavigate={handleTabChange} />
      case "business": return <BusinessTab onBack={goHome} />
      case "boundaries": return <BoundariesPanel />
      case "zenhealth": return <ZenHealth onBack={goHome} />
      case "blocked": return <BlockedList onBack={goHome} />
      case "meals": return <MealPlanner />
      case "knowledge": return <KnowledgeHub />
      case "notes": return <MyNotes />
      case "habits": return <ZenHabits onBack={goHome} />
      case "emergency": return <EmergencyButton onBack={goHome} />
      case "profile": return <EditProfile />
      case "settings": return <SettingsPanel />
      case "insights": return <InsightsPanel />
      case "subscription": return <SubscriptionPanel />
      default: return <Dashboard onNavigate={handleTabChange} />
    }
  }

  if (!mounted) return <div className="min-h-screen bg-white" />

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Active Shield Indicator (v0 view.html style) */}
      {isShieldActive && (
        <div 
          onClick={() => handleTabChange("business")}
          className="fixed top-4 right-4 z-[60] flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md border border-blue-200 cursor-pointer animate-in fade-in zoom-in"
        >
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Shield Active</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto p-4 sm:p-6">
          {renderContent()}
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 pb-safe">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
          {PRIMARY_TABS.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isCenter = index === 2
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-all relative",
                  isActive ? (tab.color || "text-[var(--profile-theme)]") : "text-gray-400"
                )}
              >
                {isCenter ? (
                  <div className={cn(
                    "absolute -top-5 p-3.5 rounded-full transition-all shadow-xl border-4 border-white",
                    isActive ? "bg-[var(--profile-theme)] text-white scale-110" : "bg-gray-100 text-gray-400"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                ) : (
                  <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                )}
                <span className={cn("text-[10px] mt-1 font-bold uppercase tracking-tighter", isCenter && "mt-7")}>
                  {tab.label}
                </span>
              </button>
            )
          })}
          
          <button
            onClick={() => setShowMoreDrawer(true)}
            className={cn("flex flex-col items-center justify-center flex-1 h-full text-gray-400")}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">More</span>
          </button>
        </div>
      </nav>

      {/* More Drawer */}
      {showMoreDrawer && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={() => setShowMoreDrawer(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[51] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="max-w-lg mx-auto">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="grid grid-cols-2 gap-3 mb-8">
                {SECONDARY_TABS.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-gray-500" />
                      <span className="font-bold text-sm text-gray-700">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
