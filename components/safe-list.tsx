"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle2, Leaf, Apple, ShoppingBag, ArrowRight, Info } from "lucide-react"
import allergensData from "@/allergens.json"
import { ItemDetailModal } from "./item-detail-modal"
import { ALLERGEN_DATABASE, type AllergenEntry, type ZenSpectrumColor } from "@/lib/allergen-database"
import userProfile from "@/lib/profile"

interface AllergenItem {
  name: string
  category: string
}

interface SafeAlternative {
  name: string
  image: string
  replaces: string
}

// Convert JSON item to AllergenEntry format for modal
function toAllergenEntry(item: AllergenItem): AllergenEntry {
  // Try to find in database for full details
  const dbItem = ALLERGEN_DATABASE.safe.find(
    s => s.name.toLowerCase() === item.name.toLowerCase()
  )
  if (dbItem) return dbItem
  
  // Fallback to basic entry
  return {
    id: item.name.toLowerCase().replace(/\s+/g, "-"),
    name: item.name,
    category: item.category,
    aliases: [],
    tasteProfile: "Versatile and safe for your dietary needs",
    cookingTips: "Check specific recipes for best preparation methods",
    whereToFind: "Most grocery stores and supermarkets",
    benefits: "A safe choice based on your profile"
  }
}

const SAFE_ALTERNATIVES: Record<string, SafeAlternative[]> = {
  "Dairy": [
    { name: "Oat Milk", image: "/api/placeholder/60/60", replaces: "Cow's Milk" },
    { name: "Coconut Yogurt", image: "/api/placeholder/60/60", replaces: "Greek Yogurt" },
    { name: "Cashew Cheese", image: "/api/placeholder/60/60", replaces: "Cheddar" },
  ],
  "Nuts": [
    { name: "Sunflower Butter", image: "/api/placeholder/60/60", replaces: "Peanut Butter" },
    { name: "Tahini", image: "/api/placeholder/60/60", replaces: "Almond Butter" },
    { name: "Pumpkin Seeds", image: "/api/placeholder/60/60", replaces: "Almonds" },
  ],
  "Gluten": [
    { name: "Rice Pasta", image: "/api/placeholder/60/60", replaces: "Wheat Pasta" },
    { name: "Almond Flour", image: "/api/placeholder/60/60", replaces: "All-Purpose Flour" },
    { name: "Corn Tortillas", image: "/api/placeholder/60/60", replaces: "Flour Tortillas" },
  ],
  "Eggs": [
    { name: "Flax Egg", image: "/api/placeholder/60/60", replaces: "Chicken Egg" },
    { name: "Aquafaba", image: "/api/placeholder/60/60", replaces: "Egg Whites" },
    { name: "Silken Tofu", image: "/api/placeholder/60/60", replaces: "Scrambled Eggs" },
  ],
  "Peanuts": [
    { name: "Sunflower Seed Butter", image: "/api/placeholder/60/60", replaces: "Peanut Butter" },
    { name: "Wow Butter", image: "/api/placeholder/60/60", replaces: "Crunchy PB" },
    { name: "Coconut Butter", image: "/api/placeholder/60/60", replaces: "Smooth PB" },
  ],
}

export function SafeList() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<AllergenEntry | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  const handleItemClick = (item: AllergenItem) => {
    const entry = toAllergenEntry(item)
    setSelectedItem(entry)
    setShowModal(true)
  }
  
  const handleAddToList = (item: AllergenEntry, color: ZenSpectrumColor) => {
    if (color === "brown") {
      userProfile.addDislike(item.name)
    } else if (color !== "blue") {
      userProfile.addItem(item.name, item.category, color as "red" | "amber" | "green" | "blue")
    }
    setShowModal(false)
    setSelectedItem(null)
  }

  const safeItems = useMemo(() => {
    const items = allergensData.no_reactivity || []
    return items as AllergenItem[]
  }, [])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    safeItems.forEach(item => {
      if (item.category) cats.add(item.category)
    })
    return Array.from(cats).sort()
  }, [safeItems])

  const filteredItems = useMemo(() => {
    let items = safeItems
    
    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory)
    }
    
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim()
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      )
    }
    
    return items.slice(0, 50)
  }, [safeItems, search, selectedCategory])

  return (
    <div className="space-y-4">
      <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Safe List</CardTitle>
              <CardDescription>Your approved products and alternatives</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search safe items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.slice(0, 6).map(cat => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-600" />
            Like-for-Like Safe Alternatives
          </CardTitle>
          <CardDescription>Direct swaps with product images</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(SAFE_ALTERNATIVES).slice(0, 3).map(([trigger, alts]) => (
              <div key={trigger}>
                <p className="text-xs font-medium text-gray-500 mb-2">Instead of {trigger}:</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {alts.map((alt, idx) => (
                    <div key={idx} className="flex-shrink-0 w-24 text-center">
                      <div className="w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-green-100 to-green-50 border border-green-200 flex items-center justify-center mb-1">
                        <Leaf className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-xs font-medium text-gray-800 truncate">{alt.name}</p>
                      <p className="text-[10px] text-gray-500">for {alt.replaces}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Apple className="w-4 h-4 text-green-600" />
            Safe Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No items found</p>
            ) : (
              filteredItems.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-green-600" />
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Item Detail Modal - Knowledge Hub */}
      <ItemDetailModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedItem(null)
        }}
        item={selectedItem}
        status="green"
        onAddToList={handleAddToList}
      />
    </div>
  )
}
