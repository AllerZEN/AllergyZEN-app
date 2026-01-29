"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Moon,
  Bell,
  Shield,
  HelpCircle,
  ExternalLink,
  User,
  Edit2,
  Trash2,
  Check,
  X,
  Crown,
  CreditCard,
  Loader2,
  Bug,
  BarChart3,
} from "lucide-react"
import {
  getUserProfile,
  ALLERGY_CATEGORIES,
  updateProfileAllergies,
  clearUserProfile,
  type UserProfile,
} from "@/lib/user-profile"
import { getSubscription, upgradeToPro, type SubscriptionState } from "@/lib/subscription"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UpgradeModal } from "./upgrade-modal"
import { BugReportModal } from "./bug-report-modal"
import { InsightsPanel } from "./insights-panel"
import { SupportPage } from "./support-page"

export function SettingsPanel() {
  const [darkMode, setDarkMode] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null)
  const [isEditingAllergies, setIsEditingAllergies] = useState(false)
  const [editedAllergies, setEditedAllergies] = useState<string[]>([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showBugReport, setShowBugReport] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const userProfile = getUserProfile()
    setProfile(userProfile)
    if (userProfile) {
      setEditedAllergies(userProfile.selectedAllergies)
    }
    setSubscription(getSubscription())

    setDarkMode(document.documentElement.classList.contains("dark"))
  }, [])

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled)
    if (enabled) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const toggleAllergy = (id: string) => {
    setEditedAllergies((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const saveAllergies = () => {
    const updated = updateProfileAllergies(editedAllergies)
    setProfile(updated)
    setIsEditingAllergies(false)
  }

  const cancelEdit = () => {
    if (profile) {
      setEditedAllergies(profile.selectedAllergies)
    }
    setIsEditingAllergies(false)
  }

  const handleResetProfile = () => {
    // Complete data wipe - all localStorage keys
    const keysToRemove = [
      "allergyzen_user_profile",
      "allergyzen_family_profiles",
      "allergyzen_personal_notes",
      "allergyzen_trials",
      "allergyzen_health_log",
      "allergyzen_subscription",
      "allergyzen_scan_history"
    ]
    for (const key of keysToRemove) {
      localStorage.removeItem(key)
    }
    clearUserProfile()
    window.location.reload()
  }

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true)
    try {
      const customerId = localStorage.getItem("stripe_customer_id")

      if (!customerId) {
        setShowUpgradeModal(true)
        setIsLoadingPortal(false)
        return
      }

      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.href,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to open billing portal")
      }
    } catch (error) {
      console.error("Portal error:", error)
      alert("Unable to open billing portal. Please try again.")
    } finally {
      setIsLoadingPortal(false)
    }
  }

  const handleTestUnlockPro = () => {
    upgradeToPro()
    setSubscription(getSubscription())
  }

  const getTierDisplay = () => {
    if (!subscription) return { label: "Free", color: "bg-muted text-muted-foreground" }
    switch (subscription.tier) {
      case "pro":
        return { label: "proZEN", color: "bg-gradient-to-r from-amber-500 to-orange-500 text-white" }
      case "trial":
        return { label: "Trial", color: "bg-primary/20 text-primary" }
      default:
        return { label: "Free", color: "bg-muted text-muted-foreground" }
    }
  }

  const tierDisplay = getTierDisplay()

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Card className="bg-card/50 backdrop-blur border-primary/20 animate-pulse">
          <CardContent className="p-6 h-32" />
        </Card>
      </div>
    )
  }

  if (showSupport) {
    return <SupportPage onBack={() => setShowSupport(false)} />
  }

  if (showInsights) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" className="gap-2" onClick={() => setShowInsights(false)}>
          <X className="w-4 h-4" />
          Back to Settings
        </Button>
        <InsightsPanel />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 hover:bg-primary/10"
            onClick={() => setShowInsights(true)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Usage Insights</p>
                <p className="text-xs text-muted-foreground">View your scan history and stats</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("px-3 py-1.5 rounded-full text-sm font-medium", tierDisplay.color)}>
                {tierDisplay.label}
              </div>
              {subscription?.tier === "pro" && (
                <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                  <Check className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>

          {subscription?.tier === "pro" ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">You have unlimited access to all proZEN features.</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 bg-card hover:bg-accent"
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
              >
                {isLoadingPortal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening Portal...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Manage Subscription
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {subscription?.tier === "trial"
                  ? "Enjoying your free trial! Upgrade to keep unlimited access."
                  : "Upgrade to proZEN for unlimited scans and meal suggestions."}
              </p>
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
                onClick={() => setShowUpgradeModal(true)}
              >
                <Crown className="w-4 h-4" />
                Upgrade to proZEN - £6.99/month
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-dashed border-amber-500/50 text-amber-600 hover:bg-amber-500/10 bg-transparent"
                onClick={handleTestUnlockPro}
              >
                <Crown className="w-4 h-4" />
                Test: Unlock proZEN
              </Button>

              {typeof window !== "undefined" && localStorage.getItem("stripe_customer_id") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 bg-transparent"
                  onClick={handleManageSubscription}
                  disabled={isLoadingPortal}
                >
                  {isLoadingPortal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Opening Portal...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Manage Subscription
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Profile Card */}
      {profile && (
        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lg">{profile.name}</p>
                <p className="text-xs text-muted-foreground">
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Selected Allergies */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Your Sensitivities</Label>
                {!isEditingAllergies ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => setIsEditingAllergies(true)}
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-primary"
                      onClick={saveAllergies}
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-muted-foreground"
                      onClick={cancelEdit}
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {isEditingAllergies ? (
                <div className="grid grid-cols-3 gap-2">
                  {ALLERGY_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleAllergy(category.id)}
                      className={cn(
                        "p-2 rounded-lg border text-xs transition-all",
                        editedAllergies.includes(category.id)
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30",
                      )}
                    >
                      <span className="block text-base mb-1">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.selectedAllergies.length > 0 ? (
                    profile.selectedAllergies.map((id) => {
                      const category = ALLERGY_CATEGORIES.find((c) => c.id === id)
                      return (
                        <Badge key={id} variant="destructive" className="gap-1">
                          {category?.icon} {category?.name}
                        </Badge>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No sensitivities selected</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-primary" />
                Your allergy data is stored securely on your device only
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Card */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="dark-mode" className="font-medium">
                  Dark Mode
                </Label>
                <p className="text-xs text-muted-foreground">Easier on the eyes at night</p>
              </div>
            </div>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          <div className="h-px bg-border" />

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="notifications" className="font-medium">
                  Notifications
                </Label>
                <p className="text-xs text-muted-foreground">Get alerts for new findings</p>
              </div>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>

          <div className="h-px bg-border" />

          {/* Strict Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="strict-mode" className="font-medium">
                  Strict Mode
                </Label>
                <p className="text-xs text-muted-foreground">Flag all potential derivatives</p>
              </div>
            </div>
            <Switch id="strict-mode" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardContent className="pt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-between bg-transparent"
            onClick={() => setShowSupport(true)}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              <span>Help & Support</span>
            </div>
            <ExternalLink className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between bg-transparent"
            onClick={() => setShowBugReport(true)}
          >
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              <span>Report a Bug</span>
            </div>
          </Button>

          {/* Reset Profile Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-transparent text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  <span>Reset Profile</span>
                </div>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset your profile?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete all your saved preferences and sensitivity selections. You'll need to complete the
                  onboarding again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetProfile}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Reset Profile
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center text-xs text-muted-foreground pt-4">
        <p>allergyZEN Wellness Assistant™ v1.0.0</p>
        <p className="mt-1">Your wellness companion</p>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />
    </div>
  )
}
