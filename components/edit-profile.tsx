"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  User, Users, Plus, Trash2, Search, Check,
  AlertTriangle, AlertCircle, Heart, Pill, Camera, Palette
} from "lucide-react"
import userProfile, { FamilyMember, THEME_COLORS, ThemeColor } from "@/lib/profile"
import allergensData from "@/allergens.json"

interface AllergenItem {
  name: string
  category: string
}

type TriggerCategory = "red" | "amber" | "blue"

export function EditProfile() {
  const [profiles, setProfiles] = useState<FamilyMember[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [newName, setNewName] = useState("")
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<TriggerCategory>("red")
  const [mounted, setMounted] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>("purple")

  useEffect(() => {
    setMounted(true)
    setProfiles([...userProfile.profiles])
    setActiveIndex(userProfile.session?.activeProfileIndex || 0)
    setSelectedTheme(userProfile.getThemeColor())
  }, [])

  const activeProfile = profiles[activeIndex]

  const allAllergens: AllergenItem[] = [
    ...(allergensData.high_reactivity || []),
    ...(allergensData.moderate_reactivity || [])
  ] as AllergenItem[]

  const filteredAllergens = search.trim()
    ? allAllergens.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase().trim())
      ).slice(0, 20)
    : []

  const handleAddProfile = () => {
    if (!newName.trim()) return
    const member = userProfile.addFamilyMember(newName.trim())
    setProfiles([...userProfile.profiles])
    setNewName("")
  }

  const handleRemoveProfile = (index: number) => {
    if (index === 0) return
    userProfile.removeFamilyMember(index)
    setProfiles([...userProfile.profiles])
    if (activeIndex >= userProfile.profiles.length) {
      setActiveIndex(0)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      userProfile.setProfilePhoto(base64)
      setProfiles([...userProfile.profiles])
    }
    reader.readAsDataURL(file)
  }

  const handleThemeChange = (theme: ThemeColor) => {
    setSelectedTheme(theme)
    userProfile.setThemeColor(theme)
    setProfiles([...userProfile.profiles])
  }

  const handleSwitchProfile = (index: number) => {
    setActiveIndex(index)
    userProfile.switchProfile(index)
    setSelectedTheme(userProfile.profiles[index]?.themeColor || "purple")
  }

  const handleAddTrigger = (item: AllergenItem, category: TriggerCategory) => {
    if (!activeProfile) return
    
    const triggerKey = `${category}:${item.name}`
    const currentAllergies = activeProfile.allergies || []
    
    if (!currentAllergies.includes(triggerKey)) {
      const updated = [...currentAllergies, triggerKey]
      userProfile.updateAllergies(activeIndex, updated)
      setProfiles([...userProfile.profiles])
    }
    setSearch("")
  }

  const handleRemoveTrigger = (trigger: string) => {
    if (!activeProfile) return
    
    const updated = (activeProfile.allergies || []).filter(t => t !== trigger)
    userProfile.updateAllergies(activeIndex, updated)
    setProfiles([...userProfile.profiles])
  }

  const getCategoryIcon = (cat: TriggerCategory) => {
    switch (cat) {
      case "red": return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "amber": return <AlertCircle className="w-4 h-4 text-orange-500" />
      case "blue": return <Heart className="w-4 h-4 text-blue-500" />
    }
  }

  const getCategoryColor = (cat: TriggerCategory) => {
    switch (cat) {
      case "red": return "bg-red-500"
      case "amber": return "bg-orange-500"
      case "blue": return "bg-blue-500"
    }
  }

  const parseTrigger = (trigger: string): { category: TriggerCategory; name: string } => {
    const [cat, ...rest] = trigger.split(":")
    return {
      category: (cat as TriggerCategory) || "red",
      name: rest.join(":") || trigger
    }
  }

  if (!mounted) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Family Profiles
          </CardTitle>
          <CardDescription>Manage profiles for yourself and family members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profiles.map((profile, idx) => (
              <button
                key={idx}
                onClick={() => handleSwitchProfile(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  activeIndex === idx
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {profile.photoUrl ? (
                  <img src={profile.photoUrl || "/placeholder.svg"} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="font-medium">{profile.name}</span>
                {idx === 0 && <Badge variant="secondary" className="text-xs">Primary</Badge>}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add child or family member..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddProfile()}
            />
            <Button onClick={handleAddProfile} disabled={!newName.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {activeIndex > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              onClick={() => handleRemoveProfile(activeIndex)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove {activeProfile?.name}
            </Button>
          )}

          {/* Photo Upload */}
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4" /> Profile Photo
            </Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {activeProfile?.photoUrl ? (
                  <img src={activeProfile.photoUrl || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
          </div>

          {/* Theme Selection */}
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4" /> Color Theme
            </Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(THEME_COLORS) as ThemeColor[]).map(theme => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedTheme === theme ? "border-gray-800 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: THEME_COLORS[theme].primary }}
                  title={theme.charAt(0).toUpperCase() + theme.slice(1)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {activeProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {activeProfile.name}&apos;s Triggers
            </CardTitle>
            <CardDescription>
              Add items to Red (anaphylaxis), Amber (sensitivity), or Blue (boundaries)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              {(["red", "amber", "blue"] as TriggerCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? `${getCategoryColor(cat)} text-white shadow-sm`
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span className="capitalize">{cat}</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search allergens, medications, excipients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredAllergens.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {filteredAllergens.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddTrigger(item, selectedCategory)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors border-b last:border-0 text-left"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <Badge className={`${getCategoryColor(selectedCategory)} text-white`}>
                      Add to {selectedCategory}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Triggers</Label>
              <div className="flex flex-wrap gap-2">
                {(activeProfile.allergies || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No triggers added yet</p>
                ) : (
                  (activeProfile.allergies || []).map((trigger, idx) => {
                    const { category, name } = parseTrigger(trigger)
                    return (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={`flex items-center gap-1 pr-1 ${
                          category === "red" ? "border-red-300 bg-red-50 text-red-700" :
                          category === "amber" ? "border-orange-300 bg-orange-50 text-orange-700" :
                          "border-blue-300 bg-blue-50 text-blue-700"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(category)}`} />
                        {name}
                        <button
                          onClick={() => handleRemoveTrigger(trigger)}
                          className="ml-1 p-0.5 rounded hover:bg-black/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    )
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            Medicinal Excipients
          </CardTitle>
          <CardDescription>Track hidden ingredients in medications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the search above to add medicinal excipients like Lactose, Gelatin, or specific dyes to your trigger list.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
