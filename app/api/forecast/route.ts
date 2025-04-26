import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

const M_TO_FT = 3.28084 // Conversion factor from meters to feet

function calculateActualWaveHeight(H_measured_ft: number, T: number, theta: number): number {
  // Use Math.abs() on the cosine term to prevent negative heights from valid directions
  const directional_factor = Math.abs(Math.cos(((theta - 90) * 0.8 * Math.PI) / 180))
  const period_factor = 1 + 0.6 * (T / 10)

  let H_actual = H_measured_ft * period_factor * directional_factor

  // Apply penalty for very short period waves
  if (T < 5) {
    H_actual -= 2
  }

  // Ensure wave height is not negative and round to 1 decimal place
  return Math.max(Math.round(H_actual * 10) / 10, 0)
}

// Function to convert degrees to compass directions
function degreesToCompass(degrees: number): string {
  const compassSectors = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ]
  // Ensure degrees are within 0-359 range for calculation
  const normalizedDegrees = ((degrees % 360) + 360) % 360
  const index = Math.round(normalizedDegrees / 22.5) % 16 // Simpler index calculation
  return compassSectors[index]
}

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json()

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ status: "error", message: "Missing latitude or longitude" }, { status: 400 })
    }

    // Ensure they are numbers
    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ status: "error", message: "Invalid latitude or longitude format" }, { status: 400 })
    }

    // Construct API URLs
    const marine_url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,wave_period,swell_wave_direction&timezone=UTC`
    const weather_url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m,wind_direction_10m&timezone=UTC`

    // Fetch data concurrently
    const [marine_response, weather_response] = await Promise.all([axios.get(marine_url), axios.get(weather_url)])

    // Basic check if data exists
    if (
      !marine_response.data ||
      !weather_response.data ||
      !marine_response.data.hourly ||
      !weather_response.data.hourly
    ) {
      throw new Error("API response missing expected 'hourly' data.")
    }

    const marine_data = marine_response.data.hourly
    const weather_data = weather_response.data.hourly

    // --- Process Data ---
    const timestamps = marine_data.time || []
    const wave_heights_m = marine_data.wave_height || []
    const wave_periods = marine_data.wave_period || []
    const swell_directions = marine_data.swell_wave_direction || []
    const wind_speeds = weather_data.wind_speed_10m || []
    const wind_directions = weather_data.wind_direction_10m || []

    const processedData = []
    const numPoints = Math.min(timestamps.length, 168) // Limit to 168 hours (7 days) or available data

    for (let i = 0; i < numPoints; i++) {
      const wave_height_ft_raw = (wave_heights_m[i] ?? 0) * M_TO_FT
      const wave_height_ft_rounded = Math.round(wave_height_ft_raw * 10) / 10
      const wave_period_s = wave_periods[i] ?? 0
      const swell_direction_deg = swell_directions[i] ?? 0
      const wind_speed_mps = wind_speeds[i] ?? 0
      const wind_direction_deg = wind_directions[i] ?? 0

      const actual_wave_height_ft = calculateActualWaveHeight(
        wave_height_ft_rounded, // Use the rounded measured height as input
        wave_period_s,
        swell_direction_deg,
      )

      const wind_direction_compass = degreesToCompass(wind_direction_deg)

      processedData.push({
        timestamp: timestamps[i],
        wave_height_ft: wave_height_ft_rounded, // Measured height in ft
        wave_period_s: wave_period_s,
        swell_direction_deg: swell_direction_deg,
        wind_speed_mps: wind_speed_mps,
        wind_direction: wind_direction_compass,
        actual_wave_height_ft: actual_wave_height_ft, // Calculated actual height in ft
      })
    }

    return NextResponse.json({ status: "success", data: processedData })
  } catch (error) {
    console.error("Error fetching or processing data:", error)

    let errorMsg = "Failed to fetch or process forecast data."
    if (error instanceof Error) {
      errorMsg = error.message
    }

    return NextResponse.json({ status: "error", message: errorMsg }, { status: 500 })
  }
}
