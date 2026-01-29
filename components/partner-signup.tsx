"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Shield, 
  QrCode, 
  CheckCircle2, 
  FileSignature,
  Heart,
  Lock,
  Eye,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BusinessDetails {
  businessName: string
  contactName: string
  email: string
  phone: string
  address: string
  businessType: string
}

interface PartnerSignupProps {
  onComplete?: (businessId: string, businessName: string, qrData: string) => void
}

export function PartnerSignup({ onComplete }: PartnerSignupProps) {
  const [step, setStep] = useState<"details" | "pledge" | "complete">("details")
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    businessType: "restaurant"
  })
  const [pledgeAccepted, setPledgeAccepted] = useState({
    neutralLanguage: false,
    privacyProtection: false,
    dataMinimization: false,
    acknowledgement: false
  })
  const [generatedQR, setGeneratedQR] = useState<{
    businessId: string
    qrData: string
  } | null>(null)

  const allPledgesAccepted = Object.values(pledgeAccepted).every(Boolean)

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (businessDetails.businessName && businessDetails.contactName && businessDetails.email) {
      setStep("pledge")
    }
  }

  const handlePledgeSign = () => {
    if (!allPledgesAccepted) return

    // Generate unique business ID
    const businessId = `AZ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    // Create QR data payload
    const qrData = JSON.stringify({
      businessId,
      businessName: businessDetails.businessName,
      businessType: businessDetails.businessType,
      signedAt: new Date().toISOString(),
      pledgeVersion: "1.0"
    })

    setGeneratedQR({ businessId, qrData })
    setStep("complete")

    // Save to localStorage for business portal
    if (typeof window !== "undefined") {
      const partners = JSON.parse(localStorage.getItem("allergyzen_partners") || "[]")
      partners.push({
        ...businessDetails,
        businessId,
        signedAt: new Date().toISOString(),
        pledges: pledgeAccepted
      })
      localStorage.setItem("allergyzen_partners", JSON.stringify(partners))
    }

    onComplete?.(businessId, businessDetails.businessName, qrData)
  }

  const downloadQRCode = () => {
    if (!generatedQR) return
    
    // Create a simple text-based QR representation for download
    const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(generatedQR.qrData)}`
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `allergyzen-qr-${generatedQR.businessId}.txt`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Partner Gateway</h1>
          <p className="text-muted-foreground mt-1">Join the allergyZEN Trusted Network</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["details", "pledge", "complete"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step === s ? "bg-primary text-primary-foreground" :
                ["pledge", "complete"].indexOf(step) >= i ? "bg-primary/20 text-primary" :
                "bg-muted text-muted-foreground"
              )}>
                {i + 1}
              </div>
              {i < 2 && (
                <div className={cn(
                  "w-12 h-0.5 mx-1",
                  ["pledge", "complete"].indexOf(step) > i ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Business Details */}
        {step === "details" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Business Details
              </CardTitle>
              <CardDescription>
                Tell us about your establishment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., The Green Kitchen"
                    value={businessDetails.businessName}
                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, businessName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <select
                    id="businessType"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    value={businessDetails.businessType}
                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, businessType: e.target.value }))}
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="hotel">Hotel</option>
                    <option value="catering">Catering Service</option>
                    <option value="food_truck">Food Truck</option>
                    <option value="bakery">Bakery</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    placeholder="Your name"
                    value={businessDetails.contactName}
                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, contactName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@business.com"
                    value={businessDetails.email}
                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 123 456 7890"
                    value={businessDetails.phone}
                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    placeholder="123 High Street, London"
                    value={businessDetails.address}
                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Continue to Pledge
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Neutral Language & Privacy Pledge */}
        {step === "pledge" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-primary" />
                Neutral Language & Privacy Pledge
              </CardTitle>
              <CardDescription>
                Digital signature required to join the Trusted Network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pledge Items */}
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="neutralLanguage"
                      checked={pledgeAccepted.neutralLanguage}
                      onCheckedChange={(checked) => 
                        setPledgeAccepted(prev => ({ ...prev, neutralLanguage: checked as boolean }))
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="neutralLanguage" className="font-medium flex items-center gap-2">
                        <Heart className="w-4 h-4 text-blue-500" />
                        Neutral Language Commitment
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I commit to using neutral, non-judgmental language when discussing allergies 
                        and dietary requirements. I will not use terms that may cause distress or 
                        anxiety to customers with food sensitivities.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="privacyProtection"
                      checked={pledgeAccepted.privacyProtection}
                      onCheckedChange={(checked) => 
                        setPledgeAccepted(prev => ({ ...prev, privacyProtection: checked as boolean }))
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="privacyProtection" className="font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-green-500" />
                        Privacy Protection
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I will protect customer health data and never share, store, or discuss 
                        individual allergy profiles beyond what is necessary for safe food preparation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dataMinimization"
                      checked={pledgeAccepted.dataMinimization}
                      onCheckedChange={(checked) => 
                        setPledgeAccepted(prev => ({ ...prev, dataMinimization: checked as boolean }))
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="dataMinimization" className="font-medium flex items-center gap-2">
                        <Eye className="w-4 h-4 text-amber-500" />
                        Data Minimization
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I will only access the minimum allergy information needed for each order 
                        and will not retain customer data after service completion.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-primary/30 rounded-lg bg-primary/5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="acknowledgement"
                      checked={pledgeAccepted.acknowledgement}
                      onCheckedChange={(checked) => 
                        setPledgeAccepted(prev => ({ ...prev, acknowledgement: checked as boolean }))
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="acknowledgement" className="font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Final Acknowledgement
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I understand that this digital signature represents my business commitment 
                        to the allergyZEN Wellness network and that violations may result in removal 
                        from the Trusted Partner program.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Line */}
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Signing as: <span className="font-medium text-foreground">{businessDetails.contactName}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  On behalf of: <span className="font-medium text-foreground">{businessDetails.businessName}</span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("details")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handlePledgeSign}
                  disabled={!allPledgesAccepted}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Sign & Generate QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: QR Code Generated */}
        {step === "complete" && generatedQR && (
          <Card className="border-primary/30">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <CardTitle>Welcome to the Trusted Network!</CardTitle>
              <CardDescription>
                Your unique QR code has been generated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business ID Badge */}
              <div className="text-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  Business ID: {generatedQR.businessId}
                </Badge>
              </div>

              {/* QR Code Display */}
              <div className="p-6 bg-white rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center">
                <div className="w-48 h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-4 relative">
                  <QrCode className="w-32 h-32 text-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">{businessDetails.businessName}</p>
                <p className="text-xs text-muted-foreground">allergyZEN Trusted Partner</p>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Next Steps:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Print this QR code and display it at your entrance</li>
                  <li>Customers will scan to sync their allergy profile</li>
                  <li>Accept incoming requests in your partner dashboard</li>
                  <li>Confirm acknowledgement to activate their protection shield</li>
                </ol>
              </div>

              {/* Download Button */}
              <Button onClick={downloadQRCode} className="w-full bg-transparent" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download QR Code Data
              </Button>

              {/* Access Dashboard */}
              <Button className="w-full bg-primary hover:bg-primary/90">
                Access Partner Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PartnerSignup
