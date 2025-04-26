"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, Waves, Bookmark, Info } from "lucide-react"

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem("swell-tracker-visited")

    if (!hasVisitedBefore) {
      // Show the welcome modal
      setIsOpen(true)
      // Mark as visited
      localStorage.setItem("swell-tracker-visited", "true")
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">Welcome to Swell Tracker</DialogTitle>
          <DialogDescription className="text-base">Your personal surf forecasting tool</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Select a Location</h3>
              <p className="text-sm text-gray-500">
                Click anywhere on the map to select a surf spot or beach location.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Waves className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Run a Forecast</h3>
              <p className="text-sm text-gray-500">
                Click the "Get Forecast" button to generate a 7-day surf forecast with wave heights, wind conditions,
                and more.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Bookmark className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Save Your Spots</h3>
              <p className="text-sm text-gray-500">
                Save your favorite surf spots to quickly access them later. Your saved spots are stored locally on your
                device.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Analyze Conditions</h3>
              <p className="text-sm text-gray-500">
                View detailed charts for wave height, period, and wind conditions. Onshore/offshore wind indicators help
                you find the best surf days.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} className="w-full">
            Start Tracking Swells
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
