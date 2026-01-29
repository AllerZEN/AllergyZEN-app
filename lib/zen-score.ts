"use client"

import userProfile from "./profile"
import allergensData from "@/allergens.json"

interface ZenScoreResult {
  score: number
  safePercentage: number
  handshakeBonus: number
  status: "excellent" | "good" | "moderate" | "needs-attention"
  message: string
}

export function calculateZenScore(): ZenScoreResult {
  const activeProfile = userProfile.getActiveProfile()
  
  // Default values if no profile
  if (!activeProfile) {
    return {
      score: 50,
      safePercentage: 50,
      handshakeBonus: 0,
      status: "moderate",
      message: "Set up your profile to get your personalized Zen Score"
    }
  }

  // Calculate base score from safe items ratio
  const totalItems = 
    (allergensData.high_reactivity?.length || 0) +
    (allergensData.moderate_reactivity?.length || 0) +
    (allergensData.no_reactivity?.length || 0)
  
  const safeItems = allergensData.no_reactivity?.length || 0
  const blockedItems = activeProfile.allergies?.length || 0
  
  // Base percentage: ratio of safe items to total
  let safePercentage = totalItems > 0 ? Math.round((safeItems / totalItems) * 100) : 50
  
  // Adjust based on user's blocked items (more blocked = better awareness = higher score)
  const awarenessBonus = Math.min(blockedItems * 0.5, 15)
  
  // Check for active business handshake (+20% bonus)
  let handshakeBonus = 0
  const status = userProfile.checkStatus()
  if (status === "PROTECTED" || status === "CONFIRMED") {
    if (userProfile.isProtectionActive()) {
      handshakeBonus = 20
    }
  }
  
  // Calculate final score
  let score = Math.min(100, safePercentage + awarenessBonus + handshakeBonus)
  
  // Determine status
  let scoreStatus: ZenScoreResult["status"]
  let message: string
  
  if (score >= 85) {
    scoreStatus = "excellent"
    message = "Your environment is highly optimized for safety"
  } else if (score >= 70) {
    scoreStatus = "good"
    message = "Good protection level with room for improvement"
  } else if (score >= 50) {
    scoreStatus = "moderate"
    message = "Consider reviewing your trigger list for better coverage"
  } else {
    scoreStatus = "needs-attention"
    message = "Update your profile to improve your Zen Score"
  }
  
  // Add handshake message if active
  if (handshakeBonus > 0) {
    message = "Business handshake active! +20% protection bonus"
  }
  
  return {
    score: Math.round(score),
    safePercentage,
    handshakeBonus,
    status: scoreStatus,
    message
  }
}

export function getScoreColor(status: ZenScoreResult["status"]): string {
  switch (status) {
    case "excellent":
      return "text-green-600"
    case "good":
      return "text-blue-600"
    case "moderate":
      return "text-orange-600"
    case "needs-attention":
      return "text-red-600"
    default:
      return "text-muted-foreground"
  }
}

export function getScoreBgColor(status: ZenScoreResult["status"]): string {
  switch (status) {
    case "excellent":
      return "bg-green-500"
    case "good":
      return "bg-blue-500"
    case "moderate":
      return "bg-orange-500"
    case "needs-attention":
      return "bg-red-500"
    default:
      return "bg-muted"
  }
}
