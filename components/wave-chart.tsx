"use client"
import type { ProcessedForecastData } from "@/lib/types"
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
import { Line } from "react-chartjs-2"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface WaveChartProps {
  forecastData: ProcessedForecastData[]
}

export default function WaveChart({ forecastData }: WaveChartProps) {
  if (!forecastData || forecastData.length === 0) {
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

  const data: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "Actual Wave Height (ft)",
        data: forecastData.map((item) => item.actual_wave_height_ft),
        borderColor: "rgb(59, 130, 246)", // blue-500
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
        yAxisID: "y",
      },
      {
        label: "Wave Period (s)",
        data: forecastData.map((item) => item.wave_period_s),
        borderColor: "rgb(20, 184, 166)", // teal-500
        backgroundColor: "rgba(20, 184, 166, 0.5)",
        tension: 0.3,
        yAxisID: "y1",
      },
    ],
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Wave Height (ft)",
          color: "#1e293b", // slate-800
        },
        min: 0,
        suggestedMax: Math.max(...forecastData.map((item) => item.actual_wave_height_ft)) + 1,
        ticks: {
          color: "#475569", // slate-600
        },
        grid: {
          color: "#e2e8f0", // slate-200
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Wave Period (s)",
          color: "#1e293b", // slate-800
        },
        min: 0,
        suggestedMax: Math.max(...forecastData.map((item) => item.wave_period_s)) + 2,
        grid: {
          drawOnChartArea: false,
          color: "#e2e8f0", // slate-200
        },
        ticks: {
          color: "#475569", // slate-600
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
          color: "#1e293b", // slate-800
        },
        ticks: {
          color: "#475569", // slate-600
        },
        grid: {
          color: "#e2e8f0", // slate-200
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#1e293b", // slate-800
        },
      },
      title: {
        display: true,
        text: "Wave Height & Period Forecast",
        color: "#1e293b", // slate-800
      },
    },
  }

  return (
    <div className="h-full w-full">
      <Line options={options} data={data} />
    </div>
  )
}
