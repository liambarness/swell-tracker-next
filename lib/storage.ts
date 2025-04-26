import type { SavedSpot } from "./types"

const SPOTS_STORAGE_KEY = "swell-tracker-saved-spots"

export function getSavedSpots(): SavedSpot[] {
  if (typeof window === "undefined") return []

  try {
    const storedSpots = localStorage.getItem(SPOTS_STORAGE_KEY)
    return storedSpots ? JSON.parse(storedSpots) : []
  } catch (error) {
    console.error("Error retrieving saved spots:", error)
    return []
  }
}

export function saveSpot(spot: SavedSpot): void {
  if (typeof window === "undefined") return

  try {
    const spots = getSavedSpots()
    const updatedSpots = [...spots, spot]
    localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(updatedSpots))
  } catch (error) {
    console.error("Error saving spot:", error)
  }
}

export function deleteSpot(spotId: string): void {
  if (typeof window === "undefined") return

  try {
    const spots = getSavedSpots()
    const updatedSpots = spots.filter((spot) => spot.id !== spotId)
    localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(updatedSpots))
  } catch (error) {
    console.error("Error deleting spot:", error)
  }
}

export function updateSpot(updatedSpot: SavedSpot): void {
  if (typeof window === "undefined") return

  try {
    const spots = getSavedSpots()
    const updatedSpots = spots.map((spot) => (spot.id === updatedSpot.id ? updatedSpot : spot))
    localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(updatedSpots))
  } catch (error) {
    console.error("Error updating spot:", error)
  }
}
