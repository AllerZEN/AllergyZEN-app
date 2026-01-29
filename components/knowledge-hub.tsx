"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Lightbulb, ChevronRight, Zap, Heart, Shield, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"

interface KnowledgeTip {
  id: string
  title: string
  content: string
  category: "red" | "amber" | "blue" | "green"
  icon: React.ReactNode
}

const knowledgeTips: KnowledgeTip[] = [
  // Red - High Alert Knowledge
  {
    id: "red-1",
    title: "Understanding Hidden Triggers",
    content: "Many allergens hide behind scientific names. 'Casein' is milk protein, 'Lecithin' often comes from soy, and 'Albumin' is typically from eggs. Your allergyZEN shield scans for these hidden names automatically.",
    category: "red",
    icon: <Shield className="w-4 h-4" />
  },
  {
    id: "red-2", 
    title: "Cross-Contamination Awareness",
    content: "Even 'free-from' products can be manufactured on shared equipment. Look for 'May contain' warnings and trust your allergyZEN scanner to flag these risks for you.",
    category: "red",
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: "red-3",
    title: "Emergency Preparedness",
    content: "Knowledge is power. Keep your emergency plan updated and share your allergyZEN profile with trusted contacts. Technology helps you stay one step ahead.",
    category: "red",
    icon: <Heart className="w-4 h-4" />
  },
  
  // Amber - Caution Knowledge
  {
    id: "amber-1",
    title: "Ingredient List Position Matters",
    content: "Ingredients are listed by weight - the first items make up the largest portion. A trigger near the end means trace amounts, while early position indicates higher concentration.",
    category: "amber",
    icon: <Lightbulb className="w-4 h-4" />
  },
  {
    id: "amber-2",
    title: "Processing Can Change Risk",
    content: "Some allergens are denatured by heat or processing. Highly refined oils often have proteins removed. However, always verify with your healthcare provider.",
    category: "amber",
    icon: <Zap className="w-4 h-4" />
  },
  
  // Blue - Boundaries & ED Support
  {
    id: "blue-1",
    title: "Sensory Boundaries Are Valid",
    content: "Texture sensitivities and food boundaries are real and valid. Your allergyZEN Boundaries feature helps communicate these needs clearly to kitchens without explanation.",
    category: "blue",
    icon: <Heart className="w-4 h-4" />
  },
  {
    id: "blue-2",
    title: "Deconstructed Dining",
    content: "Requesting deconstructed meals gives you control over what touches your plate. Many kitchens are happy to serve components separately - allergyZEN makes this request simple.",
    category: "blue",
    icon: <Leaf className="w-4 h-4" />
  },
  {
    id: "blue-3",
    title: "Communication Through Technology",
    content: "Your digital ticket speaks for you. No need to explain or justify - the QR handshake transmits your needs professionally and respectfully.",
    category: "blue",
    icon: <Shield className="w-4 h-4" />
  },
  
  // Green - Safe Choices
  {
    id: "green-1",
    title: "Building Your Green List",
    content: "Every safe food you discover expands your world. allergyZEN learns your safe choices and suggests similar products, growing your options over time.",
    category: "green",
    icon: <Leaf className="w-4 h-4" />
  },
  {
    id: "green-2",
    title: "Safe Swaps Strategy",
    content: "For every trigger, there's usually a safe alternative. Coconut aminos for soy sauce, oat milk for dairy - your Green List is your recipe for freedom.",
    category: "green",
    icon: <Lightbulb className="w-4 h-4" />
  }
]

const categoryConfig = {
  red: {
    label: "High Alert",
    bgClass: "bg-traffic-red/10 border-traffic-red/30",
    textClass: "text-[#ef4444]",
    badgeClass: "bg-traffic-red/20 text-[#ef4444] border-traffic-red/30"
  },
  amber: {
    label: "Caution",
    bgClass: "bg-traffic-orange/10 border-traffic-orange/30", 
    textClass: "text-[#f97316]",
    badgeClass: "bg-traffic-orange/20 text-[#f97316] border-traffic-orange/30"
  },
  blue: {
    label: "Boundaries",
    bgClass: "bg-blue-500/10 border-blue-500/30",
    textClass: "text-blue-600",
    badgeClass: "bg-blue-500/20 text-blue-600 border-blue-500/30"
  },
  green: {
    label: "Safe Choices",
    bgClass: "bg-traffic-green/10 border-traffic-green/30",
    textClass: "text-[#22c55e]",
    badgeClass: "bg-traffic-green/20 text-[#22c55e] border-traffic-green/30"
  }
}

export function KnowledgeHub() {
  const [selectedCategory, setSelectedCategory] = useState<"red" | "amber" | "blue" | "green" | null>(null)
  const [expandedTip, setExpandedTip] = useState<string | null>(null)

  const filteredTips = selectedCategory 
    ? knowledgeTips.filter(tip => tip.category === selectedCategory)
    : knowledgeTips

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Knowledge Hub: Knowledge is Power
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer transition-all",
              selectedCategory === null && "bg-primary/20 border-primary"
            )}
            onClick={() => setSelectedCategory(null)}
          >
            All Tips
          </Badge>
          {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((cat) => (
            <Badge
              key={cat}
              variant="outline"
              className={cn(
                "cursor-pointer transition-all",
                selectedCategory === cat 
                  ? categoryConfig[cat].badgeClass
                  : "hover:opacity-80"
              )}
              onClick={() => setSelectedCategory(cat)}
            >
              {categoryConfig[cat].label}
            </Badge>
          ))}
        </div>

        {/* Tips List */}
        <div className="space-y-2">
          {filteredTips.map((tip) => {
            const config = categoryConfig[tip.category]
            const isExpanded = expandedTip === tip.id
            
            return (
              <button
                key={tip.id}
                onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  config.bgClass,
                  "hover:shadow-sm"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-1.5 rounded-md bg-background/80", config.textClass)}>
                    {tip.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm">{tip.title}</h4>
                      <ChevronRight className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform shrink-0",
                        isExpanded && "rotate-90"
                      )} />
                    </div>
                    {isExpanded && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {tip.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
