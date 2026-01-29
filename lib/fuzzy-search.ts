// Handles punctuation, case-insensitivity, and word order

/**
 * Normalizes a string for fuzzy matching:
 * - Lowercase
 * - Trim whitespace
 * - Remove apostrophes and common punctuation
 * - Normalize whitespace
 */
export function normalizeForSearch(text: string): string {
  if (!text) return ""

  return (
    text
      .toLowerCase()
      .trim()
      // Remove all types of apostrophes (straight, curly, backtick)
      .replace(/[''`']/g, "")
      // Remove parentheses and their content optionally, or just the parens
      .replace(/[()]/g, " ")
      // Remove other punctuation but keep spaces and alphanumeric
      .replace(/[^\w\s]/g, " ")
      // Normalize multiple spaces to single space
      .replace(/\s+/g, " ")
      .trim()
  )
}

/**
 * Splits a search query into individual words for multi-word matching
 */
export function splitIntoWords(text: string): string[] {
  if (!text) return []
  return normalizeForSearch(text)
    .split(" ")
    .filter((word) => word.length > 0)
}

/**
 * Fuzzy match: checks if ALL words from the query appear ANYWHERE in the target
 * Example: "Cows Milk" matches "Milk (Cow)" because both "cow" and "milk" appear
 * Example: "Cow's" matches "Cows" because apostrophes are removed
 */
export function fuzzyMatch(query: string, target: string): boolean {
  if (!query || !target) return false

  const queryWords = splitIntoWords(query)
  const normalizedTarget = normalizeForSearch(target)

  // If no query words, return true (empty search matches all)
  if (queryWords.length === 0) return true

  // All query words must appear somewhere in the target
  return queryWords.every((word) => normalizedTarget.includes(word))
}

/**
 * Fuzzy match that also handles partial word matches
 * Example: "cow" matches "Cow's milk"
 * Example: "milk" matches "Almond milk"
 */
export function fuzzyMatchPartial(query: string, target: string): boolean {
  if (!query || !target) return false

  const queryWords = splitIntoWords(query)
  const targetWords = splitIntoWords(target)

  // If no query words, return true
  if (queryWords.length === 0) return true

  // All query words must match at least partially with some target word
  return queryWords.every((queryWord) =>
    targetWords.some((targetWord) => targetWord.includes(queryWord) || queryWord.includes(targetWord)),
  )
}

/**
 * Checks if an ingredient contains a trigger using fuzzy matching
 * Handles cases like "Cow's milk" being found when searching "cows milk"
 */
export function ingredientContainsTrigger(ingredient: string, trigger: string): boolean {
  if (!ingredient || !trigger) return false

  const normalizedIngredient = normalizeForSearch(ingredient)
  const normalizedTrigger = normalizeForSearch(trigger)

  // Direct include check after normalization
  if (normalizedIngredient.includes(normalizedTrigger)) {
    return true
  }

  // Word-by-word fuzzy match
  return fuzzyMatch(trigger, ingredient)
}

/**
 * Search across multiple arrays with fuzzy matching
 * Returns items that match the query from any of the provided arrays
 */
export function searchAcrossArrays<T>(query: string, arrays: T[][], getSearchableText: (item: T) => string): T[] {
  if (!query || !query.trim()) return arrays.flat()

  const normalizedQuery = normalizeForSearch(query)
  const queryWords = splitIntoWords(query)

  return arrays.flat().filter((item) => {
    const itemText = normalizeForSearch(getSearchableText(item))

    // Check direct inclusion of full normalized query
    if (itemText.includes(normalizedQuery)) {
      return true
    }

    // Check if all query words appear in the item (word-order independent)
    return queryWords.every((word) => itemText.includes(word))
  })
}
