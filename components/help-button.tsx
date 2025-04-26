"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HelpCircle, MapPin, Waves, Bookmark, Info } from "lucide-react";

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 bg-white hover:bg-gray-100 absolute top-4 left-4 z-[1000]"
        onClick={() => setIsOpen(true)}
        title="Help"
      >
        <HelpCircle className="h-5 w-5 text-blue-600" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-600">
              How to Use Swell Tracker
            </DialogTitle>
            <DialogDescription className="text-base">
              Your personal surf forecasting tool
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Select a Location</h3>
                <p className="text-sm text-gray-500">
                  Click anywhere on the map to select a surf spot or beach
                  location.
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
                  Click the "Get Forecast" button to generate a 7-day surf
                  forecast with wave heights, wind conditions, and more.
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
                  Save your favorite surf spots to quickly access them later.
                  Your saved spots are stored locally on your device.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Analyze Conditions
                </h3>
                <p className="text-sm text-gray-500">
                  View detailed charts for wave height, period, and wind
                  conditions. Onshore/offshore wind indicators help you find the
                  best surf days.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
