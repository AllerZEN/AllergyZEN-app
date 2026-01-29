"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Check, Sparkles, Shield, Heart, Home, Smartphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ALLERGY_CATEGORIES, createNewProfile, type AllergyCategory } from "@/lib/user-profile"
import { BrandLogo, LotusIcon } from "@/components/brand-logo"
import { cn } from "@/lib/utils"

interface OnboardingWizardProps {
  onComplete: () => void
}

const TUTORIAL_SLIDES = [
  {
    id: "home",
    title: "Your Wellness Home",
    icon: Home,
    color: "bg-purple-100 text-purple-600",
    description: "The Home tab is your command center. See your Zen Score, active protection timer, and quick profile access all in one place.",
    tip: "Tap the Home icon anytime to return to safety."
  },
  {
    id: "shield",
    title: "The Zen Spectrum",
    icon: Shield,
    color: "bg-green-100 text-green-600",
    description: "Red = Danger, Amber = Caution, Green = Safe, Blue = Boundaries. Tag items to your personal spectrum for instant recognition.",
    tip: "Scan any product to instantly check against your spectrum."
  },
  {
    id: "boundaries",
    title: "Boundaries - Your Safe Space",
    icon: Heart,
    color: "bg-blue-100 text-blue-600",
    description: "The blue heart is your judgment-free zone. Set texture preferences, deconstruction requests, and sensory support without explanation.",
    tip: "Your boundaries are valid. No one needs to know why."
  },
  {
    id: "zenhealth",
    title: "ZenHealth - Lifestyle Vibe",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-600",
    description: "Track calories, steps, water, and custom goals. Sync with your device's health app or log manually. It's your wellness journey.",
    tip: "Small consistent actions lead to big results."
  },
  {
    id: "crossplatform",
    title: "Take Zen Everywhere",
    icon: Smartphone,
    color: "bg-amber-100 text-amber-600",
    description: "Install allergyZEN on your home screen for instant access. Works offline and syncs when you're back online.",
    tip: "Add to Home Screen for the full app experience."
  },
  {
    id: "finish",
    title: "You're All Set!",
    icon: Check,
    color: "bg-green-100 text-green-600",
    description: "Your personalized wellness sanctuary is ready. Remember: You owe no one an explanation. You are safe here.",
    tip: "Toggle 'Don't show again' below to skip this tutorial next time."
  }
]

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialSlide, setTutorialSlide] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const steps = [
    { id: "welcome", title: "Welcome" },
    { id: "name", title: "Your Name" },
    { id: "allergies", title: "Select Allergies" },
    { id: "tutorial", title: "Quick Tour" },
    { id: "complete", title: "Ready!" },
  ]

  const toggleAllergy = (id: string) => {
    setSelectedAllergies((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const handleComplete = () => {
    createNewProfile(name || "User", selectedAllergies)
    if (dontShowAgain) {
      localStorage.setItem("allergyzen_skip_tutorial", "true")
    }
    onComplete()
  }

  const nextTutorialSlide = () => {
    if (tutorialSlide < TUTORIAL_SLIDES.length - 1) {
      setTutorialSlide(tutorialSlide + 1)
    } else {
      setStep(4) // Go to complete step
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <motion.div
          className="h-full bg-[#8E55A2]"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-md"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-[#8E55A2]/10 flex items-center justify-center"
              >
                <LotusIcon size={64} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <BrandLogo size="xl" centered />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-500 text-lg mb-4 italic"
              >
                "You owe no one an explanation. You are safe here."
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 mb-8"
              >
                Your personal wellness companion for navigating life with allergies and sensitivities
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-4 mb-8"
              >
                <div className="p-4 rounded-xl bg-white border-2 border-gray-200">
                  <Shield className="w-6 h-6 text-[#8E55A2] mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Smart Scanning</p>
                </div>
                <div className="p-4 rounded-xl bg-white border-2 border-gray-200">
                  <Sparkles className="w-6 h-6 text-[#8E55A2] mx-auto mb-2" />
                  <p className="text-xs text-gray-600">AI Powered</p>
                </div>
                <div className="p-4 rounded-xl bg-white border-2 border-gray-200">
                  <Heart className="w-6 h-6 text-[#8E55A2] mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Personalized</p>
                </div>
              </motion.div>

              <Button size="lg" onClick={() => setStep(1)} className="gap-2 bg-[#1A1A1B] hover:bg-[#2A2A2B] text-white">
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 1: Name */}
          {step === 1 && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-md w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#8E55A2]/10 flex items-center justify-center"
              >
                <span className="text-3xl">&#128075;</span>
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">What should we call you?</h2>
              <p className="text-gray-500 mb-8">This helps us personalize your experience</p>

              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center text-lg h-14 mb-6 border-2 border-gray-300 focus:border-[#8E55A2]"
                autoFocus
              />

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setStep(0)} className="border-2 border-gray-800 text-gray-800">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button onClick={() => setStep(2)} disabled={!name.trim()} className="bg-[#1A1A1B] hover:bg-[#2A2A2B] text-white">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Allergy Selection - Clean Slate */}
          {step === 2 && (
            <motion.div
              key="allergies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Hi {name}! Build Your Zen Spectrum</h2>
                <p className="text-gray-500">Choose your sensitivities - you can always change these later</p>
                <p className="text-xs text-gray-400 mt-1">Leave blank for a clean slate start</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 max-h-[50vh] overflow-y-auto p-1">
                {ALLERGY_CATEGORIES.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <AllergyCard
                      category={category}
                      selected={selectedAllergies.includes(category.id)}
                      onToggle={() => toggleAllergy(category.id)}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setStep(1)} className="border-2 border-gray-800 text-gray-800">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="bg-[#1A1A1B] hover:bg-[#2A2A2B] text-white">
                  {selectedAllergies.length === 0 ? "Continue with Clean Slate" : `Continue (${selectedAllergies.length} selected)`}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Tutorial */}
          {step === 3 && (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Quick Tour</h2>
                <p className="text-gray-500">Learn the essentials in 6 slides</p>
              </div>

              <Card className="border-2 border-gray-200 mb-6">
                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tutorialSlide}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-center"
                    >
                      {(() => {
                        const slide = TUTORIAL_SLIDES[tutorialSlide]
                        const Icon = slide.icon
                        return (
                          <>
                            <div className={cn("w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center", slide.color)}>
                              <Icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">{slide.title}</h3>
                            <p className="text-gray-600 mb-4">{slide.description}</p>
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                              <p className="text-sm text-gray-500 italic">Tip: {slide.tip}</p>
                            </div>
                          </>
                        )
                      })()}
                    </motion.div>
                  </AnimatePresence>

                  {/* Slide indicators */}
                  <div className="flex justify-center gap-2 mt-6">
                    {TUTORIAL_SLIDES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTutorialSlide(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          i === tutorialSlide ? "w-8 bg-[#8E55A2]" : "bg-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3 justify-center">
                  {tutorialSlide > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setTutorialSlide(tutorialSlide - 1)}
                      className="border-2 border-gray-800 text-gray-800"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button onClick={nextTutorialSlide} className="bg-[#1A1A1B] hover:bg-[#2A2A2B] text-white flex-1">
                    {tutorialSlide < TUTORIAL_SLIDES.length - 1 ? "Next" : "Finish Tour"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <label className="flex items-center gap-2 justify-center text-sm text-gray-500 cursor-pointer">
                  <Checkbox 
                    checked={dontShowAgain}
                    onCheckedChange={(checked) => setDontShowAgain(!!checked)}
                  />
                  Don't show this tutorial again
                </label>

                <Button 
                  variant="ghost" 
                  onClick={() => setStep(4)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Skip Tour
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-md"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center"
              >
                <Check className="w-12 h-12 text-[#22C55E]" />
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-800 mb-4">You're all set, {name}!</h2>
              <p className="text-gray-500 mb-2 italic">
                "You owe no one an explanation. You are safe here."
              </p>
              <p className="text-gray-600 mb-6">
                Your Zen Spectrum is ready with{" "}
                {selectedAllergies.length > 0 ? `${selectedAllergies.length} sensitivities` : "a clean slate"}.
              </p>

              {selectedAllergies.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {selectedAllergies.slice(0, 6).map((id) => {
                    const category = ALLERGY_CATEGORIES.find((c) => c.id === id)
                    return (
                      <span
                        key={id}
                        className="px-3 py-1.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] text-sm font-medium"
                      >
                        {category?.icon} {category?.name}
                      </span>
                    )
                  })}
                  {selectedAllergies.length > 6 && (
                    <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                      +{selectedAllergies.length - 6} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setStep(2)} className="border-2 border-gray-800 text-gray-800">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Edit Spectrum
                </Button>
                <Button size="lg" onClick={handleComplete} className="gap-2 bg-[#1A1A1B] hover:bg-[#2A2A2B] text-white">
                  <Sparkles className="w-4 h-4" />
                  Start Using allergyZEN
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step indicators */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-2">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === step ? "w-8 bg-[#8E55A2]" : i < step ? "bg-[#8E55A2]/50" : "bg-gray-200",
            )}
          />
        ))}
      </div>
    </div>
  )
}

function AllergyCard({
  category,
  selected,
  onToggle,
}: {
  category: AllergyCategory
  selected: boolean
  onToggle: () => void
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border-2",
        selected ? "border-[#EF4444] bg-[#EF4444]/5" : "border-gray-200 hover:border-[#8E55A2]/30",
      )}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-2xl">{category.icon}</span>
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
              selected ? "border-[#EF4444] bg-[#EF4444] text-white" : "border-gray-300",
            )}
          >
            {selected && <Check className="w-3 h-3" />}
          </div>
        </div>
        <h3 className="font-semibold text-sm text-gray-800 mb-1">{category.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{category.description}</p>
      </CardContent>
    </Card>
  )
}
