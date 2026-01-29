"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Heart, 
  Utensils, 
  Droplets, 
  Layers, 
  Plus, 
  X,
  FileText,
  CheckCircle2,
  Thermometer,
  Palette,
  Scale,
  Blend
} from "lucide-react"
import { cn } from "@/lib/utils"
import userProfile, { type BoundaryPreferences } from "@/lib/profile"

const deconstructionExamples = [
  { dish: "Lasagna", instruction: "Sauce only, no pasta sheets" },
  { dish: "Burger", instruction: "Components separated, no bun" },
  { dish: "Salad", instruction: "Dressing on the side, no croutons" },
  { dish: "Pasta", instruction: "Plain noodles, sauce separate" },
  { dish: "Sandwich", instruction: "Fillings only, bread separate" },
  { dish: "Pizza", instruction: "Toppings on plate, crust separate" }
]

const temperatureOptions = [
  { value: "room-temp", label: "Room Temperature Only" },
  { value: "warm-only", label: "Warm Foods Only" },
  { value: "cold-only", label: "Cold Foods Only" }
]

const colorPresets = ["White", "Beige", "Yellow", "Brown", "Green"]

export function BoundariesPanel() {
  const [boundaries, setBoundaries] = useState<BoundaryPreferences>({
    softTextures: false,
    noSaltSauce: false,
    deconstructed: false,
    deconstructedNotes: "",
    temperatureSensitive: false,
    temperaturePreference: "",
    singleColorMeals: false,
    singleColorPreference: "",
    noMixedTextures: false,
    specificPortions: false,
    portionNotes: "",
    customNotes: []
  })
  const [newNote, setNewNote] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const profile = userProfile.getActiveProfile()
    if (profile?.boundaries) {
      setBoundaries(profile.boundaries)
    }
  }, [])

  const updateBoundary = <K extends keyof BoundaryPreferences>(
    key: K, 
    value: BoundaryPreferences[K]
  ) => {
    const updated = { ...boundaries, [key]: value }
    setBoundaries(updated)
    userProfile.updateBoundaries(userProfile.session.activeProfileIndex, updated)
    showSaved()
  }

  const addCustomNote = () => {
    if (newNote.trim()) {
      const updated = {
        ...boundaries,
        customNotes: [...boundaries.customNotes, newNote.trim()]
      }
      setBoundaries(updated)
      userProfile.updateBoundaries(userProfile.session.activeProfileIndex, updated)
      setNewNote("")
      showSaved()
    }
  }

  const removeCustomNote = (index: number) => {
    const updated = {
      ...boundaries,
      customNotes: boundaries.customNotes.filter((_, i) => i !== index)
    }
    setBoundaries(updated)
    userProfile.updateBoundaries(userProfile.session.activeProfileIndex, updated)
    showSaved()
  }

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const activeCount = [
    boundaries.softTextures,
    boundaries.noSaltSauce,
    boundaries.deconstructed,
    boundaries.temperatureSensitive,
    boundaries.singleColorMeals,
    boundaries.noMixedTextures,
    boundaries.specificPortions,
    boundaries.customNotes.length > 0
  ].filter(Boolean).length

  return (
    <Card className="border-blue-600/30 bg-gradient-to-br from-blue-600/10 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-blue-500">💙</span>
            ED Boundaries
          </CardTitle>
          <div className="flex items-center gap-2">
            {saved && (
              <Badge variant="outline" className="text-success border-success/30 gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Saved
              </Badge>
            )}
            {activeCount > 0 && (
              <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                {activeCount} active
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Sensory and texture preferences for your Trusted Kitchen Ticket
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Core Boundaries */}
        <div className="space-y-3">
          {/* Soft Textures */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
            boundaries.softTextures 
              ? "border-blue-600 bg-blue-600/15 shadow-sm" 
              : "border-border bg-muted/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                boundaries.softTextures ? "bg-blue-500/20" : "bg-muted"
              )}>
                <Utensils className={cn(
                  "w-4 h-4",
                  boundaries.softTextures ? "text-blue-600" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <Label className="font-medium">Soft Textures Only</Label>
                <p className="text-xs text-muted-foreground">
                  No crunchy, hard, or chewy items
                </p>
              </div>
            </div>
            <Switch
              checked={boundaries.softTextures}
              onCheckedChange={(checked) => updateBoundary("softTextures", checked)}
            />
          </div>

          {/* No Salt/Sauce */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
            boundaries.noSaltSauce 
              ? "border-blue-600 bg-blue-600/15 shadow-sm" 
              : "border-border bg-muted/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                boundaries.noSaltSauce ? "bg-blue-500/20" : "bg-muted"
              )}>
                <Droplets className={cn(
                  "w-4 h-4",
                  boundaries.noSaltSauce ? "text-blue-600" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <Label className="font-medium">No Salt or Sauce</Label>
                <p className="text-xs text-muted-foreground">
                  Plain preparation, seasonings on side
                </p>
              </div>
            </div>
            <Switch
              checked={boundaries.noSaltSauce}
              onCheckedChange={(checked) => updateBoundary("noSaltSauce", checked)}
            />
          </div>

          {/* Deconstructed */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
            boundaries.deconstructed 
              ? "border-blue-600 bg-blue-600/15 shadow-sm" 
              : "border-border bg-muted/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                boundaries.deconstructed ? "bg-blue-500/20" : "bg-muted"
              )}>
                <Layers className={cn(
                  "w-4 h-4",
                  boundaries.deconstructed ? "text-blue-600" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <Label className="font-medium">Deconstructed Meals</Label>
                <p className="text-xs text-muted-foreground">
                  Serve components separately
                </p>
              </div>
            </div>
            <Switch
              checked={boundaries.deconstructed}
              onCheckedChange={(checked) => updateBoundary("deconstructed", checked)}
            />
          </div>
          
          {/* Temperature Sensitive - NEW */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
            boundaries.temperatureSensitive 
              ? "border-blue-600 bg-blue-600/15 shadow-sm" 
              : "border-border bg-muted/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                boundaries.temperatureSensitive ? "bg-blue-500/20" : "bg-muted"
              )}>
                <Thermometer className={cn(
                  "w-4 h-4",
                  boundaries.temperatureSensitive ? "text-blue-600" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <Label className="font-medium">Temperature Sensitive</Label>
                <p className="text-xs text-muted-foreground">
                  Specific food temperature needs
                </p>
              </div>
            </div>
            <Switch
              checked={boundaries.temperatureSensitive}
              onCheckedChange={(checked) => updateBoundary("temperatureSensitive", checked)}
            />
          </div>
          
          {/* Single-Color Meals - NEW */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
            boundaries.singleColorMeals 
              ? "border-blue-600 bg-blue-600/15 shadow-sm" 
              : "border-border bg-muted/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                boundaries.singleColorMeals ? "bg-blue-500/20" : "bg-muted"
              )}>
                <Palette className={cn(
                  "w-4 h-4",
                  boundaries.singleColorMeals ? "text-blue-600" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <Label className="font-medium">Single-Color Meals</Label>
                <p className="text-xs text-muted-foreground">
                  Prefer foods of one color group
                </p>
              </div>
            </div>
            <Switch
              checked={boundaries.singleColorMeals}
              onCheckedChange={(checked) => updateBoundary("singleColorMeals", checked)}
            />
          </div>
          
          {/* No Mixed Textures - NEW */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
            boundaries.noMixedTextures 
              ? "border-blue-600 bg-blue-600/15 shadow-sm" 
              : "border-border bg-muted/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                boundaries.noMixedTextures ? "bg-blue-500/20" : "bg-muted"
              )}>
                <Blend className={cn(
                  "w-4 h-4",
                  boundaries.noMixedTextures ? "text-blue-600" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <Label className="font-medium">No Mixed Textures</Label>
                <p className="text-xs text-muted-foreground">
                  Uniform texture throughout
                </p>
              </div>
            </div>
            <Switch
              checked={boundaries.noMixedTextures}
              onCheckedChange={(checked) => updateBoundary("noMixedTextures", checked)}
            />
          </div>
          
          {/* Specific Portions - NEW */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
            boundaries.specificPortions 
              ? "border-blue-600 bg-blue-600/15 shadow-sm" 
              : "border-border bg-muted/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                boundaries.specificPortions ? "bg-blue-500/20" : "bg-muted"
              )}>
                <Scale className={cn(
                  "w-4 h-4",
                  boundaries.specificPortions ? "text-blue-600" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <Label className="font-medium">Specific Portions</Label>
                <p className="text-xs text-muted-foreground">
                  Measured/consistent amounts
                </p>
              </div>
            </div>
            <Switch
              checked={boundaries.specificPortions}
              onCheckedChange={(checked) => updateBoundary("specificPortions", checked)}
            />
          </div>
        </div>
        
        {/* Temperature Preferences (shown when active) */}
        {boundaries.temperatureSensitive && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Temperature preference:</Label>
            <div className="flex flex-wrap gap-2">
              {temperatureOptions.map((option) => (
                <Badge 
                  key={option.value}
                  variant={boundaries.temperaturePreference === option.value ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer",
                    boundaries.temperaturePreference === option.value && "bg-blue-500"
                  )}
                  onClick={() => updateBoundary("temperaturePreference", option.value as BoundaryPreferences["temperaturePreference"])}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Color Preferences (shown when active) */}
        {boundaries.singleColorMeals && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preferred color group:</Label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((color) => (
                <Badge 
                  key={color}
                  variant={boundaries.singleColorPreference === color.toLowerCase() ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer",
                    boundaries.singleColorPreference === color.toLowerCase() && "bg-blue-500"
                  )}
                  onClick={() => updateBoundary("singleColorPreference", color.toLowerCase())}
                >
                  {color}
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Or specify custom color preference..."
              value={boundaries.singleColorPreference}
              onChange={(e) => updateBoundary("singleColorPreference", e.target.value)}
              className="text-sm mt-2"
            />
          </div>
        )}
        
        {/* Portion Notes (shown when active) */}
        {boundaries.specificPortions && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Portion requirements:</Label>
            <Textarea
              placeholder="e.g., 'Half portions only' or 'Exact 200g servings'"
              value={boundaries.portionNotes}
              onChange={(e) => updateBoundary("portionNotes", e.target.value)}
              className="text-sm min-h-[60px]"
            />
          </div>
        )}

        {/* Deconstruction Examples */}
        {boundaries.deconstructed && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Example deconstruction requests:
            </Label>
            <div className="flex flex-wrap gap-2">
              {deconstructionExamples.slice(0, 4).map((example) => (
                <Badge 
                  key={example.dish}
                  variant="outline" 
                  className="text-xs border-blue-500/30 cursor-pointer hover:bg-blue-500/10"
                  onClick={() => updateBoundary("deconstructedNotes", example.instruction)}
                >
                  {example.dish}: {example.instruction}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="Add specific deconstruction notes..."
              value={boundaries.deconstructedNotes}
              onChange={(e) => updateBoundary("deconstructedNotes", e.target.value)}
              className="text-sm min-h-[60px] mt-2"
            />
          </div>
        )}

        {/* Custom Notes */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Additional Instructions
          </Label>
          
          {boundaries.customNotes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {boundaries.customNotes.map((note, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {note}
                  <button
                    onClick={() => removeCustomNote(index)}
                    className="ml-1 p-0.5 rounded-full hover:bg-destructive/20"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <Textarea
              placeholder="e.g., 'No food touching on plate' or 'Room temperature only'"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="text-sm min-h-[40px] flex-1"
            />
            <Button 
              size="sm" 
              variant="outline"
              onClick={addCustomNote}
              disabled={!newNote.trim()}
              className="shrink-0 bg-transparent"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Ticket */}
        {activeCount > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Trusted Kitchen Ticket Preview:
            </p>
            <div className="space-y-1 text-sm">
              {boundaries.softTextures && (
                <p className="text-blue-600">- Soft textures only</p>
              )}
              {boundaries.noSaltSauce && (
                <p className="text-blue-600">- No salt or sauce</p>
              )}
              {boundaries.deconstructed && (
                <p className="text-blue-600 font-medium">
                  - DECONSTRUCTED: {boundaries.deconstructedNotes || "Serve components separately"}
                </p>
              )}
              {boundaries.customNotes.map((note, i) => (
                <p key={i} className="text-blue-600">- {note}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
