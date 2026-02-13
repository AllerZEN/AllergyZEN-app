"use client"

import Link from "next/link"
import { ArrowLeft, Shield, Lock, Database, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrandLogo } from "@/components/brand-logo"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <span className="font-semibold">Privacy Policy</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-center py-4">
          <BrandLogo size="lg" />
        </div>

        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              allergyZEN Wellness Assistant™ Privacy Policy
            </CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 15, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            {/* Privacy Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <Database className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">Local Storage</p>
                <p className="text-xs text-muted-foreground">Data stays on your device</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">No Health Data Sold</p>
                <p className="text-xs text-muted-foreground">We never sell your data</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <Eye className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">Transparent</p>
                <p className="text-xs text-muted-foreground">Clear data practices</p>
              </div>
            </div>

            <section>
              <h3 className="text-lg font-semibold mb-2">1. Information We Collect</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                allergyZEN Wellness Assistant™ collects and stores the following information locally on your device:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc pl-4">
                <li>
                  <strong>Profile Information:</strong> Your name and selected allergy/sensitivity preferences
                </li>
                <li>
                  <strong>Subscription Status:</strong> Trial start date and subscription tier
                </li>
                <li>
                  <strong>Usage Data:</strong> Daily scan and meal suggestion counts
                </li>
                <li>
                  <strong>App Preferences:</strong> Theme settings and notification preferences
                </li>
              </ul>
            </section>

            <section className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h3 className="text-lg font-semibold mb-2">2. Handshake Session Data & Auto-Wipe</h3>
              <p className="text-sm leading-relaxed">
                <strong>Automatic Data Deletion:</strong> When you activate a Business Handshake protection window, all associated data is automatically deleted from your device once the timer expires (30 minutes, 1 hour, 3 hours, or 24 hours).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                This automatic wipe cannot be reversed. We recommend keeping a backup record of critical allergen information if needed.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">3. How Your Data is Stored</h3>
              <p className="text-sm leading-relaxed">
                <strong>All your allergy and sensitivity data is stored locally in your browser's localStorage.</strong>
                This means your health data never leaves your device.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">4. Third-Party Services</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use Stripe for secure payment processing, Open Food Facts API for product lookups, and Vercel
                Analytics for anonymous usage statistics.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">5. Contact Us</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at privacy@allergyzen.app
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>© 2026 allergyZEN Wellness Assistant™. All rights reserved.</p>
        </div>
      </main>
    </div>
  )
}
