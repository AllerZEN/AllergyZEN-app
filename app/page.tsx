"use client"

import { useEffect } from "react"

export default function HomePage() {
  useEffect(() => {
    window.location.href = "/index.html"
  }, [])

  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        color: "#e0e0e0",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <p>Loading allergyZEN...</p>
    </div>
  )
}
