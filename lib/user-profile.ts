// User profile management with localStorage persistence

export interface AllergyCategory {
  id: string
  name: string
  icon: string
  description: string
  commonTriggers: string[]
}

export interface UserProfile {
  id: string
  name: string
  createdAt: string
  selectedAllergies: string[]
  customAllergies: string[]
  onboardingComplete: boolean
}

export const ALLERGY_CATEGORIES: AllergyCategory[] = [
  {
    id: "dairy",
    name: "Dairy",
    icon: "🥛",
    description: "Milk, cheese, butter, yogurt",
    commonTriggers: [
      "milk",
      "cheese",
      "butter",
      "cream",
      "yogurt",
      "whey",
      "casein",
      "lactose",
      "ghee",
      "buttermilk",
      "curds",
      "lactalbumin",
    ],
  },
  {
    id: "egg",
    name: "Egg",
    icon: "🥚",
    description: "Eggs and egg-derived products",
    commonTriggers: [
      "egg",
      "albumin",
      "globulin",
      "lysozyme",
      "mayonnaise",
      "meringue",
      "ovalbumin",
      "ovomucin",
      "ovomucoid",
      "ovovitellin",
    ],
  },
  {
    id: "wheat",
    name: "Wheat/Gluten",
    icon: "🌾",
    description: "Wheat, barley, rye, gluten",
    commonTriggers: [
      "wheat",
      "gluten",
      "flour",
      "semolina",
      "spelt",
      "kamut",
      "durum",
      "farina",
      "seitan",
      "barley",
      "rye",
      "triticale",
      "malt",
    ],
  },
  {
    id: "soy",
    name: "Soy",
    icon: "🫘",
    description: "Soybeans and soy products",
    commonTriggers: [
      "soy",
      "soya",
      "edamame",
      "tofu",
      "tempeh",
      "miso",
      "soy sauce",
      "soy lecithin",
      "soy protein",
      "textured vegetable protein",
    ],
  },
  {
    id: "peanut",
    name: "Peanut",
    icon: "🥜",
    description: "Peanuts and peanut products",
    commonTriggers: ["peanut", "groundnut", "arachis oil", "peanut butter", "peanut flour", "peanut oil"],
  },
  {
    id: "tree-nuts",
    name: "Tree Nuts",
    icon: "🌰",
    description: "Almonds, walnuts, cashews, etc.",
    commonTriggers: [
      "almond",
      "walnut",
      "cashew",
      "pistachio",
      "pecan",
      "macadamia",
      "hazelnut",
      "brazil nut",
      "chestnut",
      "pine nut",
      "marzipan",
    ],
  },
  {
    id: "fish",
    name: "Fish",
    icon: "🐟",
    description: "Fish and fish-derived products",
    commonTriggers: [
      "fish",
      "cod",
      "salmon",
      "tuna",
      "anchovy",
      "bass",
      "catfish",
      "flounder",
      "haddock",
      "halibut",
      "fish sauce",
      "fish oil",
    ],
  },
  {
    id: "shellfish",
    name: "Shellfish",
    icon: "🦐",
    description: "Shrimp, crab, lobster, etc.",
    commonTriggers: [
      "shrimp",
      "crab",
      "lobster",
      "crawfish",
      "crayfish",
      "prawn",
      "scallop",
      "clam",
      "mussel",
      "oyster",
      "squid",
      "octopus",
    ],
  },
  {
    id: "sesame",
    name: "Sesame",
    icon: "⚪",
    description: "Sesame seeds and oil",
    commonTriggers: ["sesame", "tahini", "sesame oil", "sesame seeds", "halvah", "hummus", "sesame paste", "sesamol"],
  },
  {
    id: "coconut",
    name: "Coconut",
    icon: "🥥",
    description: "Coconut and derivatives",
    commonTriggers: [
      "coconut",
      "coconut oil",
      "coconut milk",
      "coconut cream",
      "coconut flour",
      "copra",
      "mct oil",
      "coconut sugar",
      "coco",
    ],
  },
  {
    id: "rice",
    name: "Rice",
    icon: "🍚",
    description: "Rice and rice products",
    commonTriggers: [
      "rice",
      "rice flour",
      "rice starch",
      "rice syrup",
      "rice bran",
      "rice protein",
      "rice vinegar",
      "sake",
      "mirin",
      "rice milk",
    ],
  },
  {
    id: "corn",
    name: "Corn",
    icon: "🌽",
    description: "Corn and corn derivatives",
    commonTriggers: [
      "corn",
      "maize",
      "corn starch",
      "corn syrup",
      "corn flour",
      "cornmeal",
      "polenta",
      "hominy",
      "dextrose",
      "maltodextrin",
    ],
  },
  {
    id: "sunflower",
    name: "Sunflower",
    icon: "🌻",
    description: "Sunflower seeds and oil",
    commonTriggers: ["sunflower", "sunflower oil", "sunflower seeds", "sunflower lecithin", "sunflower butter"],
  },
  {
    id: "sulfites",
    name: "Sulfites",
    icon: "🧪",
    description: "Preservatives in wine, dried fruit",
    commonTriggers: [
      "sulfite",
      "sulphite",
      "sulfur dioxide",
      "sodium sulfite",
      "sodium bisulfite",
      "sodium metabisulfite",
      "e220",
      "e221",
      "e222",
    ],
  },
  {
    id: "nightshades",
    name: "Nightshades",
    icon: "🍅",
    description: "Tomatoes, peppers, potatoes, eggplant",
    commonTriggers: [
      "tomato",
      "potato",
      "eggplant",
      "bell pepper",
      "paprika",
      "cayenne",
      "chili",
      "goji berry",
      "tobacco",
    ],
  },
  {
    id: "fragrance",
    name: "Fragrance/Chemicals",
    icon: "🧴",
    description: "Synthetic fragrances and additives",
    commonTriggers: [
      "fragrance",
      "parfum",
      "perfume",
      "e1202",
      "e284",
      "e515",
      "e553b",
      "talc",
      "phthalate",
      "paraben",
      "formaldehyde",
    ],
  },
]

