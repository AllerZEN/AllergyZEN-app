"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LotusIcon } from "./brand-logo"
import { SkinCrisisButton } from "./skin-crisis-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, HelpCircle, Scan, Shield, Lock, Send, CheckCircle2, MessageSquare } from "lucide-react"

interface SupportPageProps {
  onBack: () => void
}

export function SupportPage({ onBack }: SupportPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const faqs = [
    {
      id: "scanner",
      icon: <Scan className="w-5 h-5 text-primary" />,
      question: "How do I use the scanner?",
      answer:
        "Tap the purple Scan button and point your camera at an allergyZEN QR code at any participating venue. You can also search for products by name or brand using the search bar on the dashboard.",
    },
    {
      id: "colors",
      icon: <Shield className="w-5 h-5 text-primary" />,
      question: "What do the traffic light colors mean?",
      answer:
        "Red = Avoid (contains one of your high-reactivity triggers), Orange = Caution (may contain hidden sources or moderate sensitivities), Green = Safe Alternative (verified safe for your profile).",
    },
    {
      id: "privacy",
      icon: <Lock className="w-5 h-5 text-primary" />,
      question: "Is my data private?",
      answer:
        "Yes, your sensitivity list is stored locally on your device to ensure your wellness data remains yours. We never share your health information with third parties, and all scan logs are encrypted on your device.",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
    setFormData({ name: "", email: "", message: "" })

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Help & Support</h1>
          <p className="text-sm text-muted-foreground">Get answers and reach out</p>
        </div>
      </div>

      {/* Logo Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6 pb-6 flex flex-col items-center gap-3">
          <LotusIcon size={64} />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="w-2 h-2 rounded-full bg-[#F97316]" />
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            </div>
            <h2 className="text-lg font-bold">
              <span className="text-foreground">allergy</span>
              <span className="font-light text-foreground">ZEN</span>
            </h2>
            <p className="text-xs text-muted-foreground">Wellness Assistant™</p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">{faq.icon}</div>
                    <span className="font-medium text-sm">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-14 pr-4 text-muted-foreground text-sm">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="p-3 rounded-full bg-success/20">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <div>
                <p className="font-semibold text-success">Message Sent!</p>
                <p className="text-sm text-muted-foreground">We'll get back to you as soon as possible.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Describe your question or issue..."
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="bg-background resize-none"
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Skin Crisis Mode Button - Always visible at bottom */}
      <div className="pt-2">
        <SkinCrisisButton />
      </div>
    </div>
  )
}
