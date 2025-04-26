"use client"

interface WindDirectionCompassProps {
  direction: number
  speed: number
  compassDirection: string
  size?: "sm" | "md" | "lg"
}

export default function WindDirectionCompass({
  direction,
  speed,
  compassDirection,
  size = "md",
}: WindDirectionCompassProps) {
  // Size classes
  const sizeClasses = {
    sm: {
      container: "w-16 h-16",
      innerCircle: "w-14 h-14",
      arrow: "w-1 h-5",
      text: "text-xs",
      labelDistance: 12, // Increased distance
    },
    md: {
      container: "w-24 h-24",
      innerCircle: "w-22 h-22",
      arrow: "w-1.5 h-8",
      text: "text-xs",
      labelDistance: 18, // Increased distance
    },
    lg: {
      container: "w-32 h-32",
      innerCircle: "w-30 h-30",
      arrow: "w-2 h-12",
      text: "text-sm",
      labelDistance: 24, // Increased distance
    },
  }

  const classes = sizeClasses[size]

  // Only show the main cardinal directions to avoid overlap
  const cardinalDirections = [
    { label: "N", angle: 0 },
    { label: "E", angle: 90 },
    { label: "S", angle: 180 },
    { label: "W", angle: 270 },
  ]

  return (
    <div className={`relative ${classes.container} bg-white rounded-full flex items-center justify-center`}>
      {/* Outer compass circle */}
      <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>

      {/* Direction tick marks for all 16 directions */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = i * 22.5
        const isCardinal = angle % 90 === 0
        const isIntercardinal = angle % 45 === 0 && !isCardinal
        const tickLength = isCardinal ? 6 : isIntercardinal ? 4 : 2

        return (
          <div
            key={`tick-${i}`}
            className="absolute bg-gray-400"
            style={{
              height: `${tickLength}px`,
              width: "1px",
              top: "0",
              left: "50%",
              transformOrigin: "bottom center",
              transform: `translateX(-50%) rotate(${angle}deg) translateY(${size === "sm" ? 2 : 3}px)`,
            }}
          />
        )
      })}

      {/* Cardinal direction labels - moved even further out */}
      {cardinalDirections.map((dir) => (
        <div
          key={dir.label}
          className={`absolute ${classes.text} font-semibold text-gray-600`}
          style={{
            transform: `rotate(${dir.angle}deg) translate(0, -${classes.labelDistance}px)`,
            transformOrigin: "center center",
          }}
        >
          <span style={{ transform: `rotate(-${dir.angle}deg)`, display: "inline-block" }}>{dir.label}</span>
        </div>
      ))}

      {/* Wind direction arrow */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: `rotate(${direction}deg)` }}
      >
        <div className={`${classes.arrow} bg-blue-600 rounded-full`}></div>
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2"
          style={{ marginTop: size === "sm" ? "4px" : size === "md" ? "6px" : "8px" }}
        >
          <div
            className="w-0 h-0 border-l-transparent border-r-transparent border-b-blue-600"
            style={{
              borderLeftWidth: size === "sm" ? "4px" : size === "md" ? "5px" : "6px",
              borderRightWidth: size === "sm" ? "4px" : size === "md" ? "5px" : "6px",
              borderBottomWidth: size === "sm" ? "6px" : size === "md" ? "8px" : "10px",
            }}
          ></div>
        </div>
      </div>

      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>

      {/* Current direction text */}
      <div className="absolute -bottom-6 left-0 right-0 text-center font-semibold text-gray-700 text-sm">
        {compassDirection}
      </div>
    </div>
  )
}
