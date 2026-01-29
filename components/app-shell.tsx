"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
  Search, Home, Heart, ShieldCheck, Activity,
  ChefHat, BookOpen, FileText, User, Settings,
  MoreHorizontal, X, BarChart3, CreditCard
} from "lucide-react"
import { ScanHub } from "./scan-hub"
import { Dashboard } from "./dashboard"
import { BoundariesPanel } from "./boundaries-panel"
import { SafeList } from "./safe-list"
import { BlockedList } from "./blocked-list"
import { MealPlanner } from "./meal-planner"
import { KnowledgeHub } from "./knowledge-hub"
import { MyNotes } from "./my-notes"
import { EditProfile } from "./edit-profile"
import { SettingsPanel } from "./settings-panel"
import { ZenHealth } from "./zen-health"
import { BrandLogo } from "./brand-logo"
import { ZenHabits } from "./zen-habits"
import { EmergencyButton } from "./emergency-button"
import { InsightsPanel } from "./insights-panel"
import { SubscriptionPanel } from "./subscription-panel"
import { BusinessTab } from "./business-tab"
import { cn } from "@/lib/utils"

type TabId = "scan" | "safe" | "home" | "boundaries" | "zenhealth" | "blocked" | "meals" | "knowledge" | "notes" | "habits" | "emergency" | "profile" | "settings" | "insights" | "subscription" | "business"

interface TabConfig {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  primary: boolean
  color?: string
  emoji?: string
}

console.log("[v0] App Shell module loading...")

// Calm greeting quotes
const ZEN_GREETINGS = [
  "Safety and serenity, hand in hand.",
  "Your wellness journey continues beautifully.",
  "Every mindful choice brings peace.",
  "You're doing amazing - one scan at a time.",
  "Trust your instincts, they're serving you well.",
  "Small steps lead to big wellness wins.",
  "Your health matters. You matter.",
  "Breathe easy knowing you're protected.",
  "Today is another day of mindful living.",
  "Your body thanks you for being vigilant."
]

// 5-Tab Sanctuary: Scan, Safe, HOME (center), Boundaries, ZenHealth
const TABS: TabConfig[] = [
  { id: "scan", label: "Scan", icon: Search, primary: true },
  { id: "safe", label: "Safe", icon: ShieldCheck, primary: true, color: "text-green-500" },
  { id: "home", label: "Home", icon: Home, primary: true }, // CENTER (3rd position)
  { id: "boundaries", label: "ED", icon: Heart, primary: true, color: "text-blue-500", emoji: "blue_heart" },
  { id: "zenhealth", label: "ZenHealth", icon: Activity, primary: true, color: "text-purple-500", emoji: "purple_heart" },
  // Secondary tabs in "More" drawer
  { id: "business", label: "Business Handshake", icon: ShieldCheck, primary: false },
  { id: "blocked", label: "Blocked List", icon: ShieldCheck, primary: false },
  { id: "meals", label: "Meal Generator", icon: ChefHat, primary: false },
  { id: "knowledge", label: "Knowledge Hub", icon: BookOpen, primary: false },
  { id: "notes", label: "My allerZEN Notes", icon: FileText, primary: false },
  { id: "habits", label: "Zen Habits", icon: Activity, primary: false },
  { id: "emergency", label: "Emergency Relief", icon: Heart, primary: false },
  { id: "profile", label: "Edit Profile", icon: User, primary: false },
  { id: "settings", label: "Settings", icon: Settings, primary: false },
  // Moved to bottom of More tab per spec
  { id: "insights", label: "Usage Insights", icon: BarChart3, primary: false },
  { id: "subscription", label: "Subscription", icon: CreditCard, primary: false },
]

