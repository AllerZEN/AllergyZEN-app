"use client"

import React, { useState } from 'react'
// IMPORTING YOUR EXISTING COMPONENTS
import SafeList from "@/components/safe-list"
import BlockedList from "@/components/blocked-list"
import ZenHealth from "@/components/zen-health"
import ZenHabits from "@/components/zen-habits"
import EmergencyButton from "@/components/emergency-button"
import BusinessTab from "@/components/business-tab"

export default function AllergyZenCommandCenter() {
  const [activeFeature, setActiveFeature] = useState('home')
  const [isScanning, setIsScanning] = useState(false)

  // 1. Feature Switcher (Logic)
  const renderFeature = () => {
    switch (activeFeature) {
      case 'safe': return <SafeList onBack={() => setActiveFeature('home')} />
      case 'blocked': return <BlockedList onBack={() => setActiveFeature('home')} />
      case 'health': return <ZenHealth onBack={() => setActiveFeature('home')} />
      case 'habits': return <ZenHabits onBack={() => setActiveFeature('home')} />
      case 'emergency': return <EmergencyButton onBack={() => setActiveFeature('home')} />
      case 'business': return <BusinessTab onBack={() => setActiveFeature('home')} />
      default: return renderDashboard()
    }
  }

  // 2. Main Dashboard View
  const renderDashboard = () => (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-10">
      <header className="pt-16 pb-6 text-center flex flex-col items-center">
        <img 
          src="/images/allergyzen-logo.png" 
          alt="AZWAA Logo" 
          className="h-20 w-auto mb-2"
        />
        <p className="text-[10px] font-extrabold tracking-[0.2em] text-gray-400 uppercase">
          Wellness Assistant App
        </p>
      </header>

      <div className="flex gap-4 px-6 py-6">
        <button onClick={() => setIsScanning(true)} className="flex-1 h-20 bg-slate-900 text-white rounded-3xl font-black text-xl border-2 border-blue-500 shadow-xl active:scale-95 transition-all">
          SCAN 📷
        </button>
        <button className="flex-1 h-20 bg-white text-slate-900 rounded-3xl font-black text-xl border border-gray-200 shadow-sm">
          PROFILE
        </button>
      </div>

      <main className="grid grid-cols-2 gap-3 px-6">
        {/* Spectrum Tiers with Logic */}
        <button onClick={() => setActiveFeature('safe')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-green-500 active:bg-green-50">Safe 🟢</button>
        <button onClick={() => setActiveFeature('blocked')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-red-500 active:bg-red-50">Blocked 🔴</button>
        <button className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-blue-500">Boundaries 🔵</button>
        <button className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-[#78350f]">Dislike 🟤</button>

        {/* Features with Logic */}
        <button onClick={() => setActiveFeature('health')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase">Zen Health</button>
        <button onClick={() => setActiveFeature('habits')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase">Zen Habits</button>
        
        <button className="p-6 bg-gray-50 rounded-[24px] text-[10px] font-black uppercase text-center leading-tight">My AllerZen<br/>Notes</button>
        <button className="p-6 bg-gray-50 rounded-[24px] text-[10px] font-black uppercase text-center leading-tight">Knowledge<br/>is Power</button>

        <button onClick={() => setActiveFeature('business')} className="col-span-2 p-8 bg-blue-50 border border-blue-100 rounded-[28px] text-xs font-black uppercase text-blue-700">
          Business (Handshake/Unshake)
        </button>

        <button onClick={() => setActiveFeature('emergency')} className="col-span-2 p-8 bg-red-50 border border-red-100 rounded-[28px] text-red-600">
          <div className="font-black uppercase text-sm text-center">Emergency Relief</div>
          <div className="text-[9px] font-bold opacity-80 uppercase text-center mt-1">Includes Skin Crisis Mode</div>
        </button>
      </main>

      {/* Scanner Overlay Mockup */}
      {isScanning && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
          <button onClick={() => setIsScanning(false)} className="absolute top-12 right-6 bg-white text-black px-8 py-3 rounded-full font-black text-sm">CLOSE ✕</button>
          <p className="text-white animate-pulse font-black italic">SEARCHING ZEN SPECTRUM...</p>
        </div>
      )}
    </div>
  )

  return renderFeature()
}