const STORAGE_KEY = "allergyzen_user_profile"

export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as UserProfile
  } catch {
    return null
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function createNewProfile(name: string, selectedAllergies: string[]): UserProfile {
  const profile: UserProfile = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    selectedAllergies,
    customAllergies: [],
    onboardingComplete: true,
  }
  saveUserProfile(profile)
  return profile
}

export function updateProfileAllergies(allergies: string[]): UserProfile | null {
  const profile = getUserProfile()
  if (!profile) return null

  profile.selectedAllergies = allergies
  saveUserProfile(profile)
  return profile
}

export function addCustomAllergy(allergy: string): UserProfile | null {
  const profile = getUserProfile()
  if (!profile) return null

  if (!profile.customAllergies.includes(allergy)) {
    profile.customAllergies.push(allergy)
    saveUserProfile(profile)
  }
  return profile
}

export function clearUserProfile(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function getUserTriggers(): string[] {
  const profile = getUserProfile()
  if (!profile) return []

  const triggers: string[] = [...profile.customAllergies]

  for (const allergyId of profile.selectedAllergies) {
    const category = ALLERGY_CATEGORIES.find((c) => c.id === allergyId)
    if (category) {
      triggers.push(...category.commonTriggers)
    }
  }

  return [...new Set(triggers.map((t) => t.toLowerCase()))]
}

export function getFullSensitivityCount(): number {
  const profile = getUserProfile()
  if (!profile) return 0

  // Import personal database counts
  // High Reactivity: 182 items, Moderate: 61 items = 243 base items
  // Plus any custom allergies the user has added
  const baseHighReactivity = 182
  const baseModerate = 61
  const customCount = profile.customAllergies?.length || 0

  return baseHighReactivity + baseModerate + customCount
}

export function getDetailedTriggerList(): { name: string; category: string; severity: "high" | "moderate" | "safe" }[] {
  // Import from personal database high reactivity items
  const highReactivityItems = [
    // Food & Drink (154 items from personal_database.json)
    "Ale",
    "Almond",
    "Almond flour",
    "Almond milk",
    "Almond oil",
    "Almond ricotta",
    "Baijiu",
    "Barley",
    "Barley flakes",
    "Barley tea",
    "Beef",
    "Beef brisket",
    "Beef-dried",
    "Beer",
    "Black rice",
    "Bread-brown",
    "Bread-granary",
    "Bread-white",
    "Brie",
    "Bulgar wheat",
    "Burrata",
    "Butter",
    "Butter tea",
    "Buttermilk",
    "Camembert",
    "Cashew cheese",
    "Chana dal",
    "Cheddar",
    "Chickpea",
    "Chickpea flour",
    "Clotted cream",
    "Coconut",
    "Coconut butter",
    "Coconut flour",
    "Coconut kefir",
    "Coconut milk",
    "Coconut oil",
    "Coconut sugar",
    "Coconut water",
    "Coconut yogurt",
    "Coffee-barley substitute",
    "Collagen peptides",
    "Condensed milk",
    "Corned beef",
    "Cotija",
    "Cottage cheese",
    "Couscous",
    "Cow's milk",
    "Cows milk",
    "Cream",
    "Crème fraîche",
    "Dandelion coffee",
    "Double cream",
    "Durum wheat",
    "Edam",
    "Eggnog",
    "Emmer wheat",
    "Evaporated milk",
    "Falafel",
    "Farro",
    "Fermented oat drink",
    "Feta",
    "Fontina",
    "Freekeh",
    "Frozen yogurt",
    "Garbanzo flour",
    "Germinated rice",
    "Goat's cheese",
    "Goose egg",
    "Gorgonzola",
    "Gouda",
    "Graham flour",
    "Grape juice",
    "Ground beef",
    "Ground lamb",
    "Gruyere",
    "Half-and-half",
    "Halloumi",
    "Havarti",
    "Hot chocolate",
    "Hummus",
    "Ice cream",
    "Kamut",
    "Kefir",
    "Kefir (dairy)",
    "Korean barley tea",
    "Lactose-free milk",
    "Lager",
    "Lamb",
    "Lamb kidney",
    "Lamb liver",
    "Lamb shank",
    "Lemon barley water",
    "Liver-ox",
    "Macadamia nut",
    "Malted barley flour",
    "Malted milk",
    "Manchego",
    "Mashua",
    "Matzo",
    "Meatballs (beef)",
    "Milk chocolate",
    "Milk from cows",
    "Milk from goats",
    "Milk from sheep",
    "Millet",
    "Mozzarella",
    "Mutton",
    "Noodles-wheat",
    "Ostrich egg",
    "Ovaltine",
    "Paneer",
    "Parmesan",
    "Pecorino Romano",
    "Pine nut",
    "Powdered milk",
    "Provolone",
    "Purple rice",
    "Queso fresco",
    "Red Leicester",
    "Rice milk",
    "Rice noodle (fermented)",
    "Rice noodle (fresh)",
    "Rice wine",
    "Rice-brown",
    "Rice-white",
    "Ricotta",
    "Roquefort",
    "Sake",
    "Seitan",
    "Semolina",
    "Sesame oil",
    "Sesame seed",
    "Shaoxing wine",
    "Skyr",
    "Soft cheese",
    "Sour cream",
    "Spelt",
    "Spelt flakes",
    "Sprouted brown rice",
    "Stilton",
    "Sunflower oil",
    "Sunflower seed",
    "Sweetbreads",
    "Tahini",
    "Turmeric latte",
    "UHT milk",
    "Veal",
    "Vinegar-malt",
    "Walnut",
    "Walnut oil",
    "Wheat",
    "Wheat bran",
    "Wheat germ",
    "Wheat tortillas",
    "Wheatberries",
    "Wheatgrass",
    "Whey drink",
    "Whole wheat pasta",
    "Yogurt",
    // Non-Food (2)
    "Dust",
    "Fox fur",
    // Botanicals (7)
    "Barley grass",
    "Bistort grass",
    "Clover",
    "Hop",
    "Linden grass",
    "Stachybotrys chartarum",
    "Verticillium lecanii",
    // Metals (2)
    "Fluorine (F)",
    "Silver (Ag)",
    // Additives (5)
    "E1202 Polyvinylpolypyrrolidone",
    "E284 Boric acid",
    "E515 Potassium sulphates",
    "E553b Talc",
    "Whey protein",
    // Gut Health (9)
    "Acidophilus Bifidus",
    "Bacillus Coagulans",
    "Bifidobacterium Bifidum",
    "Bifidobacterium Infantis",
    "Escherichia Coli",
    "Lactobacillus acidophilus",
    "Lactobacillus reuteri",
    "Streptococcus Faecium",
    "Streptococcus Thermophilus",
    // Stress & Inflammation (3)
    "Cortisol",
    "Joints",
    "Liver",
    // Skin Health (13)
    "Amylcinnamyl alcohol",
    "Anisyl alcohol",
    "Farnesol",
    "Fungicide (captan)",
    "Geraniol",
    "Glyceryl monothioglycolate",
    "Guaiac Wood",
    "Herbicide (glyphosate)",
    "Imidazolidinyl urea",
    "Methyl-parahydroxybenzoate",
    "Nail polish remover (Dibutyl Phthalate)",
    "Quaternium-15",
    "d-Limonene",
    // Nutrition (3)
    "Genistein",
    "Silica",
    "Vitamin C",
  ]

  const moderateItems = [
    // Food & Drink
    "Brazil nut",
    "Button mushroom",
    "Celeriac",
    "Chestnut mushroom",
    "Clams",
    "Corn grits",
    "Corn tortilla",
    "Cornflakes",
    "Feijoa",
    "Fonio",
    "Fonio flour",
    "Ginseng tea",
    "Hominy",
    "Horse",
    "Indian fig",
    "Lemon balm",
    "Maize/corn",
    "Maize/corn flour",
    "Mango juice",
    "Mushroom",
    "Oyster mushroom",
    "Persian lime",
    "Pineberry",
    "Polenta",
    "Popcorn",
    "Portobello mushroom",
    "Pâté (meat-based)",
    "Razor clams",
    "Shitake mushroom",
    "Taco shells (corn)",
    "Teff flour",
    "White teff",
    // Non-Food
    "Budgie (Parakeet) feathers",
    "Canary feathers",
    "Canvas",
    "Corduroy",
    "Denim",
    "Dove feathers",
    "Duchess satin",
    "Finch feather",
    "Hawk feather",
    "Hummingbird feathers",
    "Jersey",
    "Magpie feather",
    "Parrot feather",
    "Pigeon droppings",
    "Piqué",
    "Stork feather",
    "Suede",
    // Botanicals
    "Chrysosporium",
    "Dock",
    "Fusarium solani",
    "Penicillium aurantiogriseum",
    "Trichoderma viride",
    "Willow",
    // Additives
    "E307 Alpha-tocopherol",
    "E327 Calcium lactate",
    "E577 Potassium gluconate",
    "E622 Monopotassium glutamate",
    "E904 Shellac",
    "E959 Neohesperidine DC",
    // Skin Health
    "Benzyl benzoate",
    "Butylparaben",
    "Detergent bio (Pectatelyase)",
    "Eugenol",
    "Nail polish (Nitrocellulose)",
  ]

  const items: { name: string; category: string; severity: "high" | "moderate" | "safe" }[] = []

  // Add high reactivity items
  for (const item of highReactivityItems) {
    items.push({ name: item, category: "High Reactivity", severity: "high" })
  }

  // Add moderate items
  for (const item of moderateItems) {
    items.push({ name: item, category: "Moderate Reactivity", severity: "moderate" })
  }

  // Add custom allergies from profile if available
  const profile = getUserProfile()
  if (profile?.customAllergies) {
    for (const custom of profile.customAllergies) {
      items.push({ name: custom, category: "Custom", severity: "high" })
    }
  }

  return items
}

export function isOnboardingComplete(): boolean {
  const profile = getUserProfile()
  return profile?.onboardingComplete ?? false
}
