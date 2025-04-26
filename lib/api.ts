import type { ProcessedForecastData } from "./types"

export async function getForecast(latitude: number, longitude: number): Promise<ProcessedForecastData[]> {
  try {
    const response = await fetch("/api/forecast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latitude, longitude }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch forecast data")
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error fetching forecast:", error)
    throw error
  }
}
