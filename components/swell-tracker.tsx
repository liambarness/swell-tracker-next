"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MapPin, Waves, X } from "lucide-react";
import ForecastPanel from "./forecast-panel";
import WaveChart from "./wave-chart";
import WindChart from "./wind-chart";
import SavedSpots from "./saved-spots";
import WelcomeModal from "./welcome-modal";
import HelpButton from "./help-button";
import { getForecast } from "@/lib/api";
import type { LocationCoords, ProcessedForecastData } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-gray-600">Loading map...</span>
    </div>
  ),
});

export default function SwellTracker() {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationCoords | null>(null);
  const [forecastData, setForecastData] = useState<ProcessedForecastData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [uniqueDays, setUniqueDays] = useState<
    { key: string; label: string }[]
  >([]);
  const [activeTab, setActiveTab] = useState("forecast");
  const [isSavedSpotsOpen, setIsSavedSpotsOpen] = useState(false);

  // Helper functions
  const getDayOfWeek = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  // Process forecast data to group by days
  useEffect(() => {
    if (forecastData.length > 0) {
      const days = new Map<string, string>();

      forecastData.forEach((item) => {
        const date = new Date(item.timestamp);
        const dayKey = getDateKey(date);
        const dayLabel = `${getDayOfWeek(date)} ${
          date.getMonth() + 1
        }/${date.getDate()}`;

        if (!days.has(dayKey)) {
          days.set(dayKey, dayLabel);
        }
      });

      const uniqueDaysArray = Array.from(days.entries()).map(
        ([key, label]) => ({ key, label })
      );
      setUniqueDays(uniqueDaysArray);

      // Set first day as selected if none is selected
      if (!selectedDay && uniqueDaysArray.length > 0) {
        setSelectedDay(uniqueDaysArray[0].key);
      }
    }
  }, [forecastData, selectedDay]);

  // Filter data based on selected day
  const filteredData = selectedDay
    ? forecastData.filter((item) => {
        const date = new Date(item.timestamp);
        return getDateKey(date) === selectedDay;
      })
    : forecastData;

  const handleLocationSelect = (coords: LocationCoords | null) => {
    setSelectedLocation(coords);
    if (!coords) {
      // If location is deselected, also clear any forecast data
      setForecastData([]);
    }
    setError(null);
  };

  const handleFetchForecast = async () => {
    if (!selectedLocation) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getForecast(
        selectedLocation.lat,
        selectedLocation.lng
      );
      setForecastData(data);
      setActiveTab("forecast");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch forecast data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePanel = () => {
    setForecastData([]);
    // Note: We don't clear selectedLocation here anymore
    // This allows the location to remain selected on the map
  };

  // Split days into two rows
  const renderDateButtons = () => {
    if (uniqueDays.length === 0) return null;

    // Calculate how many days to show in each row
    const firstRowCount = Math.min(3, uniqueDays.length);
    const secondRowCount = Math.min(4, uniqueDays.length - firstRowCount);

    const firstRow = uniqueDays.slice(0, firstRowCount);
    const secondRow = uniqueDays.slice(
      firstRowCount,
      firstRowCount + secondRowCount
    );

    return (
      <div className="flex flex-col gap-1.5 mt-3">
        {/* First row */}
        <div className="flex justify-between gap-1">
          {firstRow.map((day) => (
            <Button
              key={day.key}
              variant={selectedDay === day.key ? "default" : "outline"}
              size="sm"
              className={`rounded-md px-2 py-1 h-auto text-sm flex-1 ${
                selectedDay === day.key
                  ? "bg-blue-600"
                  : "bg-white hover:bg-gray-100"
              }`}
              onClick={() => setSelectedDay(day.key)}
            >
              {day.label}
            </Button>
          ))}
        </div>

        {/* Second row - only render if there are days for it */}
        {secondRow.length > 0 && (
          <div className="flex justify-between gap-1">
            {secondRow.map((day) => (
              <Button
                key={day.key}
                variant={selectedDay === day.key ? "default" : "outline"}
                size="sm"
                className={`rounded-md px-2 py-1 h-auto text-sm flex-1 ${
                  selectedDay === day.key
                    ? "bg-blue-600"
                    : "bg-white hover:bg-gray-100"
                }`}
                onClick={() => setSelectedDay(day.key)}
              >
                {day.label}
              </Button>
            ))}
            {/* Add empty spacers if second row has fewer than 4 buttons to maintain alignment */}
            {Array.from({ length: 4 - secondRow.length }).map((_, i) => (
              <div key={`spacer-${i}`} className="flex-1" />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-full relative">
      {/* Welcome Modal - Shows on first visit */}
      <div className="z-[1005]">
        <WelcomeModal />
      </div>

      {/* Help Button */}
      <HelpButton />

      {/* Map Container */}
      <div className="h-full w-full">
        <MapComponent
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
        />
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2 pb-[env(safe-area-inset-bottom)] ios:mb-[70px]">
        {/* Location Info Card */}
        <Card
          className={`bg-white/90 backdrop-blur-sm shadow-md w-auto transition-opacity duration-200 ${
            isSavedSpotsOpen ? "opacity-0" : "opacity-100"
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                {selectedLocation ? (
                  <span className="font-mono">
                    {selectedLocation.lat.toFixed(4)},{" "}
                    {selectedLocation.lng.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-gray-500 italic">
                    Click map to select location
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Saved Spots - Now in its own stacking context with higher z-index */}
          <div className="relative z-[1010]">
            <SavedSpots
              currentLocation={selectedLocation}
              onSpotSelect={handleLocationSelect}
              onDropdownStateChange={setIsSavedSpotsOpen}
            />
          </div>

          {/* Run Forecast Button - Now more descriptive */}
          <Button
            onClick={handleFetchForecast}
            disabled={!selectedLocation || isLoading}
            className="h-10 bg-blue-600 hover:bg-blue-700 flex items-center gap-2 px-4"
            title="Get wave forecast for this location"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Waves className="h-5 w-5" />
                <span>Get Forecast</span>
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200 shadow-sm">
            <CardContent className="p-3">
              <p className="text-xs text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Forecast Panel */}
      {forecastData.length > 0 && (
        <Card className="absolute top-4 w-full sm:right-0 md:right-4 max-w-md max-h-[85vh] overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg z-[1000]">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Wave Forecast</CardTitle>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">
                  {selectedLocation && (
                    <Badge variant="outline" className="ml-2">
                      {selectedLocation.lat.toFixed(2)},{" "}
                      {selectedLocation.lng.toFixed(2)}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleClosePanel}
                  title="Close forecast"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Two-row date selector */}
            {renderDateButtons()}
          </CardHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-4">
              <TabsList className="w-full">
                <TabsTrigger value="forecast" className="flex-1">
                  Forecast
                </TabsTrigger>
                <TabsTrigger value="wave-chart" className="flex-1">
                  Wave Chart
                </TabsTrigger>
                <TabsTrigger value="wind-chart" className="flex-1">
                  Wind
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="forecast" className="m-0">
              <div className="max-h-[70vh] overflow-y-auto p-1">
                <ForecastPanel forecastData={filteredData} />
              </div>
            </TabsContent>

            <TabsContent value="wave-chart" className="m-0">
              <div className="p-4 h-[400px]">
                <WaveChart forecastData={filteredData} />
              </div>
            </TabsContent>

            <TabsContent value="wind-chart" className="m-0">
              <div className="p-4 h-[420px]">
                <WindChart
                  forecastData={filteredData}
                  selectedLocation={selectedLocation}
                />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <Toaster />
    </div>
  );
}
