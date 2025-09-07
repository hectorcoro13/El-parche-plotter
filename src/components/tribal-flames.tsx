"use client"

import { useEffect, useState } from "react"

export function TribalFlames() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <svg
      width="1000"
      height="800"
      viewBox="0 0 1000 800"
      className={`transition-all duration-3000 ease-out ${isVisible ? "opacity-50 scale-100" : "opacity-0 scale-75"}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Central flame burst */}
      <path
        d="M500 400 C520 350, 580 380, 600 320 C620 260, 680 290, 700 230 C720 170, 780 200, 800 140 C820 80, 880 110, 900 50"
        stroke="#FF0000"
        strokeWidth="6"
        fill="none"
        className="animate-pulse"
      />
      <path
        d="M500 400 C480 350, 420 380, 400 320 C380 260, 320 290, 300 230 C280 170, 220 200, 200 140 C180 80, 120 110, 100 50"
        stroke="#FF0000"
        strokeWidth="6"
        fill="none"
        className="animate-pulse"
        style={{ animationDelay: "0.3s" }}
      />

      {/* Diagonal flame spikes */}
      <path
        d="M300 200 C350 180, 330 120, 380 100 C430 80, 410 20, 460 0 C510 -20, 490 -80, 540 -100"
        stroke="#FF0000"
        strokeWidth="5"
        fill="none"
        className="animate-pulse"
        style={{ animationDelay: "0.6s" }}
      />
      <path
        d="M700 200 C650 180, 670 120, 620 100 C570 80, 590 20, 540 0 C490 -20, 510 -80, 460 -100"
        stroke="#FF0000"
        strokeWidth="5"
        fill="none"
        className="animate-pulse"
        style={{ animationDelay: "0.9s" }}
      />

      {/* Bottom flame extensions */}
      <path
        d="M500 600 C550 580, 530 520, 580 500 C630 480, 610 420, 660 400 C710 380, 690 320, 740 300"
        stroke="#FF0000"
        strokeWidth="4"
        fill="none"
        className="animate-pulse"
        style={{ animationDelay: "1.2s" }}
      />
      <path
        d="M500 600 C450 580, 470 520, 420 500 C370 480, 390 420, 340 400 C290 380, 310 320, 260 300"
        stroke="#FF0000"
        strokeWidth="4"
        fill="none"
        className="animate-pulse"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Circular flame patterns */}
      <circle
        cx="500"
        cy="400"
        r="150"
        stroke="#FF0000"
        strokeWidth="3"
        fill="none"
        strokeDasharray="20 10"
        className="animate-spin"
        style={{ animationDuration: "20s" }}
      />
      <circle
        cx="500"
        cy="400"
        r="200"
        stroke="#FF0000"
        strokeWidth="2"
        fill="none"
        strokeDasharray="15 15"
        className="animate-spin"
        style={{ animationDuration: "25s", animationDirection: "reverse" }}
      />

      {/* Additional flame spikes for more dramatic effect */}
      <path
        d="M200 300 C250 280, 230 220, 280 200 C330 180, 310 120, 360 100"
        stroke="#FF0000"
        strokeWidth="4"
        fill="none"
        className="animate-pulse"
        style={{ animationDelay: "1.8s" }}
      />
      <path
        d="M800 300 C750 280, 770 220, 720 200 C670 180, 690 120, 640 100"
        stroke="#FF0000"
        strokeWidth="4"
        fill="none"
        className="animate-pulse"
        style={{ animationDelay: "2.1s" }}
      />
    </svg>
  )
}
