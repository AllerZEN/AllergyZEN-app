"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Camera,
  X,
  AlertTriangle,
  CheckCircle2,
  Pill,
  Utensils,
  SprayCan,
  Upload,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
} from "lucide-react"
import { checkIngredientAgainstPersonalDatabase, hasFragranceWarning } from "@/lib/personal-database-checker"
import { cn } from "@/lib/utils"
import { SafeAlternatives } from "@/components/safe-alternatives"

type ProductType = "food" | "medication" | "cleaning"

interface ScanAnalysis {
  productName: string
  ingredients: string[]
  warnings: string[]
  confidence: "high" | "medium" | "low"
}

interface IngredientResult {
  name: string
  safe: boolean
  level: "high" | "moderate" | "safe" | "unknown"
  category: string
  matchedTerm: string
}

export function CameraScanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [productType, setProductType] = useState<ProductType>("food")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ScanAnalysis | null>(null)
  const [results, setResults] = useState<IngredientResult[]>([])
  const [overallSafe, setOverallSafe] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFragranceWarning, setShowFragranceWarning] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const productTypes = [
    { id: "food" as const, label: "Food", icon: Utensils },
    { id: "medication" as const, label: "Medication", icon: Pill },
    { id: "cleaning" as const, label: "Cleaning", icon: SprayCan },
  ]

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
      setError("Camera access denied. Please use file upload instead.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const openScanner = () => {
    setIsOpen(true)
    setError(null)
    setCapturedImage(null)
    setAnalysis(null)
    setResults([])
    setOverallSafe(null)
    setShowFragranceWarning(false)
    startCamera()
  }

  const closeScanner = () => {
    setIsOpen(false)
    stopCamera()
    setCapturedImage(null)
    setAnalysis(null)
    setResults([])
    setOverallSafe(null)
    setError(null)
    setShowFragranceWarning(false)
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(imageData)
        stopCamera()
        analyzeImage(imageData)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string
        setCapturedImage(imageData)
        stopCamera()
        analyzeImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/scan-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, productType }),
      })

      if (!response.ok) throw new Error("Analysis failed")

      const data: ScanAnalysis = await response.json()
      setAnalysis(data)

      const ingredientResults: IngredientResult[] = data.ingredients.map((ingredient) => {
        const check = checkIngredientAgainstPersonalDatabase(ingredient)
        return {
          name: ingredient,
          safe: check.level === "safe" || check.level === "unknown",
          level: check.level,
          category: check.category,
          matchedTerm: check.matchedTerm,
        }
      })

      setResults(ingredientResults)

      // Check for fragrance warning
      if (hasFragranceWarning(data.ingredients)) {
        setShowFragranceWarning(true)
      }

      // Determine overall safety - high reactivity = unsafe
      const hasHighReactivity = ingredientResults.some((r) => r.level === "high")
      const hasModerate = ingredientResults.some((r) => r.level === "moderate")
      setOverallSafe(!hasHighReactivity && !hasModerate)
    } catch (err) {
      setError("Failed to analyze image. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetScan = () => {
    setCapturedImage(null)
    setAnalysis(null)
    setResults([])
    setOverallSafe(null)
    setError(null)
    setShowFragranceWarning(false)
    startCamera()
  }

  const highReactivityResults = results.filter((r) => r.level === "high")
  const moderateResults = results.filter((r) => r.level === "moderate")
  const safeResults = results.filter((r) => r.level === "safe" || r.level === "unknown")

  return (
    <>
      {/* Scan Product Button */}
      <Button
        onClick={openScanner}
        size="lg"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
      >
        <Camera className="w-5 h-5 mr-2" />
        Scan Product Label
      </Button>

      {/* Full Screen Scanner Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Scan Product</h2>
                <Button variant="ghost" size="icon" onClick={closeScanner}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Product Type Selector */}
              <div className="flex gap-2 p-4">
                {productTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={productType === type.id ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setProductType(type.id)}
                    className="flex-1"
                  >
                    <type.icon className="w-4 h-4 mr-1" />
                    {type.label}
                  </Button>
                ))}
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Camera/Image View */}
                {!capturedImage ? (
                  <div className="space-y-4">
                    <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Scanning overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-4 border-2 border-primary/50 rounded-lg">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                        </div>
                      </div>

                      {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                          <p className="text-destructive text-center px-4">{error}</p>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                      Position the ingredient label within the frame
                    </p>

                    <div className="flex gap-3">
                      <Button onClick={captureImage} className="flex-1" size="lg">
                        <Camera className="w-5 h-5 mr-2" />
                        Capture
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-5 h-5" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Captured Image */}
                    <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                      <img
                        src={capturedImage || "/placeholder.svg"}
                        alt="Captured product"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Loading State */}
                    {isAnalyzing && (
                      <Card className="bg-card/50 backdrop-blur border-primary/20">
                        <CardContent className="py-8">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Analyzing against 1,683 items...</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Error State */}
                    {error && !isAnalyzing && (
                      <Card className="bg-destructive/10 border-destructive/30">
                        <CardContent className="py-4">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            <p className="text-destructive">{error}</p>
                          </div>
                          <Button variant="outline" onClick={resetScan} className="w-full mt-3 bg-transparent">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Try Again
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* Results */}
                    {analysis && !isAnalyzing && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {/* Overall Safety Banner */}
                        <Card
                          className={cn(
                            "border-2",
                            overallSafe ? "bg-success/10 border-success" : "bg-destructive/10 border-destructive",
                          )}
                        >
                          <CardContent className="py-6">
                            <div className="flex items-center justify-center gap-3">
                              {overallSafe ? (
                                <>
                                  <ShieldCheck className="w-12 h-12 text-success" />
                                  <div>
                                    <p className="text-2xl font-bold text-success">SAFE</p>
                                    <p className="text-sm text-success/80">No triggers detected</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <ShieldAlert className="w-12 h-12 text-destructive" />
                                  <div>
                                    <p className="text-2xl font-bold text-destructive">WARNING</p>
                                    <p className="text-sm text-destructive/80">
                                      {highReactivityResults.length} red, {moderateResults.length} yellow triggers
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Fragrance Warning */}
                        {showFragranceWarning && (
                          <Card className="bg-warning/10 border-warning/50 border-2">
                            <CardContent className="py-4">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-warning" />
                                <p className="font-semibold text-warning">Fragrance Warning</p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                This product contains &quot;Fragrance&quot; or &quot;Parfum&quot; which can hide
                                hundreds of undisclosed chemicals.
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Product Info */}
                        <Card className="bg-card/50 backdrop-blur border-border">
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{analysis.productName}</p>
                                <p className="text-sm text-muted-foreground">{results.length} ingredients detected</p>
                              </div>
                              <Badge
                                variant={
                                  analysis.confidence === "high"
                                    ? "default"
                                    : analysis.confidence === "medium"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {analysis.confidence} confidence
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        {/* High Reactivity (Red) Ingredients */}
                        {highReactivityResults.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="font-semibold text-destructive flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              High Reactivity (Red Tier)
                            </h3>
                            {highReactivityResults.map((result, index) => (
                              <Card key={index} className="bg-destructive/5 border-destructive/30">
                                <CardContent className="py-3">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4 text-destructive" />
                                      <span className="font-medium text-destructive">{result.name}</span>
                                    </div>
                                    <div className="ml-6">
                                      <Badge variant="destructive" className="text-xs">
                                        {result.matchedTerm || result.category}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* Moderate (Yellow) Ingredients */}
                        {moderateResults.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="font-semibold text-warning flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Moderate Reactivity (Yellow Tier)
                            </h3>
                            {moderateResults.map((result, index) => (
                              <Card key={index} className="bg-warning/5 border-warning/30">
                                <CardContent className="py-3">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-warning" />
                                    <span className="font-medium text-warning">{result.name}</span>
                                    <Badge variant="outline" className="text-xs border-warning/50 text-warning ml-auto">
                                      {result.category}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* Safe Ingredients (Collapsed) */}
                        {safeResults.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="font-semibold text-success flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Safe Ingredients ({safeResults.length})
                            </h3>
                            <Card className="bg-success/5 border-success/30">
                              <CardContent className="py-3">
                                <div className="flex flex-wrap gap-2">
                                  {safeResults.map((result, index) => (
                                    <Badge key={index} variant="outline" className="text-success border-success/30">
                                      {result.name}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Safe Alternatives section for unsafe products */}
                        {!overallSafe && analysis && (
                          <SafeAlternatives
                            productName={analysis.productName}
                            ingredients={analysis.ingredients}
                            status={highReactivityResults.length > 0 ? "danger" : "warning"}
                          />
                        )}

                        {/* Label Warnings */}
                        {analysis.warnings.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="font-semibold text-warning flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Label Warnings
                            </h3>
                            <Card className="bg-warning/5 border-warning/30">
                              <CardContent className="py-3">
                                {analysis.warnings.map((warning, index) => (
                                  <p key={index} className="text-sm text-warning flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                                    {warning}
                                  </p>
                                ))}
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Scan Again Button */}
                        <Button variant="outline" onClick={resetScan} className="w-full bg-transparent">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Scan Another Product
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
