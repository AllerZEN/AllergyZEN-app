"use client"

import Link from "next/link"
import { ArrowLeft, Shield, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrandLogo } from "@/components/brand-logo"

export default function TermsPage() {
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
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-semibold">Terms of Service</span>
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
              allergyZEN Wellness Assistant™ Terms of Service
            </CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 15, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By accessing or using allergyZEN Wellness Assistant™ ("the App"), you agree to be bound by these Terms
                of Service. If you do not agree to these terms, please do not use the App.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">2. Service Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                allergyZEN Wellness Assistant™ is a wellness and informational tool designed to help users track
                potential allergens and sensitivities in food, personal care, and household products. The App provides
                scanning features, meal suggestions, and educational content about ingredients.
              </p>
            </section>

            <section className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <h3 className="text-lg font-semibold mb-2 text-destructive">3. Important Medical Disclaimer</h3>
              <p className="text-sm leading-relaxed">
                <strong>allergyZEN IS NOT A MEDICAL DEVICE AND DOES NOT PROVIDE MEDICAL ADVICE.</strong> The information
                provided by allergyZEN is for general informational and educational purposes only. It is not intended to
                be a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              <p className="text-sm leading-relaxed mt-2">
                Always seek the advice of your physician, allergist, or other qualified healthcare provider with any
                questions you may have regarding allergies, food sensitivities, or medical conditions.
              </p>
            </section>

            <section className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h3 className="text-lg font-semibold mb-2">4. Business Handshake & Protection Window</h3>
              <p className="text-sm leading-relaxed">
                <strong>The 3-Hour Handshake Feature:</strong> allergyZEN offers a Business Handshake protection window (30 minutes, 1 hour, 3 hours, or 24 hours) designed for temporary data sharing between users and business partners (restaurants, healthcare providers, labs).
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc pl-4">
                <li><strong>Data Wipe Policy:</strong> All data is automatically deleted from the local store once the handshake timer expires.</li>
                <li><strong>Business Liability:</strong> Businesses using the Handshake feature acknowledge that they are responsible for interpreting allergen data and cannot rely solely on allergyZEN for legal compliance.</li>
                <li><strong>User Responsibility:</strong> Users acknowledge that allergyZEN is not responsible for data accuracy after the handshake period ends or for any actions taken by business partners.</li>
                <li><strong>No Liability for Expired Sessions:</strong> allergyZEN assumes no liability for allergic reactions or adverse health outcomes resulting from expired handshake sessions or data loss.</li>
              </ul>
            </section>

            <section className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <h3 className="text-lg font-semibold mb-2">5. Limitation of Liability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ALLERGYZEN, ITS DEVELOPERS,
                AFFILIATES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                <strong>You expressly understand and agree that you use allergyZEN at your sole risk.</strong>
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">6. Subscription and Payments</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                proZEN subscriptions are billed monthly at £6.99. A 7-day free trial is provided for new subscribers.
                You may cancel your subscription at any time through the Stripe Customer Portal.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">7. Contact</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at support@allergyzen.app
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
