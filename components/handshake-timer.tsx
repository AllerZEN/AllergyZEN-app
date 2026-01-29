"use client"

import { useState, useEffect } from "react"
import { Timer, ShieldOff, RefreshCw, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface HandshakeProps {
  onUnshake: () => void; // The "Un-shake" manual wipe function
}

export function HandshakeTimer({ onUnshake }: HandshakeProps) {
  // Options: 30min, 1hr, 3hr, 24hr (Converted to minutes)
  const options = [
    { label: "30 Min", value: 30 },
    { label: "1 Hr", value: 60 },
    { label: "3 Hr", value: 180 },
    { label: "24 Hr", value: 1440 }
  ]

  const [selectedTime, setSelectedTime] = useState(180) // Default 3hr
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null))
      }, 60000) // Update every minute
    } else if (timeLeft === 0) {
      handleWipe()
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const startHandshake = () => {
    setTimeLeft(selectedTime)
    setIsActive(true)
  }

  const handleWipe = () => {
    setIsActive(false)
    setTimeLeft(null)
    onUnshake() // Trigger the data wipe in the parent component/database
    alert("Handshake Expired: Data Wiped from Business Dashboard.")
  }

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <Card className="border-2 border-blue-200 overflow-hidden bg-white shadow-xl">
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-bold uppercase tracking-widest text-sm">Zen Handshake</span>
        </div>
        {isActive && (
          <Badge className="bg-blue-400 animate-pulse">Active Shield</Badge>
        )}
      </div>

      <CardContent className="p-6 space-y-6">
        {!isActive ? (
          <>
            <div className="text-center space-y-2">
              <p className="text-gray-600 text-sm italic">Select how long the business can see your Zen Shield:</p>
              <div className="grid grid-cols-4 gap-2">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedTime(opt.value)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                      selectedTime === opt.value 
                      ? "border-blue-600 bg-blue-50 text-blue-600" 
                      : "border-gray-100 bg-gray-50 text-gray-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <Button 
              onClick={startHandshake}
              className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-lg font-bold shadow-lg"
            >
              Generate Secure QR
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-full w-48 h-48 mx-auto border-4 border-blue-200 relative">
              <span className="text-xs font-bold text-blue-400 uppercase">Time Remaining</span>
              <span className="text-4xl font-black text-blue-600">
                {timeLeft !== null ? formatTime(timeLeft) : "0m"}
              </span>
              <div className="absolute -bottom-2 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> SECURE
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setTimeLeft((prev) => (prev || 0) + 60)}
                className="border-blue-200 text-blue-600 font-bold"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> +1 Hour
              </Button>

              {/* THE UN-SHAKE BUTTON */}
              <Button 
                variant="destructive" 
                onClick={handleWipe}
                className="bg-red-500 hover:bg-red-600 font-bold"
              >
                <ShieldOff className="w-4 h-4 mr-2" /> Un-Shake
              </Button>
            </div>
            <p className="text-[10px] text-center text-gray-400 px-4">
              Clicking "Un-shake" or letting the timer hit zero instantly wipes your sensory/allergy data from the business dashboard.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
