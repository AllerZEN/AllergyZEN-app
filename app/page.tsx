"use client"

import React, { useState, useEffect } from "react"

// Single source of truth: Zen Spectrum colors
const ZEN_SPECTRUM = {
  RED: "#EF4444",      // High reactivity
  AMBER: "#F59E0B",    // Moderate reactivity
  GREEN: "#22C55E",    // Safe
  BROWN: "#8B4513",    // Dislike
  BLUE: "#3B82F6",     // ED Boundaries
  PURPLE: "#673AB7"    // Brand
}

export default function HomePage() {
  const [redirecting, setRedirecting] = useState(true)

  useEffect(() => {
    // Server-side redirect already happened in middleware
    // This page just loads the HTML app from /index.html
    window.location.href = "/index.html"
  }, [])

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0d0d0d" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", fontWeight: "bold", color: ZEN_SPECTRUM.PURPLE, marginBottom: "10px" }}>allergyZEN</div>
        <div style={{ color: "#a0a0a0", fontSize: "0.9rem" }}>Loading your Wellness Dashboard...</div>
      </div>
    </div>
  )
}
