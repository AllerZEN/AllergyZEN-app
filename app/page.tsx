"use client"

import React, { useState } from 'react'

export default function AllergyZenCommandCenter() {
  const [activeTab, setActiveTab] = useState('home')
  const [isScanning, setIsScanning] = useState(false)

  // 1. Navigation Handler
  const navigateTo = (tabName: string) => {
    console.log(`Navigating to: ${tabName}`)
    setActiveTab(tabName)
    // In the next step, we will import your specific components 
    // like <ZenHealth /> or <EmergencyRelief /> here.
  }

  if (isScanning) {
    return (
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
             <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Zen Engine Active</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-10">
      {/* 2. Official AZWAA Logo Area */}
      <header className="pt-16 pb-6 text-center border-b border-gray-50 flex flex-col items-center">
        <img 
          src="/images/allergyzen-logo.png" 
          alt="Official AZWAA Logo" 
          className="h-16 w-auto mb-2"
          onError={(e) => {
            // Fallback if image isn't found in public folder yet
            e.currentTarget.src = "https://placeholder.com/150x50?text=AZWAA+LOGO"
          }}
        />
        <p className="text-[10px] font-extrabold tracking-[0.2em] text-gray-400 uppercase">
          Wellness Assistant App
        </p>
      </header>

      {/* 3. Primary Action Bar */}
      <div className="flex gap-4 px-6 py-6">
        <button 
          onClick={() => setIsScanning(true)}
          className="flex-1 h-20 bg-slate-900 text-white rounded-3xl font-black text-xl border-2 border-blue-500 shadow-xl active:scale-95 transition-all"
        >
          SCAN 📷
        </button>
        <button 
          onClick={() => navigateTo('profile')}
          className="flex-1 h-20 bg-white text-slate-900 rounded-3xl font-black text-xl border border-gray-200 shadow-sm active:scale-95 transition-all"
        >
          PROFILE
        </button>
      </div>

      {/* 4. The 14-Tab Zen Grid */}
      <main className="grid grid-cols-2 gap-3 px-6">
        <button onClick={() => navigateTo('safe')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-green-500 shadow-sm active:bg-green-50">Safe 🟢</button>
        <button onClick={() => navigateTo('blocked')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-red-500 shadow-sm active:bg-red-50">Blocked 🔴</button>
        <button onClick={() => navigateTo('boundaries')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-blue-500 shadow-sm active:bg-blue-50 text-[10px]">ED Boundaries 🔵</button>
        <button onClick={() => navigateTo('dislike')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase border-b-4 border-[#78350f] shadow-sm active:bg-orange-50">Dislike 🟤</button>

        <button onClick={() => navigateTo('health')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase shadow-sm active:bg-gray-100">Zen Health</button>
        <button onClick={() => navigateTo('habits')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase shadow-sm active:bg-gray-100">Zen Habits</button>
        
        <button onClick={() => navigateTo('notes')} className="p-6 bg-gray-50 rounded-[24px] text-[10px] font-black uppercase shadow-sm leading-tight text-center">My AllerZen<br/>Notes</button>
        <button onClick={() => navigateTo('knowledge')} className="p-6 bg-gray-50 rounded-[24px] text-[10px] font-black uppercase shadow-sm leading-tight text-center">Knowledge<br/>is Power</button>

        <button onClick={() => navigateTo('business')} className="col-span-2 p-8 bg-blue-50 border border-blue-100 rounded-[28px] text-xs font-black uppercase text-blue-700 shadow-sm active:bg-blue-100">
          Business (Handshake/Unshake)
        </button>

        <button onClick={() => navigateTo('emergency')} className="col-span-2 p-8 bg-red-50 border border-red-100 rounded-[28px] text-red-600 shadow-sm active:bg-red-100">
          <div className="font-black uppercase text-sm text-center">Emergency Relief</div>
          <div className="text-[9px] font-bold opacity-80 uppercase tracking-wider mt-1 text-center">Includes Skin Crisis Mode</div>
        </button>

        <button onClick={() => navigateTo('settings')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase shadow-sm">Settings</button>
        <button onClick={() => navigateTo('subscription')} className="p-6 bg-gray-50 rounded-[24px] text-xs font-black uppercase shadow-sm">Subscription</button>
      </main>
    </div>
  )
}
