"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, ChevronRight, Info, Shield, AlertTriangle, 
  RefreshCw, Clock, CheckCircle2, Zap, Scan, Camera
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { useWellnessStore } from "@/lib/wellness-store"
import {
  ALLERGY_CATEGORIES,
  getFullSensitivityCount,
  getDetailedTriggerList,
  type UserProfile,
} from "@/lib/user-profile"
import { TrialBanner } from "./trial-banner"
import { UpgradeModal } from "./upgrade-modal"
import { StatusDot } from "./status-dot"
import { DeepListModal } from "./deep-list-modal"
import { SensitivityDetailModal } from "./sensitivity-detail-modal"
import { AllergenQuickSearch } from "./allergen-quick-search"
// ProtectionTimer moved to BusinessTab
import userProfile from "@/lib/profile"

// Calm greeting quotes
const ZEN_GREETINGS = [
  "Safety and serenity, hand in hand.",
  "Your wellness journey continues beautifully.",
  "Every mindful choice brings peace.",
  "You're doing amazing - one scan at a time.",
  "Trust your instincts, they're serving you well.",
]

interface DashboardProps {
  onNavigate?: (tab: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showDeepList, setShowDeepList] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<{
    name: string
    category: string
    severity: "high" | "moderate" | "safe"
  } | null>(null)
  const [userName, setUserName] = useState("Friend")
  const [userPhoto, setUserPhoto] = useState<string | null>(null)

  const brandShieldAlert = useWellnessStore((state) => state.brandShieldAlert)
  const lastScanResult = useWellnessStore((state) => state.lastScanResult)

  const greeting = useMemo(() => {
    const idx = Math.floor(Math.random() * ZEN_GREETINGS.length)
    return ZEN_GREETINGS[idx]
  }, [])

  useEffect(() => {
    setMounted(true)
    loadProfile()
  }, [])

  const loadProfile = () => {
    try {
      const stored = localStorage.getItem("allergyzen_user_profile")
      if (stored) {
        const p = JSON.parse(stored)
        setProfile(p)
        if (p?.name) setUserName(p.name)
      }
      // Check family profiles for active user
      const activeProfile = userProfile.getActiveProfile()
      if (activeProfile?.name) {
        setUserName(activeProfile.name)
      }
      // Load profile photo
      const photo = userProfile.getProfilePhoto()
      if (photo) {
        setUserPhoto(photo)
      }
    } catch {
      // Ignore
    }
  }

  const totalTriggerCount = useMemo(() => {
    if (!mounted) return 0
    return getFullSensitivityCount()
  }, [mounted, profile])

  const triggerListItems = useMemo(() => {
    if (!mounted) return []
    return getDetailedTriggerList()
  }, [mounted, profile])

  const handleCategoryClick = useCallback((categoryId: string) => {
    const category = ALLERGY_CATEGORIES.find((c) => c.id === categoryId)
    if (category) {
      setSelectedCategory({
        name: category.name,
        category: "Food Sensitivity",
        severity: "high",
      })
    }
  }, [])

  const handleAllergenSelect = useCallback(
    (item: { name: string; category: string; severity: "high" | "moderate" | "safe" }) => {
      setSelectedCategory(item)
    },
    [],
  )

  const selectedCategoryData = profile?.selectedAllergies || []
  const displayCategories = selectedCategoryData
    .slice(0, 4)
    .map((id) => ALLERGY_CATEGORIES.find((c) => c.id === id))
    .filter(Boolean)

  // Get protection status
  const protectionStatus = userProfile.checkStatus()
  const isProtected = protectionStatus === "PROTECTED" || protectionStatus === "CONFIRMED"

