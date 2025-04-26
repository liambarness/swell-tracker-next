"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { LocationCoords } from "@/lib/types"

// Fix Leaflet marker icon issue
const fixLeafletIcon = () => {
  // Only run on client side
  if (typeof window === "undefined") return

  // Fix the default icon paths
  delete (L.Icon.Default.prototype as any)._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

// Add custom CSS for the popup
const addCustomCSS = () => {
  if (typeof document === "undefined") return

  // Check if the style already exists
  if (!document.getElementById("map-custom-styles")) {
    const style = document.createElement("style")
    style.id = "map-custom-styles"
    style.innerHTML = `
      .custom-popup .leaflet-popup-content {
        position: relative;
        padding-right: 20px;
      }
      .deselect-location-btn {
        position: absolute;
        top: 0;
        right: 0;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 20px;
        color: #666;
        padding: 0 5px;
        line-height: 1;
        z-index: 1000;
      }
      .deselect-location-btn:hover {
        color: #000;
      }
    `
    document.head.appendChild(style)
  }
}

interface MapComponentProps {
  onLocationSelect: (coords: LocationCoords | null) => void
  selectedLocation: LocationCoords | null
}

export default function MapComponent({ onLocationSelect, selectedLocation }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [prevLocation, setPrevLocation] = useState<LocationCoords | null>(null)

  // Minimum zoom level - only zoom in if below this level
  const MIN_ZOOM_LEVEL = 7

  // Default zoom level to use when auto-zooming from a very zoomed out state
  const DEFAULT_ZOOM_LEVEL = 9

  // Fix Leaflet icon issue and add custom CSS on component mount
  useEffect(() => {
    fixLeafletIcon()
    addCustomCSS()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        worldCopyJump: true,
        minZoom: 2,
      }).setView([40.05, -74.0], 9)

      L.tileLayer("https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: '© <a href="https://maps.google.com">Google</a> Hybrid',
        noWrap: true,
      }).addTo(map)

      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        updateMarker(map, { lat, lng })
        onLocationSelect({ lat, lng })
      })

      mapRef.current = map
      setIsMapInitialized(true)
    }

    // Ensure map resizes correctly when container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    })

    resizeObserver.observe(mapContainerRef.current)

    return () => {
      if (mapContainerRef.current) {
        resizeObserver.unobserve(mapContainerRef.current)
      }
    }
  }, [onLocationSelect])

  // Update marker and center map when selectedLocation changes
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return

    // Check if location has actually changed to avoid unnecessary updates
    const locationChanged =
      !prevLocation ||
      !selectedLocation ||
      prevLocation.lat !== selectedLocation.lat ||
      prevLocation.lng !== selectedLocation.lng

    if (selectedLocation && locationChanged) {
      const map = mapRef.current
      updateMarker(map, selectedLocation)

      // Get the current zoom level
      const currentZoom = map.getZoom()

      // New approach: Only zoom in if we're very zoomed out
      // Otherwise, always maintain the current zoom level
      let targetZoom = currentZoom

      // Only apply auto-zoom if we're very zoomed out (below MIN_ZOOM_LEVEL)
      if (currentZoom < MIN_ZOOM_LEVEL) {
        targetZoom = DEFAULT_ZOOM_LEVEL
      }

      // Pan to the location, using the determined zoom level
      map.setView([selectedLocation.lat, selectedLocation.lng], targetZoom, {
        animate: true,
        duration: 0.8,
      })

      // Update previous location
      setPrevLocation(selectedLocation)
    } else if (!selectedLocation && markerRef.current && mapRef.current) {
      // Remove marker if location is unselected
      mapRef.current.removeLayer(markerRef.current)
      markerRef.current = null
      setPrevLocation(null)
    }
  }, [selectedLocation, isMapInitialized, prevLocation])

  // Function to handle deselection
  const handleDeselect = (map: L.Map) => {
    // Deselect the location
    if (markerRef.current) {
      map.removeLayer(markerRef.current)
      markerRef.current = null
    }

    // Call the onLocationSelect with null to indicate deselection
    onLocationSelect(null)

    // Close the popup
    map.closePopup()
  }

  // Helper function to update marker
  const updateMarker = (map: L.Map, location: LocationCoords) => {
    // Remove existing marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current)
    }

    // Create a custom popup content
    const popupContent = document.createElement("div")
    popupContent.innerHTML = `
      <div>
        <b>Selected Location:</b><br>
        Lat: <span style="font-family: monospace">${location.lat.toFixed(4)}</span><br>
        Lng: <span style="font-family: monospace">${location.lng.toFixed(4)}</span>
      </div>
    `

    // Create the close button separately
    const closeButton = document.createElement("button")
    closeButton.className = "deselect-location-btn"
    closeButton.title = "Deselect location"
    closeButton.innerHTML = "×"
    closeButton.onclick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleDeselect(map)
    }

    // Add the close button to the popup content
    popupContent.appendChild(closeButton)

    // Add new marker
    const marker = L.marker([location.lat, location.lng]).addTo(map)

    // Create popup with closeButton: false to remove the default close button
    const popup = L.popup({
      closeButton: false,
      className: "custom-popup",
    }).setContent(popupContent)

    marker.bindPopup(popup).openPopup()
    markerRef.current = marker
  }

  return <div ref={mapContainerRef} className="h-full w-full" />
}