const PRIMARY_TABS = TABS.filter(t => t.primary)
const SECONDARY_TABS = TABS.filter(t => !t.primary)

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("home")
  const [showMoreDrawer, setShowMoreDrawer] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState("Friend")
  const [sensitivityCount, setSensitivityCount] = useState(0)

  // Stable greeting per session
  const greeting = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * ZEN_GREETINGS.length)
    return ZEN_GREETINGS[randomIndex]
  }, [])

  useEffect(() => {
    setMounted(true)
    // Load user name from profile
    try {
      const stored = localStorage.getItem("allergyzen_user_profile")
      if (stored) {
        const profile = JSON.parse(stored)
        if (profile?.name) {
          setUserName(profile.name)
        }
        // Count actual user-selected sensitivities (not pre-populated)
        if (profile?.selectedAllergies) {
          setSensitivityCount(profile.selectedAllergies.length)
        }
      }
      // Also check family profiles
      const familyStored = localStorage.getItem("allergyzen_family_profiles")
      if (familyStored) {
        const familyData = JSON.parse(familyStored)
        const activeIndex = familyData.session?.activeProfileIndex || 0
        const activeProfile = familyData.profiles?.[activeIndex]
        if (activeProfile?.name) {
          setUserName(activeProfile.name)
        }
      }
    } catch {
      // Ignore
    }
  }, [])

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId)
    setShowMoreDrawer(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "scan":
        return <ScanHub />
      case "safe":
        return <SafeList />
      case "home":
        return <Dashboard onNavigate={handleTabChange} />
      case "business":
        return <BusinessTab />
      case "boundaries":
        return <BoundariesPanel />
      case "zenhealth":
        return <ZenHealth />
      case "blocked":
        return <BlockedList />
      case "meals":
        return <MealPlanner />
      case "knowledge":
        return <KnowledgeHub />
      case "notes":
        return <MyNotes />
      case "habits":
        return <ZenHabits />
      case "emergency":
        return <EmergencyButton />
      case "profile":
        return <EditProfile />
      case "settings":
        return <SettingsPanel />
      case "insights":
        return <InsightsPanel />
      case "subscription":
        return <SubscriptionPanel />
      default:
        return <Dashboard />
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-white animate-pulse" />
  }

  const activeTabConfig = TABS.find(t => t.id === activeTab)
  const isSecondaryTab = activeTabConfig && !activeTabConfig.primary

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header removed - content now renders cleanly without overlap */}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-lg mx-auto p-4">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation - 5 Primary tabs with HOME as CENTER */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-gray-200 z-50 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {PRIMARY_TABS.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isCenter = index === 2 // Home is center (3rd position, index 2)
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-all relative",
                  isActive 
                    ? tab.color || "text-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {isCenter ? (
                  // Home button - elevated center design
                  <div className={cn(
                    "absolute -top-4 p-3 rounded-full transition-all shadow-lg",
                    isActive 
                      ? "bg-purple-600 text-white scale-110" 
                      : "bg-white border-2 border-purple-300 text-purple-600"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                ) : (
                  <Icon className={cn(
                    "w-5 h-5 transition-transform",
                    isActive && "scale-110",
                    tab.color && isActive && tab.color
                  )} />
                )}
                <span className={cn(
                  "text-xs mt-1 font-semibold",
                  isCenter && "mt-6"
                )}>
                  {tab.label}
                </span>
                {isActive && !isCenter && (
                  <div className={cn(
                    "absolute bottom-0 w-8 h-1 rounded-t-full",
                    tab.color === "text-blue-500" ? "bg-blue-500" : 
                    tab.color === "text-green-500" ? "bg-green-500" :
                    tab.color === "text-purple-500" ? "bg-purple-500" : "bg-purple-600"
                  )} />
                )}
              </button>
            )
          })}
          
          {/* More Button */}
          <button
            onClick={() => setShowMoreDrawer(true)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-all",
              isSecondaryTab 
                ? "text-purple-600" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs mt-1 font-semibold">More</span>
            {isSecondaryTab && (
              <div className="absolute bottom-0 w-8 h-1 bg-purple-600 rounded-t-full" />
            )}
          </button>
        </div>
      </nav>

      {/* More Drawer */}
      {showMoreDrawer && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowMoreDrawer(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 animate-in slide-in-from-bottom duration-300">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">More Options</h3>
                <button 
                  onClick={() => setShowMoreDrawer(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {SECONDARY_TABS.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                        isActive
                          ? "border-purple-500 bg-purple-50 text-purple-600"
                          : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold text-sm">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
              <div className="p-4 pt-0">
                <p className="text-xs text-center text-gray-400">
                  Tap outside to close
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