  return (
    <div className="space-y-4">
      <TrialBanner />
      
      {/* Greeting Section */}
      <div className="text-center py-2">
        <h2 className="text-xl font-bold text-gray-800">Hey {userName}</h2>
        <p className="text-sm text-gray-500 italic">{greeting}</p>
      </div>

      {/* PRIMARY SCAN BUTTON - Centered on Dashboard */}
      <div className="flex justify-center py-4">
        <Button
          onClick={() => onNavigate?.("scan")}
          className="px-8 py-6 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-3"
        >
          <Scan className="w-6 h-6" />
          Scan Product
          <Camera className="w-5 h-5 opacity-70" />
        </Button>
      </div>

      {/* Horizontal Swipeable Status Cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollSnapType: "x mandatory" }}>
        {/* Shield Status Card */}
        <Card className={cn(
          "flex-shrink-0 w-40 border-2 transition-all",
          isProtected ? "border-green-500/50 bg-green-50" : "border-gray-200"
        )} style={{ scrollSnapAlign: "start" }}>
          <CardContent className="p-3 text-center">
            <div className={cn(
              "w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center",
              isProtected ? "bg-green-500" : "bg-gray-300"
            )}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Shield</p>
            <p className={cn(
              "text-[10px]",
              isProtected ? "text-green-600" : "text-gray-500"
            )}>
              {isProtected ? "Active" : "Inactive"}
            </p>
          </CardContent>
        </Card>

        {/* Handshake Status Card */}
        <Card className={cn(
          "flex-shrink-0 w-40 border-2 transition-all",
          protectionStatus === "CONFIRMED" ? "border-blue-500/50 bg-blue-50" : "border-gray-200"
        )} style={{ scrollSnapAlign: "start" }}>
          <CardContent className="p-3 text-center">
            <div className={cn(
              "w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center",
              protectionStatus === "CONFIRMED" ? "bg-blue-500" : "bg-gray-300"
            )}>
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Handshake</p>
            <p className={cn(
              "text-[10px]",
              protectionStatus === "CONFIRMED" ? "text-blue-600" : "text-gray-500"
            )}>
              {protectionStatus === "CONFIRMED" ? "Confirmed" : "Pending"}
            </p>
          </CardContent>
        </Card>

        {/* Timer Card */}
        <Card className="flex-shrink-0 w-40 border-2 border-gray-200" style={{ scrollSnapAlign: "start" }}>
          <CardContent className="p-3 text-center">
            <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-purple-500">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Timer</p>
            <p className="text-[10px] text-gray-500">
              {userProfile.isProtectionActive() ? "Running" : "Ready"}
            </p>
          </CardContent>
        </Card>

        {/* Quick Add Card */}
        <Card className="flex-shrink-0 w-40 border-2 border-purple-200 bg-purple-50" style={{ scrollSnapAlign: "start" }}>
          <CardContent className="p-3 text-center">
            <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-purple-500">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Quick Add</p>
            <p className="text-[10px] text-purple-600">Tap to add</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary Card - Shows active user's Shield */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            {/* Profile Avatar - Shows saved photo or default */}
            <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center overflow-hidden border-2 border-purple-300">
              {userPhoto ? (
                <img src={userPhoto || "/placeholder.svg"} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-purple-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{userName}&apos;s Shield</h3>
              <p className="text-sm text-gray-500">
                Monitoring <span className="font-semibold text-purple-600">{totalTriggerCount}</span> sensitivities
              </p>
            </div>
          </div>

          <div className="mb-4">
            <AllergenQuickSearch onSelectItem={handleAllergenSelect} placeholder="Quick search your allergens..." />
          </div>

          {displayCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {displayCategories.map((category) => category && (
                <button key={category.id} onClick={() => handleCategoryClick(category.id)} className="transition-all hover:scale-105">
                  <Badge variant="outline" className="gap-1 border-purple-300 bg-purple-100 text-purple-700">
                    {category.icon} {category.name}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full text-xs bg-transparent border-purple-300" onClick={() => setShowDeepList(true)}>
            <Shield className="w-3 h-3 mr-1" />
            View full list ({totalTriggerCount} items)
            <ChevronRight className="w-3 h-3 ml-auto" />
          </Button>
        </CardContent>
      </Card>

      {/* Brand Shield Alert */}
      {brandShieldAlert && lastScanResult && (
        <Card className="border-red-500/50 bg-red-50">
          <CardContent className="p-4">
            <p className="font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Brand Shield Alert
            </p>
            <p className="text-sm text-gray-600">{lastScanResult.productName} contains triggers</p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <DeepListModal isOpen={showDeepList} onClose={() => setShowDeepList(false)} triggers={triggerListItems} onSelectItem={handleAllergenSelect} />
      <SensitivityDetailModal isOpen={!!selectedCategory} onClose={() => setSelectedCategory(null)} item={selectedCategory} />
    </div>
  )
}
