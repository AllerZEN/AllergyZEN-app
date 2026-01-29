"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  QrCode, 
  Camera, 
  Building2, 
  ShieldCheck, 
  CheckCircle2,
  Handshake,
  FileCheck,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
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

  // Simulate QR scan (in production, use camera API)
  const handleScan = () => {
    setScanning(true)
    
    // Simulate scanning delay
    setTimeout(() => {
      // Mock business data (in production, decode from QR)
      const mockBusiness: BusinessData = {
        id: "biz_" + Math.random().toString(36).substr(2, 9),
        name: "The Zen Kitchen",
        type: "Restaurant",
        verified: true
      }
      
      setScannedBusiness(mockBusiness)
      setScanning(false)
    }, 2000)
  }

  const handleManualEntry = () => {
    if (manualCode.trim().length >= 6) {
      const mockBusiness: BusinessData = {
        id: manualCode.trim(),
        name: "Partner Venue",
        type: "Establishment",
        verified: true
      }
      setScannedBusiness(mockBusiness)
    }
  }

  const handleAcknowledge = () => {
    if (!scannedBusiness) return
    
    // Start protection window
    userProfile.startProtectionWindow(scannedBusiness.id, scannedBusiness.name)
    setAcknowledged(true)
    setShowSuccess(true)
    
    // Simulate business confirmation after 3 seconds
    setTimeout(() => {
      userProfile.confirmByBusiness()
    }, 3000)
  }

  const handleClose = () => {
    setScannedBusiness(null)
    setShowSuccess(false)
    setAcknowledged(false)
    setManualCode("")
  }

  // Success Animation
  if (showSuccess && scannedBusiness) {
    return (
      <Card className="border-success bg-gradient-to-br from-success/10 to-background overflow-hidden">
        <CardContent className="p-6 text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center animate-pulse">
              <ShieldCheck className="w-10 h-10 text-success" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-success/50 animate-ping" />
          </div>
          
          <h3 className="text-xl font-bold text-success mb-2">Shield Activated</h3>
          <p className="text-lg font-medium mb-1">{scannedBusiness.name}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Your sensitivities have been shared securely
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className="bg-success/20 text-success border-success/30 gap-1">
              <Handshake className="w-3 h-3" />
              Neutral Language Pledge Active
            </Badge>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground mb-4">
            <p className="flex items-center justify-center gap-1">
              <FileCheck className="w-3 h-3" />
              Digital acknowledgement recorded for your protection
            </p>
          </div>
          
          <Button variant="outline" onClick={handleClose} className="bg-transparent">
            Close
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Business Confirmation Screen
  if (scannedBusiness && !acknowledged) {
    return (
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Business Detected
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{scannedBusiness.name}</h3>
                <p className="text-sm text-muted-foreground">{scannedBusiness.type}</p>
                {scannedBusiness.verified && (
                  <Badge variant="outline" className="mt-1 text-xs gap-1 border-success/30 text-success">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Partner
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">This will share:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Your allergen profile (Red List)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Boundary preferences (if set)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Protection window timestamp
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Handshake className="w-3 h-3" />
              <strong>Neutral Language Pledge:</strong> This venue agrees to use professional, non-judgmental language regarding dietary requirements.
            </p>
          </div>

          <Button onClick={handleAcknowledge} className="w-full gap-2">
            <ShieldCheck className="w-4 h-4" />
            Activate 3-Hour Shield
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Scanner Interface
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          Scan Business QR
        </CardTitle>
        <CardDescription>
          Connect with allergyZEN partner venues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanning ? (
          <div className="aspect-square max-w-[200px] mx-auto rounded-lg bg-muted flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">Scanning...</p>
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleScan} 
            className="w-full gap-2" 
            size="lg"
          >
            <Camera className="w-5 h-5" />
            Open Camera Scanner
          </Button>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or enter code manually
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Enter venue code..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            onClick={handleManualEntry}
            disabled={manualCode.trim().length < 6}
            className="bg-transparent"
          >
            Connect
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Look for the allergyZEN QR code at participating venues
        </p>
      </CardContent>
    </Card>
  )
}
