import { Card, CardContent } from "@/components/ui/card";
import type { ProcessedForecastData } from "@/lib/types";
import { ArrowUp } from "lucide-react";

interface ForecastPanelProps {
  forecastData: ProcessedForecastData[];
}

export default function ForecastPanel({ forecastData }: ForecastPanelProps) {
  if (!forecastData || forecastData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No forecast data available
      </div>
    );
  }

  // Group by date for visual separation
  let currentDateDisplay = "";

  const getDayOfWeek = (date: Date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  // Create an array to hold all elements including date headers and forecast cards
  const forecastElements: any = [];

  forecastData.forEach((forecast, index) => {
    const date = new Date(forecast.timestamp);
    const dateDisplay = `${getDayOfWeek(date)}, ${date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    )}`;

    // Create date header if it's a new day
    if (dateDisplay !== currentDateDisplay) {
      currentDateDisplay = dateDisplay;
      forecastElements.push(
        <div
          key={`date-header-${dateDisplay}`}
          className="py-2 px-1 text-sm font-semibold text-gray-700 mb-2 mt-3 first:mt-0 border-b"
        >
          {dateDisplay}
        </div>
      );
    }

    const timeString = date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    // Add forecast card
    forecastElements.push(
      <Card
        key={`forecast-${index}-${forecast.timestamp}`}
        className="mb-2 overflow-hidden hover:bg-blue-50 transition-colors duration-150"
      >
        <CardContent className="p-2.5">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium text-gray-800">{timeString}</div>
            <div className="font-semibold text-blue-600 text-lg">
              {forecast.actual_wave_height_ft} ft
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Period:</span>
              <span className="font-medium text-teal-600">
                {forecast.wave_period_s} s
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Swell:</span>
              <div className="flex items-center">
                <ArrowUp
                  className="h-3.5 w-3.5 mr-1 transform text-blue-600"
                  style={{
                    transform: `rotate(${forecast.swell_direction_deg}deg)`,
                  }}
                />
                <span>{forecast.swell_direction_deg}°</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Wind:</span>
              <span>{forecast.wind_speed_mps} m/s</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Direction:</span>
              <div className="flex items-center">
                <ArrowUp
                  className="h-3.5 w-3.5 mr-1 transform text-blue-600"
                  style={{
                    transform: `rotate(${compassToDegrees(
                      forecast.wind_direction
                    )}deg)`,
                  }}
                />
                <span>{forecast.wind_direction}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-1">
            Measured: {forecast.wave_height_ft} ft
          </div>
        </CardContent>
      </Card>
    );
  });

  return <div className="space-y-1 p-2">{forecastElements}</div>;
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
  };

  // Find the closest match
  for (const [key, value] of Object.entries(compassMap)) {
    if (direction.includes(key)) {
      return value;
    }
  }

  return 0; // Default to North if no match
}
