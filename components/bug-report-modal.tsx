"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Bug, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BugReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [issueType, setIssueType] = useState("")
  const [productName, setProductName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!issueType || !description) return

    setIsSubmitting(true)

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you'd send this to your backend
    console.log("[v0] Bug report submitted:", { issueType, productName, description })

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset after showing success
    setTimeout(() => {
      setIsSubmitted(false)
      setIssueType("")
      setProductName("")
      setDescription("")
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {isSubmitted ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-bold mb-2">Thank You!</h3>
              <p className="text-muted-foreground text-sm">
                Your report has been submitted. We'll investigate and improve the data.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Bug className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold">Report a Bug</h2>
                    <p className="text-xs text-muted-foreground">Help us improve accuracy</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Form */}
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="issueType">Issue Type *</Label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger id="issueType">
                      <SelectValue placeholder="Select issue type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incorrect-data">Incorrect Ingredient Data</SelectItem>
                      <SelectItem value="missing-product">Missing Product</SelectItem>
                      <SelectItem value="false-positive">False Positive Alert</SelectItem>
                      <SelectItem value="false-negative">Missed Allergen</SelectItem>
                      <SelectItem value="app-bug">App Bug/Error</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name (if applicable)</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Nutella 1000g"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleSubmit}
                  disabled={!issueType || !description || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Your feedback helps us maintain accurate ingredient data for everyone.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
