"use client"

import React, { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Camera, X, AlertTriangle, CheckCircle2, Pill, Utensils,
  SprayCan, Upload, Loader2, ShieldAlert, ShieldCheck,
  RotateCcw, Heart, Info, ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { checkIngredientAgainstPersonalDatabase } from "@/lib/personal-database-checker"

// Product types for the Zen Ecosystem
type ProductType = "food" | "medication" | "cleaning" | "lab" | "material"

export function CameraScanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [productType, setProductType] = useState<ProductType>("food")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [overallTier, setOverallTier] = useState<"red" | "amber" | "brown" | "blue" | "green" | null>(null)
  const [results, setResults] = useState<any[]>([])
  const [showSafeTabLink, setShowSafeTabLink] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const openScanner = () => { setIsOpen(true); startCamera(); }
  const closeScanner = () => { setIsOpen(false); stopCamera(); setCapturedImage(null); setOverallTier(null); }

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (err) { console.error("Camera access denied") }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const captureAndAnalyze = () => {
    setCapturedImage("/placeholder-scan.jpg") // Simulation
    setIsAnalyzing(true)
    
    // Simulate 2026 Batch Analysis (Medicinal/Lab/Zen Spectrum)
    setTimeout(() => {
      const mockTier: "red" | "amber" | "brown" | "blue" | "green" = "red" 
      setOverallTier(mockTier)
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <>
      <Button onClick={openScanner} className="w-full bg-blue-600 hover:bg-blue-700 py-8 rounded-2xl text-xl font-black shadow-lg">
        <Camera className="w-6 h-6 mr-3" />
        OPEN ZEN LENS
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-md text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">Live Analysis Active</span>
              </div>
              <Button variant="ghost" onClick={closeScanner} className="text-white"><X /></Button>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center">
              {!capturedImage ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  {/* Viewfinder Overlay */}
                  <div className="relative w-72 h-72 border-2 border-white/20 rounded-3xl flex items-center justify-center">
                    <div className="absolute inset-0 border-[20px] border-black/40 rounded-3xl" />
                    <motion.div 
                      animate={{ top: ["10%", "90%", "10%"] }} 
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] z-10" 
                    />
                  </div>
                  <Button onClick={captureAndAnalyze} className="mt-12 bg-white text-black rounded-full h-20 w-20 shadow-2xl border-4 border-blue-500">
                    <Camera />
                  </Button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto" />
                      <p className="text-white font-black uppercase tracking-tighter">Analyzing Zen Spectrum...</p>
                    </div>
                  ) : (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-sm">
                      {/* THE IMMEDIATE RESULT OVERLAY (🔴🟠🟤🟢💙) */}
                      <Card className={cn(
                        "border-[6px] shadow-2xl",
                        overallTier === 'red' ? "bg-red-600 border-red-400" :
                        overallTier === 'amber' ? "bg-orange-500 border-orange-300" :
                        overallTier === 'brown' ? "bg-stone-700 border-stone-500" :
                        overallTier === 'blue' ? "bg-blue-600 border-blue-400" : "bg-green-600 border-green-400"
                      )}>
                        <CardContent className="pt-10 pb-10 flex flex-col items-center">
                          <div className="bg-white/20 p-6 rounded-full mb-6 backdrop-blur-xl">
                            {overallTier === 'red' && <ShieldAlert className="w-16 h-16 text-white" />}
                            {overallTier === 'blue' && <Heart className="w-16 h-16 text-white fill-white" />}
                            {overallTier === 'green' && <ShieldCheck className="w-16 h-16 text-white" />}
                            {(overallTier === 'amber' || overallTier === 'brown') && <AlertTriangle className="w-16 h-16 text-white" />}
                          </div>
                          
                          <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">
                            {overallTier === 'red' ? "STOP" : 
                             overallTier === 'blue' ? "BOUNDARY" :
                             overallTier === 'amber' ? "CAUTION" :
                             overallTier === 'brown' ? "DISLIKE" : "SAFE"}
                          </h2>
                          <p className="text-white/80 font-bold mt-2 uppercase text-xs tracking-widest">
                            Immediate Scan Result
                          </p>
                        </CardContent>
                      </Card>

                      {/* SAFE ALTERNATIVES LINK (Hidden by default, click to see) */}
                      {!showSafeTabLink ? (
                        <Button 
                          variant="ghost" 
                          onClick={() => setShowSafeTabLink(true)}
                          className="mt-6 text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white"
                        >
                          Show analysis & safe alternatives
                        </Button>
                      ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
                           <Button className="w-full bg-white text-black font-black h-14 rounded-xl flex items-center justify-between px-6">
                              GO TO SAFE TAB <ArrowRight className="w-4 h-4" />
                           </Button>
                           <p className="text-[10px] text-white/40 italic">You are currently in Immediate Mode.</p>
                        </motion.div>
                      )}

                      <Button onClick={() => setCapturedImage(null)} variant="outline" className="mt-12 w-full text-white border-white/20 bg-transparent h-12">
                        <RotateCcw className="w-4 h-4 mr-2" /> SCAN AGAIN
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
