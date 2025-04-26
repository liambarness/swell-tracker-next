"use client"
import { useRef, useEffect, useState } from "react"
import type { ProcessedForecastData } from "@/lib/types"
import type { LocationCoords } from "@/lib/types"
import { Card } from "@/components/ui/card"
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  type ChartData,
  type ChartOptions,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import WindDirectionCompass from "./wind-direction-compass"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface WindChartProps {
  forecastData: ProcessedForecastData[]
  selectedLocation?: LocationCoords | null
}

// Helper function to convert compass direction to degrees
function compassToDegrees(direction: string): number {
  const compassMap: Record<string, number> = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5,
  }

  // Find the closest match
  for (const [key, value] of Object.entries(compassMap)) {
    if (direction === key) {
      return value
    }
  }

  // If no exact match, try partial match
  for (const [key, value] of Object.entries(compassMap)) {
    if (direction.includes(key)) {
      return value
    }
  }

  return 0 // Default to North if no match
}

// Helper function to determine if wind is onshore/offshore based on location
// This is a simplified approach - a real implementation would need coastline data
function getWindRelativeToShore(direction: number, location: LocationCoords): string {
  // Corrected approach based on general continental coastlines
  // East Coast (US): Offshore is generally westerly winds (225-315 degrees)
  // West Coast (US): Offshore is generally easterly winds (45-135 degrees)

  // Determine if we're likely on east or west coast based on longitude
  // This is a very rough approximation
  const isLikelyEastCoast = location.lng > -100 && location.lng < -50
  const isLikelyWestCoast = location.lng < -100 || location.lng > 140

  if (isLikelyEastCoast) {
    // East coast: offshore is roughly 225-315 degrees (SW to NW)
    if (direction > 225 && direction < 315) return "Offshore"
    if (direction > 45 && direction < 135) return "Onshore"
  } else if (isLikelyWestCoast) {
    // West coast: offshore is roughly 45-135 degrees (NE to SE)
    if (direction > 45 && direction < 135) return "Offshore"
    if (direction > 225 && direction < 315) return "Onshore"
  }

  // For other cases, return empty string (no label)
  return ""
}

export default function WindChart({ forecastData, selectedLocation }: WindChartProps) {
  const chartRef = useRef<Chart | null>(null)
  const [currentWindData, setCurrentWindData] = useState<{
    speed: number
    direction: string
    degrees: number
    timestamp: string
    shoreRelative?: string
  } | null>(null)

  const hasData = forecastData && forecastData.length > 0

  // Set initial wind data from the first forecast item
  useEffect(() => {
    if (hasData && forecastData[0]) {
      const direction = forecastData[0].wind_direction
      const degrees = compassToDegrees(direction)

      const windData = {
        speed: forecastData[0].wind_speed_mps,
        direction: direction,
        degrees: degrees,
        timestamp: forecastData[0].timestamp,
      }

      // Add shore-relative direction if location is available
      if (selectedLocation) {
        const shoreRelative = getWindRelativeToShore(degrees, selectedLocation)
        if (shoreRelative) {
          windData.shoreRelative = shoreRelative
        }
      }

      setCurrentWindData(windData)
    }
  }, [forecastData, hasData, selectedLocation])

  useEffect(() => {
    // Wait for chart to be available and data to exist
    if (!chartRef.current || !hasData) return

    const chart = chartRef.current

    // Add hover event to update current wind data
    chart.canvas.addEventListener("mousemove", (e) => {
      const points = chart.getElementsAtEventForMode(e, "nearest", { intersect: true }, false)

      if (points.length) {
        const index = points[0].index
        if (forecastData[index]) {
          const direction = forecastData[index].wind_direction
          const degrees = compassToDegrees(direction)

          const windData = {
            speed: forecastData[index].wind_speed_mps,
            direction: direction,
            degrees: degrees,
            timestamp: forecastData[index].timestamp,
          }

          // Add shore-relative direction if location is available
          if (selectedLocation) {
            const shoreRelative = getWindRelativeToShore(degrees, selectedLocation)
            if (shoreRelative) {
              windData.shoreRelative = shoreRelative
            }
          }

          setCurrentWindData(windData)
        }
      }
    })
  }, [forecastData, chartRef.current, hasData, selectedLocation])

  if (!hasData) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </Card>
    )
  }

  // Format data for chart
  const labels = forecastData.map((item) => {
    const date = new Date(item.timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  })

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Wind Speed (m/s)",
        data: forecastData.map((item) => item.wind_speed_mps),
        backgroundColor: "rgba(59, 130, 246, 0.6)", // Light blue for all bars
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Wind Speed (m/s)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Wind Speed & Direction Forecast",
        color: "#1e293b", // slate-800
        padding: {
          top: 10,
          bottom: 10,
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: (context) => {
            const index = context.dataIndex
            return `Direction: ${forecastData[index].wind_direction}`
          },
        },
      },
    },
  }

  // Format the timestamp for display
  const formattedTime = currentWindData
    ? new Date(currentWindData.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : ""

  return (
    <div className="h-full w-full relative pb-6">
      {" "}
      {/* Added padding at bottom */}
      {/* Header with wind info and compass */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800">Wind at {formattedTime}</h3>
          <div className="text-2xl font-bold text-blue-800">
            {currentWindData?.speed.toFixed(1) || "0"} m/s {currentWindData?.direction || "N"}
          </div>
          {/* Removed wind description text */}
          {currentWindData?.shoreRelative && (
            <span className="text-sm font-medium text-blue-600">{currentWindData.shoreRelative}</span>
          )}
        </div>

        {/* Wind direction compass */}
        {currentWindData && (
          <WindDirectionCompass
            direction={currentWindData.degrees}
            speed={currentWindData.speed}
            compassDirection={currentWindData.direction}
          />
        )}
      </div>
      {/* Chart - adjusted height to ensure it fits */}
      <div className="h-[calc(100%-120px)]">
        {" "}
        {/* Reduced height to make room for labels */}
        <Bar options={options} data={data} ref={chartRef} />
      </div>
    </div>
  )
}
