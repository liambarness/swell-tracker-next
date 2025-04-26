"use client"
import WindDirectionCompass from "./wind-direction-compass"

interface WindInfoPanelProps {
  speed: number
  direction: string
  degrees: number
  compact?: boolean
}

export default function WindInfoPanel({ speed, direction, degrees, compact = false }: WindInfoPanelProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-white/95 rounded-lg shadow-sm border border-gray-100">
        <WindDirectionCompass direction={degrees} speed={speed} compassDirection={direction} size="sm" />
        <div className="text-sm font-semibold">{speed.toFixed(1)} m/s</div>
      </div>
    )
  }

  return (
    <div className="p-3 bg-white/95 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="flex flex-col">
        <div className="text-lg font-bold text-blue-800">
          {speed.toFixed(1)} m/s {direction}
        </div>
        <div className="text-sm text-gray-500">{getWindDescription(speed)}</div>
      </div>
      <WindDirectionCompass direction={degrees} speed={speed} compassDirection={direction} />
    </div>
  )
}

// Helper function to get wind description based on speed
function getWindDescription(speed: number): string {
  if (speed < 0.5) return "Calm"
  if (speed < 1.5) return "Light air"
  if (speed < 3.3) return "Light breeze"
  if (speed < 5.5) return "Gentle breeze"
  if (speed < 7.9) return "Moderate breeze"
  if (speed < 10.7) return "Fresh breeze"
  if (speed < 13.8) return "Strong breeze"
  if (speed < 17.1) return "Near gale"
  if (speed < 20.7) return "Gale"
  if (speed < 24.4) return "Strong gale"
  if (speed < 28.4) return "Storm"
  if (speed < 32.6) return "Violent storm"
  return "Hurricane force"
}
