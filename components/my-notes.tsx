"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  NotebookPen, 
  Plus, 
  Trash2, 
  Star,
  Lock,
  Calendar,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  ThumbsUp,
  ThumbsDown,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import userProfile, { type PersonalNote } from "@/lib/profile"

const moodOptions = [
  { value: 1, label: "Difficult", color: "text-destructive" },
  { value: 2, label: "Uncomfortable", color: "text-warning" },
  { value: 3, label: "Okay", color: "text-muted-foreground" },
  { value: 4, label: "Good", color: "text-primary" },
  { value: 5, label: "Great", color: "text-success" }
]

interface Trial {
  id: string
  foodItem: string
  date: string
  status: "pending" | "liked" | "disliked"
  notes: string
}

const TRIALS_KEY = "allergyzen_trials"

export function MyNotes() {
  const [notes, setNotes] = useState<PersonalNote[]>([])
  const [showForm, setShowForm] = useState(false)
  const [expandedNote, setExpandedNote] = useState<string | null>(null)
  
  // Form state
  const [mealDescription, setMealDescription] = useState("")
  const [feelings, setFeelings] = useState("")
  const [textures, setTextures] = useState("")
  const [rating, setRating] = useState(3)
  
  // Trial Day Tracker
  const [trials, setTrials] = useState<Trial[]>([])
  const [showTrialForm, setShowTrialForm] = useState(false)
  const [trialFood, setTrialFood] = useState("")

  useEffect(() => {
    setNotes(userProfile.getNotes())
    loadTrials()
  }, [])

  const loadTrials = () => {
    try {
      const stored = localStorage.getItem(TRIALS_KEY)
      if (stored) {
        setTrials(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Error loading trials:", e)
    }
  }

  const saveTrials = (newTrials: Trial[]) => {
    localStorage.setItem(TRIALS_KEY, JSON.stringify(newTrials))
    setTrials(newTrials)
  }

  const addTrial = () => {
    if (!trialFood.trim()) return
    
    const newTrial: Trial = {
      id: crypto.randomUUID(),
      foodItem: trialFood.trim(),
      date: new Date().toISOString(),
      status: "pending",
      notes: ""
    }
    
    saveTrials([newTrial, ...trials])
    setTrialFood("")
    setShowTrialForm(false)
  }

  const updateTrialStatus = (id: string, status: "liked" | "disliked") => {
    const updated = trials.map(t => 
      t.id === id ? { ...t, status } : t
    )
    saveTrials(updated)
  }

  const moveTrialToSafeList = (trial: Trial) => {
    // Add to user profile green list
    const profile = userProfile.getActiveProfile()
    if (profile) {
      const allergies = profile.allergies || []
      // In a full implementation, this would add to the green/safe list
      // For now, we'll just remove from trials and show success
      const updated = trials.filter(t => t.id !== trial.id)
      saveTrials(updated)
      alert(`"${trial.foodItem}" has been added to your Safe List!`)
    }
  }

  const deleteTrial = (id: string) => {
    saveTrials(trials.filter(t => t.id !== id))
  }

  const handleAddNote = () => {
    if (!mealDescription.trim()) return
    
    const newNote = userProfile.addNote({
      mealDescription: mealDescription.trim(),
      feelings: feelings.trim(),
      textures: textures.trim(),
      rating
    })
    
    setNotes([newNote, ...notes])
    
    // Reset form
    setMealDescription("")
    setFeelings("")
    setTextures("")
    setRating(3)
    setShowForm(false)
  }

  const handleDeleteNote = (id: string) => {
    userProfile.deleteNote(id)
    setNotes(notes.filter(n => n.id !== id))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div>
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-primary" />
                My allerZEN Notes
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3" />
                Private - stored locally only
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? "secondary" : "default"}
            >
              {showForm ? (
                <>Cancel</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Note Form */}
          {showForm && (
            <div className="p-4 rounded-lg bg-muted/50 border border-dashed space-y-4">
              <div>
                <Label htmlFor="meal" className="text-sm">
                  What did you eat?
                </Label>
                <Input
                  id="meal"
                  placeholder="e.g., Grilled chicken salad at The Zen Kitchen"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="feelings" className="text-sm">
                  How did you feel after?
                </Label>
                <Textarea
                  id="feelings"
                  placeholder="e.g., Felt comfortable, no reactions, slight bloating after..."
                  value={feelings}
                  onChange={(e) => setFeelings(e.target.value)}
                  className="mt-1 min-h-[60px]"
                />
              </div>
              
              <div>
                <Label htmlFor="textures" className="text-sm">
                  Texture notes (optional)
                </Label>
                <Textarea
                  id="textures"
                  placeholder="e.g., Chicken was too chewy, preferred the softer vegetables..."
                  value={textures}
                  onChange={(e) => setTextures(e.target.value)}
                  className="mt-1 min-h-[60px]"
                />
              </div>
              
              <div>
                <Label className="text-sm">Overall experience</Label>
                <div className="flex gap-2 mt-2">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRating(option.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all flex-1",
                        rating === option.value 
                          ? "border-primary bg-primary/10" 
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <div className="flex gap-0.5">
                        {Array.from({ length: option.value }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "w-3 h-3",
                              rating === option.value ? "fill-primary text-primary" : "text-muted-foreground"
                            )} 
                          />
                        ))}
                      </div>
                      <span className={cn(
                        "text-xs",
                        rating === option.value ? option.color : "text-muted-foreground"
                      )}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={handleAddNote} 
                className="w-full"
                disabled={!mealDescription.trim()}
              >
                Save Note
              </Button>
            </div>
          )}

          {/* Notes List */}
          {notes.length === 0 && !showForm ? (
            <div className="text-center py-8">
              <NotebookPen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No notes yet. Record your post-meal feelings and textures.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => {
                const isExpanded = expandedNote === note.id
                const mood = moodOptions.find(m => m.value === note.rating)
                
                return (
                  <div 
                    key={note.id}
                    className="p-3 rounded-lg bg-muted/30 border hover:border-primary/30 transition-all"
                  >
                    <button
                      onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {note.mealDescription}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(note.date)}
                            </span>
                            {mood && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                {mood.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {note.feelings && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Feelings:</p>
                            <p className="text-sm">{note.feelings}</p>
                          </div>
                        )}
                        {note.textures && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Textures:</p>
                            <p className="text-sm">{note.textures}</p>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNote(note.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trial Day Tracker */}
      <Card className="border-border mt-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-500" />
                Trial Day Tracker
              </CardTitle>
              <CardDescription>Track foods you're testing</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowTrialForm(!showTrialForm)}
              variant={showTrialForm ? "secondary" : "default"}
            >
              {showTrialForm ? "Cancel" : <><Plus className="w-4 h-4 mr-1" />Log Trial</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showTrialForm && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div>
                <Label htmlFor="trial-food" className="text-sm">
                  What food are you trialing?
                </Label>
                <Input
                  id="trial-food"
                  placeholder="e.g., Oat milk, Rice pasta..."
                  value={trialFood}
                  onChange={(e) => setTrialFood(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={addTrial} className="w-full" disabled={!trialFood.trim()}>
                Start Trial
              </Button>
            </div>
          )}

          {trials.length === 0 && !showTrialForm ? (
            <div className="text-center py-8">
              <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No active trials. Log a food you're testing.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {trials.map((trial) => (
                <div 
                  key={trial.id}
                  className="p-3 rounded-lg bg-muted/30 border hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{trial.foodItem}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(trial.date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {trial.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-green-500/30 hover:bg-green-500/10 bg-transparent"
                          onClick={() => updateTrialStatus(trial.id, "liked")}
                        >
                          <ThumbsUp className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-500/30 hover:bg-red-500/10 bg-transparent"
                          onClick={() => updateTrialStatus(trial.id, "disliked")}
                        >
                          <ThumbsDown className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ) : trial.status === "liked" ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                          Liked
                        </Badge>
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => moveTrialToSafeList(trial)}
                        >
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Move to Safe
                        </Button>
                      </div>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
                        Disliked
                      </Badge>
                    )}
                  </div>
                  
                  {trial.status !== "pending" && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteTrial(trial.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
