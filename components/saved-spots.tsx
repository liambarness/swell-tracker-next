"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bookmark, MapPin, Trash2 } from "lucide-react"
import type { SavedSpot, LocationCoords } from "@/lib/types"
import { getSavedSpots, saveSpot, deleteSpot } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

interface SavedSpotsProps {
  currentLocation: LocationCoords | null
  onSpotSelect: (location: LocationCoords | null) => void
  onDropdownStateChange?: (isOpen: boolean) => void
}

export default function SavedSpots({ currentLocation, onSpotSelect, onDropdownStateChange }: SavedSpotsProps) {
  const [spots, setSpots] = useState<SavedSpot[]>(() => getSavedSpots())
  const [newSpotName, setNewSpotName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (onDropdownStateChange) {
      onDropdownStateChange(isDropdownOpen)
    }
  }, [isDropdownOpen, onDropdownStateChange])

  // Refresh spots from localStorage when component mounts
  useEffect(() => {
    setSpots(getSavedSpots())
  }, [])

  // Generate a unique ID that works in all environments
  const generateId = () => {
    // Use crypto.randomUUID if available
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    // Fallback to a simple timestamp-based ID with random suffix
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  const handleSaveSpot = () => {
    if (!currentLocation) {
      toast({
        title: "No location selected",
        description: "Please select a location on the map first.",
        variant: "destructive",
      })
      return
    }

    if (!newSpotName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this spot.",
        variant: "destructive",
      })
      return
    }

    const newSpot: SavedSpot = {
      id: generateId(),
      name: newSpotName.trim(),
      location: currentLocation,
      createdAt: new Date().toISOString(),
    }

    saveSpot(newSpot)
    setSpots([...spots, newSpot])
    setNewSpotName("")
    setIsDialogOpen(false)

    toast({
      title: "Spot saved",
      description: `"${newSpotName}" has been added to your saved spots.`,
    })
  }

  const handleDeleteSpot = (spotId: string, spotName: string) => {
    deleteSpot(spotId)
    setSpots(spots.filter((spot) => spot.id !== spotId))

    toast({
      title: "Spot deleted",
      description: `"${spotName}" has been removed from your saved spots.`,
    })
  }

  const handleSelectSpot = (spot: SavedSpot) => {
    // Force a new object to ensure React detects the change
    const locationCopy = { ...spot.location }
    onSpotSelect(locationCopy)
    setIsDropdownOpen(false)

    toast({
      title: "Spot selected",
      description: `Loaded "${spot.name}" on the map.`,
    })
  }

  const openSaveDialog = () => {
    setIsDialogOpen(true)
  }

  return (
    <div className="flex gap-2">
      {/* Save Current Spot Button */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 bg-white hover:bg-gray-100"
        title="Save Current Spot"
        onClick={openSaveDialog}
      >
        <Bookmark className="h-5 w-5 text-blue-600" />
      </Button>

      {/* Save Spot Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Spot</DialogTitle>
            <DialogDescription>Give this location a name to save it to your spots.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="spot-name" className="text-right">
                Name
              </Label>
              <Input
                id="spot-name"
                placeholder="Beach name, break, etc."
                className="col-span-3"
                value={newSpotName}
                onChange={(e) => setNewSpotName(e.target.value)}
              />
            </div>
            {currentLocation && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Location</Label>
                <div className="col-span-3 text-sm text-gray-500">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveSpot} disabled={!currentLocation || !newSpotName.trim()}>
              Save Spot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* My Saved Spots Dropdown */}
      <DropdownMenu
        open={isDropdownOpen}
        onOpenChange={(open) => {
          setIsDropdownOpen(open)
          if (onDropdownStateChange) {
            onDropdownStateChange(open)
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10 bg-white hover:bg-gray-100" title="My Saved Spots">
            <MapPin className="h-5 w-5 text-blue-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 z-[1011]" align="start" sideOffset={5} alignOffset={0} side="top">
          <DropdownMenuLabel>Saved Spots</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {spots.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-gray-500">
              No saved spots yet. Save a location to see it here.
            </div>
          ) : (
            spots.map((spot) => (
              <div key={spot.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded-sm">
                <button className="flex-1 text-left text-sm px-1 py-0.5" onClick={() => handleSelectSpot(spot)}>
                  {spot.name}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSpot(spot.id, spot.name)
                  }}
                  title={`Delete ${spot.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete {spot.name}</span>
                </Button>
              </div>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
