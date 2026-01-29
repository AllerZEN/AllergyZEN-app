"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, FileText, Loader2, AlertTriangle, CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DetectedItem {
  name: string
  tier: "red" | "yellow" | "green"
  confidence: number
}

interface ScanResult {
  items: DetectedItem[]
  rawText: string
}

export function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setResult(null)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile)
      setPreview(URL.createObjectURL(droppedFile))
      setResult(null)
    }
  }

  async function processImage() {
    if (!file) return

    setScanning(true)

    // Mock OCR function - simulates reading text from image
    // This can be connected to a real OCR API (Google Vision, Tesseract, etc.)
    await mockOCRProcess()

    setScanning(false)
  }

  async function mockOCRProcess() {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock detected items from "allergy test results"
    const mockResults: ScanResult = {
      rawText:
        "Allergy Panel Results:\n- Casein: Positive (High)\n- Gluten: Positive (Moderate)\n- Rice Protein: Positive (High)\n- Coconut: Positive (Low)\n- Egg White: Negative\n- Soy: Negative",
      items: [
        { name: "Casein (Dairy)", tier: "red", confidence: 95 },
        { name: "Gluten/Wheat", tier: "red", confidence: 87 },
        { name: "Rice Protein", tier: "red", confidence: 92 },
        { name: "Coconut", tier: "yellow", confidence: 68 },
        { name: "Egg White", tier: "green", confidence: 89 },
        { name: "Soy", tier: "green", confidence: 91 },
      ],
    }

    setResult(mockResults)
  }

  function clearUpload() {
    setFile(null)
    setPreview(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const tierColors = {
    red: "bg-destructive/20 text-destructive border-destructive/30",
    yellow: "bg-warning/20 text-warning border-warning/30",
    green: "bg-success/20 text-success border-success/30",
  }

  const tierLabels = {
    red: "Add to Red Tier",
    yellow: "Add to Yellow Tier",
    green: "Safe - No Action",
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Upload Results
          </CardTitle>
          <CardDescription>
            Upload a screenshot of your allergy test results to automatically detect and categorize allergens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="w-full rounded-lg border border-border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={clearUpload}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {preview && !result && (
            <Button onClick={processImage} disabled={scanning} className="w-full gap-2">
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning with OCR...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Scan Image
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Detected Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Extracted Text:</p>
              <pre className="text-xs whitespace-pre-wrap font-mono">{result.rawText}</pre>
            </div>

            <div className="space-y-2">
              {result.items.map((item, i) => (
                <div
                  key={i}
                  className={cn("flex items-center justify-between p-3 rounded-lg border", tierColors[item.tier])}
                >
                  <div className="flex items-center gap-2">
                    {item.tier === "red" && <AlertTriangle className="w-4 h-4" />}
                    {item.tier === "green" && <CheckCircle2 className="w-4 h-4" />}
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.confidence}% match
                    </Badge>
                    <span className="text-xs">{tierLabels[item.tier]}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full bg-transparent" variant="outline">
              Save All Detected Items
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
