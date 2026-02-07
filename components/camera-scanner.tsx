"use client"

import React, { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Camera, X, AlertTriangle, CheckCircle2, Pill, Utensils,
  SprayCan, Upload, Loader2, ShieldAlert, ShieldCheck,
  RotateCcw, Heart, Info, ArrowRight, TreeDeciduous
} from "lucide-react"
import { cn } from "@/lib/utils"
import userProfile from "@/lib/profile"

type ProductType = "food" | "medication" | "cleaning" | "wood"
type TierResult = "red" | "amber" | "brown" | "blue" | "green"

interface ScanAnalysis {
  productName: string
  ingredients: string[]
  warnings: string[]
  confidence: string
  tier: TierResult
  matchedAllergens: string[]
}

const PRODUCT_TYPES = [
  { id: "food" as ProductType, label: "Food", icon: Utensils },
  { id: "medication" as ProductType, label: "Meds", icon: Pill },
  { id: "cleaning" as ProductType, label: "Chemical", icon: SprayCan },
  { id: "wood" as ProductType, label: "Wood", icon: TreeDeciduous },
]

export function CameraScanner({ onNavigateToSafe }: { onNavigateToSafe?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [productType, setProductType] = useState<ProductType>("food")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ScanAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const openScanner = () => { 
    setIsOpen(true)
    startCamera()
    setAnalysis(null)
    setError(null)
  }

  const closeScanner = () => { 
    setIsOpen(false)
    stopCamera()
    setCapturedImage(null)
    setAnalysis(null)
    setError(null)
  }

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Camera access denied:", err)
      setError("Camera access denied. Please enable camera permissions.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null
    
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL("image/jpeg", 0.8)
  }

  const analyzeIngredients = (ingredients: string[]): { tier: TierResult; matched: string[] } => {
    const profile = userProfile.getActiveProfile()
    if (!profile?.items) return { tier: "green", matched: [] }

    const matched: string[] = []
    let highestTier: TierResult = "green"

    const lowerIngredients = ingredients.map(i => i.toLowerCase())

    // Check RED tier (highest priority)
    profile.items.red.forEach(item => {
      if (lowerIngredients.some(ing => ing.includes(item.name.toLowerCase()))) {
        matched.push(item.name)
        highestTier = "red"
      }
    })

    // Check AMBER tier
    if (highestTier !== "red") {
      profile.items.amber.forEach(item => {
        if (lowerIngredients.some(ing => ing.includes(item.name.toLowerCase()))) {
          matched.push(item.name)
          if (highestTier === "green") highestTier = "amber"
        }
      })
    }

    // Check BROWN tier (dislikes)
    profile.items.brown.forEach(item => {
      if (lowerIngredients.some(ing => ing.includes(item.name.toLowerCase()))) {
        matched.push(item.name)
        if (highestTier === "green") highestTier = "brown"
      }
    })

    // Check BLUE tier (sensory/ED)
    profile.items.blue.forEach(item => {
      if (lowerIngredients.some(ing => ing.includes(item.name.toLowerCase()))) {
        matched.push(item.name)
        if (highestTier === "green") highestTier = "blue"
      }
    })

    return { tier: highestTier, matched }
  }

  const captureAndAnalyze = async () => {
    const imageData = captureImage()
    if (!imageData) {
      setError("Failed to capture image")
      return
    }

    setCapturedImage(imageData)
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/scan-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, productType }),
      })

      if (!response.ok) {
        throw new Error("Scan failed")
      }

      const data = await response.json()
      const { tier, matched } = analyzeIngredients(data.ingredients || [])

      setAnalysis({
        productName: data.productName || "Unknown Product",
        ingredients: data.ingredients || [],
        warnings: data.warnings || [],
        confidence: data.confidence || "low",
        tier,
        matchedAllergens: matched,
      })

      // Auto-push to diabetes tracker if food and safe
      if (productType === "food" && tier === "green" && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("allergyzen:food-scanned", {
          detail: { name: data.productName, carbs: 15, calories: 100 }
        }))
      }
    } catch (err) {
      console.error("Scan error:", err)
      setError("Failed to analyze. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleQuickAdd = (tier: TierResult) => {
    if (!analysis) return
    userProfile.addItem(analysis.productName, productType, tier)
    closeScanner()
  }

  const getTierConfig = (tier: TierResult) => {
    const configs = {
      red: { bg: "bg-red-600", border: "border-red-400", icon: ShieldAlert, label: "STOP", sublabel: "Contains your allergens" },
      amber: { bg: "bg-orange-500", border: "border-orange-300", icon: AlertTriangle, label: "CAUTION", sublabel: "Moderate sensitivity match" },
      brown: { bg: "bg-stone-600", border: "border-stone-400", icon: AlertTriangle, label: "DISLIKE", sublabel: "Personal preference alert" },
      blue: { bg: "bg-blue-600", border: "border-blue-400", icon: Heart, label: "BOUNDARY", sublabel: "Sensory/ED trigger detected" },
      green: { bg: "bg-green-600", border: "border-green-400", icon: ShieldCheck, label: "SAFE", sublabel: "No matches found" },
    }
    return configs[tier]
  }

  return (
    <>
      <Button 
        onClick={openScanner} 
        className="w-full bg-[#673AB7] hover:bg-[#512DA8] py-8 rounded-2xl text-xl font-black shadow-lg shadow-purple-200"
      >
        <Camera className="w-6 h-6 mr-3" />
        SCAN PRODUCT
      </Button>

      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-md text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">Live Scanner</span>
              </div>
              <Button variant="ghost" size="icon" onClick={closeScanner} className="text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Product Type Selector */}
            <div className="flex gap-2 p-4 bg-black/30">
              {PRODUCT_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setProductType(id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all",
                    productType === id 
                      ? "bg-[#673AB7] text-white" 
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">{label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center">
              {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-xl text-sm font-medium text-center z-20">
                  {error}
                </div>
              )}

              {!capturedImage ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                  
                  {/* Viewfinder Overlay */}
                  <div className="relative w-72 h-72 z-10">
                    <div className="absolute inset-0 border-2 border-white/30 rounded-3xl" />
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#673AB7] rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#673AB7] rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#673AB7] rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#673AB7] rounded-br-2xl" />
                    
                    <motion.div 
                      animate={{ top: ["10%", "90%", "10%"] }} 
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute w-full h-0.5 bg-[#673AB7] shadow-[0_0_15px_rgba(103,58,183,0.8)]" 
                    />
                  </div>

                  <p className="text-white/60 text-xs font-medium mt-6 z-10">
                    Point camera at ingredient label
                  </p>

                  <Button 
                    onClick={captureAndAnalyze} 
                    className="mt-8 bg-white text-[#673AB7] rounded-full h-20 w-20 shadow-2xl border-4 border-[#673AB7] hover:bg-purple-50 z-10"
                  >
                    <Camera className="w-8 h-8" />
                  </Button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6">
                  {isAnalyzing ? (
                    <div className="space-y-4 text-center">
                      <Loader2 className="w-16 h-16 animate-spin text-[#673AB7] mx-auto" />
                      <p className="text-white font-black uppercase tracking-tight text-lg">Analyzing...</p>
                      <p className="text-white/50 text-xs">Checking against your Zen Spectrum</p>
                    </div>
                  ) : analysis ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="w-full max-w-sm"
                    >
                      {/* IMMEDIATE RESULT OVERLAY */}
                      {(() => {
                        const config = getTierConfig(analysis.tier)
                        const Icon = config.icon
                        return (
                          <Card className={cn("border-[6px] shadow-2xl", config.bg, config.border)}>
                            <CardContent className="pt-10 pb-8 flex flex-col items-center">
                              <div className="bg-white/20 p-6 rounded-full mb-4 backdrop-blur-xl">
                                <Icon className="w-16 h-16 text-white" />
                              </div>
                              
                              <h2 className="text-5xl font-black text-white uppercase tracking-tighter">
                                {config.label}
                              </h2>
                              <p className="text-white/80 font-bold mt-2 text-xs uppercase tracking-widest">
                                {config.sublabel}
                              </p>

                              {analysis.matchedAllergens.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                  {analysis.matchedAllergens.map((a, i) => (
                                    <Badge key={i} className="bg-white/20 text-white border-none">
                                      {a}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              <p className="text-white/60 text-[10px] mt-4 font-medium">
                                {analysis.productName} | {analysis.ingredients.length} ingredients detected
                              </p>
                            </CardContent>
                          </Card>
                        )
                      })()}

                      {/* QUICK ADD OPTIONS */}
                      <div className="mt-6 space-y-2">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center mb-3">
                          Quick Add to Shield
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {(["red", "amber", "brown", "green", "blue"] as TierResult[]).map(tier => (
                            <button
                              key={tier}
                              onClick={() => handleQuickAdd(tier)}
                              className={cn(
                                "p-3 rounded-xl transition-all hover:scale-105",
                                tier === "red" && "bg-red-500",
                                tier === "amber" && "bg-orange-500",
                                tier === "brown" && "bg-stone-600",
                                tier === "green" && "bg-green-500",
                                tier === "blue" && "bg-blue-500",
                              )}
                            >
                              <div className="w-4 h-4 rounded-full bg-white/30 mx-auto" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* SAFE ALTERNATIVES */}
                      {analysis.tier !== "green" && onNavigateToSafe && (
                        <Button 
                          onClick={() => { closeScanner(); onNavigateToSafe(); }}
                          className="w-full mt-6 bg-white text-[#673AB7] font-black h-14 rounded-xl"
                        >
                          See Safe Alternatives <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}

                      <Button 
                        onClick={() => { setCapturedImage(null); setAnalysis(null); }} 
                        variant="outline" 
                        className="mt-4 w-full text-white border-white/20 bg-transparent h-12 hover:bg-white/10"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" /> Scan Again
                      </Button>
                    </motion.div>
                  ) : null}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
