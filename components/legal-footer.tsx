"use client"

import Link from "next/link"
import { Shield } from "lucide-react"
import { LotusIcon } from "@/components/brand-logo"

export function LegalFooter() {
  return (
    <footer className="mt-8 pt-6 border-t border-border">
      {/* Legal Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 mb-4">
        <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Disclaimer:</strong> allergyZEN Wellness Assistant™ is a wellness tool, not medical advice. Always
          consult a healthcare professional for severe allergies.
        </p>
      </div>

      {/* Links and Copyright */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link href="/terms" className="text-muted-foreground hover:text-[#8E55A2] transition-colors">
            Terms of Service
          </Link>
          <span className="text-muted-foreground/50">|</span>
          <Link href="/privacy" className="text-muted-foreground hover:text-[#8E55A2] transition-colors">
            Privacy Policy
          </Link>
        </div>

        {/* Mini logo and copyright */}
        <div className="flex items-center justify-center gap-2">
          <LotusIcon size={16} />
          <p className="text-xs text-muted-foreground font-medium">
            © 2026 allergyZEN Wellness Assistant™. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
