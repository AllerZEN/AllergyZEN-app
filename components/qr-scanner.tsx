"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  QrCode, Camera, Building2, ShieldCheck, CheckCircle2,
  Handshake, FileCheck, X, Heart, AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
// Ensure this import matches your emailed lib/profile.ts
import userProfile from "@/lib/profile" 

interface BusinessData {
  id: string
  name: string
  type: string
  verified: boolean
}

export function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [scannedBusiness, setScannedBusiness] = useState<BusinessData | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [manualCode, setManualCode] = useState("")

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      const mockBusiness: BusinessData = {
        id: "biz_" + Math.random().toString(36).substr(2, 9),
        name: "The Zen Kitchen",
        type: "Restaurant",
        verified: true
      }
      setScannedBusiness(mockBusiness)
      setScanning(false)
    }, 1500)
  }

  const handleAcknowledge = () => {
    if (!scannedBusiness) return
    // Initiates the 3-hour window defined in your Profile.js logic
    userProfile.startProtectionWindow(scannedBusiness.id, scannedBusiness.name)
    setAcknowledged(true)
    setShowSuccess(true)
  }

  const handleClose = () => {
    setScannedBusiness(null)
    setShowSuccess(false)
    setAcknowledged(false)
    setManualCode("")
  }

  // SCREEN 1: SUCCESS / ACTIVE SHIELD
  if (showSuccess && scannedBusiness) {
    return (
      <Card className="border-green-500 bg-gradient-to-br from-green-50 to-white overflow-hidden shadow-2xl animate-in zoom-in-95">
        <CardContent className="p-8 text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-green-500/30 animate-ping" />
          </div>
          
          <h3 className="text-2xl font-black text-green-700 mb-1">Shield Active</h3>
          <p className="text-lg font-bold text-gray-800">{scannedBusiness.name}</p>
          
          <div className="flex flex-col gap-3 mt-6">
            <Badge className="bg-blue-600 text-white py-2 px-4 rounded-full mx-auto gap-2">
              <Handshake className="w-4 h-4" />
              Neutral Language Pledge Active
            </Badge>
            <p className="text-[11px] text-gray-500 italic">
              "This venue has pledged to remove shame from dietary requirements."
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-red-500 font-bold text-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              3-Hour Handshake in Progress
            </div>
            <Button variant="ghost" onClick={handleClose} className="mt-4 text-gray-400">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // SCREEN 2: PRE-CONFIRMATION (The Handshake Details)
  if (scannedBusiness && !acknowledged) {
    return (
      <Card className="border-blue-600 shadow-xl">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Partner Verified
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-blue-700">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-black text-gray-900">{scannedBusiness.name}</h3>
            <p className="text-sm text-gray-500 uppercase tracking-widest">{scannedBusiness.type}</p>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Your Shared Zen Spectrum:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-600">
                <AlertTriangle className="w-3 h-3" /> Red (Severe)
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                <Heart className="w-3 h-3 fill-blue-500" /> Blue (Sensory)
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-500">
                <AlertTriangle className="w-3 h-3" /> Amber (Moderate)
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
                <CheckCircle2 className="w-3 h-3" /> Brown (Dislike)
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-[11px] text-blue-700 leading-tight">
              <strong>The allergyZEN Promise:</strong> By accepting, this business agrees to the 3-hour data wipe and will use neutral language for all requests.
            </p>
          </div>

          <Button onClick={handleAcknowledge} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-md font-bold rounded-xl shadow-lg">
            Activate 3-Hour Shield
          </Button>
        </CardContent>
      </Card>
    )
  }

  // SCREEN 3: INITIAL SCANNER
  return (
    <Card className="border-blue-100 shadow-md">
      <CardHeader className="text-center pb-2">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
          <QrCode className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl font-black">Activate Handshake</CardTitle>
        <CardDescription>Scan the QR code at any partner venue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanning ? (
          <div className="aspect-square max-w-[200px] mx-auto rounded-2xl bg-gray-900 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 border-2 border-blue-400 opacity-50 animate-pulse" />
            <Camera className="w-12 h-12 text-white/20 animate-bounce" />
          </div>
        ) : (
          <Button onClick={handleScan} className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-bold gap-3">
            <Camera className="w-6 h-6" />
            Open Scanner
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Input
            placeholder="Manual Venue Code"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="rounded-xl h-12"
          />
          <Button variant="outline" className="h-12 px-6 rounded-xl border-blue-200 text-blue-600 font-bold">
            Link
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
