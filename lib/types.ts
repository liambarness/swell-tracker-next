export interface LocationCoords {
  lat: number
  lng: number
}

export interface ForecastData {
  status: string
  data: ProcessedForecastData[]
}

export interface ProcessedForecastData {
  timestamp: string
  wave_height_ft: number
  wave_period_s: number
  swell_direction_deg: number
  wind_speed_mps: number
  wind_direction: string
  actual_wave_height_ft: number
}

export interface SavedSpot {
  id: string
  name: string
  location: LocationCoords
  createdAt: string
}
