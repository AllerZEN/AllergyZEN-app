"use client"

import React, { useState } from 'react'
// We are intentionally NOT importing AppShell or OnboardingWizard to stop the "ghosting"

export default function Home() {
  const [isScanning, setIsScanning] = useState(false)

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-10">
      {/* 1. AZWAA Logo Header */}
      <header className="pt-16 pb-6 text-center border-b border-gray-50">
        <h1 className="text-4xl font-black italic tracking-tighter text-slate-900">
          allergy<span className="text-blue-600">ZEN</span>
        </h1>
        <p className="text-[10px] font-extrabold tracking-[0.2em] text-gray-400 uppercase mt-1">
          Wellness Assistant App
        </p>
      </header>

      {/* 2. Primary Buttons: SCAN and PROFILE */}
      <div className="flex gap-4 px-6 py-6">
        <button 
          onClick={() => setIsScanning(true)}
          className="flex-1 h-20 bg-slate-900 text-white rounded-3xl font-black text-xl border-2 border-blue-500 shadow-xl active:scale-95 transition-all flex items-center justify-center"
        >
          SCAN 📷
        </button>
        <button className="flex-1 h-20 bg-white text-slate-900 rounded-3xl font-black text-xl border border-gray-200 shadow-sm active:scale-95 transition-all">
          PROFILE
        </button>
      </div>

      {/* 3. The 14-Tab Zen Grid */}
      <main className="grid grid-cols-2 gap-3 px-6">
        <button className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-green-500 shadow-sm active:bg-green-50">Safe 🟢</button>
        <button className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-red-500 shadow-sm active:bg-red-50">Blocked 🔴</button>
        <button className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-blue-500 shadow-sm active:bg-blue-50 text-[10px]">ED Boundaries 🔵</button>
        <button className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-[#78350f] shadow-sm active:bg-orange-50">Dislike 🟤</button>

        <button className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase shadow-sm">Zen Health</button>
        <button className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase shadow-sm">Zen Habits</button>
        
        <button className="p-6 bg-gray-50 rounded-[24px] text-[10px] font-black uppercase shadow-sm leading-tight text-center">My AllerZen<br/>Notes</button>
        <button className="p-6 bg-gray-50 rounded-[24px] text-[10px] font-black uppercase shadow-sm leading-tight text-center">Knowledge<br/>is Power</button>

        <button className="col-span-2 p-8 bg-blue-50 border border-blue-100 rounded-[28px] text-xs font-black uppercase text-blue-700 shadow-sm active:bg-blue-100">
          Business (Handshake/Unshake)
        </button>

        <button className="col-span-2 p-8 bg-red-50 border border-red-100 rounded-[28px] text-red-600 shadow-sm active:bg-red-100">
          <div className="font-black uppercase text-sm text-center">Emergency Relief</div>
          <div className="text-[9px] font-bold opacity-80 uppercase tracking-wider mt-1 text-center">Includes Skin Crisis Mode</div>
        </button>

        <button className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase shadow-sm">Settings</button>
        <button className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase shadow-sm">Subscription</button>
      </main>

      {/* 4. Scanner Overlay Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center">
          <button 
            onClick={() => setIsScanning(false)}
            className="absolute top-12 right-6 bg-white text-black px-8 py-3 rounded-full font-black text-sm shadow-2xl"
          >
            CLOSE ✕
          </button>
          <div className="w-64 h-64 border-2 border-blue-500 rounded-3xl flex items-center justify-center">
            <div className="text-white text-center animate-pulse">
               <div className="text-4xl mb-4">📷</div>
               <p className="text-xs font-bold uppercase tracking-widest">Scanning Zen Spectrum...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
