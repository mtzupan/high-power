"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_WIND = 25;
const RATED_WIND = 13;
const MAX_RPM = 14.9;
const CUT_IN_WIND = 4;
const RATED_POWER_MW = 2.0;

function windToRpm(wind: number): number {
  if (wind <= 0) return 0;
  if (wind >= RATED_WIND) return MAX_RPM;
  return (wind / RATED_WIND) * MAX_RPM;
}

function windToPowerMW(wind: number): number {
  if (wind < CUT_IN_WIND) return 0;
  if (wind >= RATED_WIND) return RATED_POWER_MW;
  const fraction = (wind - CUT_IN_WIND) / (RATED_WIND - CUT_IN_WIND);
  return RATED_POWER_MW * fraction * fraction * fraction;
}

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  top: `${5 + Math.random() * 70}%`,
  width: 20 + Math.random() * 40,
  delay: Math.random() * 4,
}));

export default function Home() {
  const [windSpeed, setWindSpeed] = useState(0);
  const bladeAngleRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const svgGroupRef = useRef<SVGGElement>(null);

  const rpm = windToRpm(windSpeed);
  const powerMW = windToPowerMW(windSpeed);

  const animate = useCallback(
    (time: number) => {
      if (lastTimeRef.current !== null) {
        const dt = (time - lastTimeRef.current) / 1000;
        const degreesPerSecond = rpm * 6; // rpm * 360 / 60
        bladeAngleRef.current =
          (bladeAngleRef.current + degreesPerSecond * dt) % 360;
        if (svgGroupRef.current) {
          svgGroupRef.current.setAttribute(
            "transform",
            `rotate(${bladeAngleRef.current} 500 200)`
          );
        }
      }
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(animate);
    },
    [rpm]
  );

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [animate]);

  // Save powerMW to backend (debounced 1s)
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch("/api/turbines/1/output", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_output_mw: powerMW }),
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(timeout);
  }, [powerMW]);

  const particleDuration = windSpeed > 0 ? Math.max(0.8, 5 - windSpeed * 0.16) : 0;
  const particleOpacity = Math.min(0.7, windSpeed * 0.04);

  return (
    <main className="relative h-dvh w-full overflow-hidden select-none">
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #87CEEB 0%, #d4eef7 60%, #f0f8ff 100%)",
        }}
      />

      {/* Text overlay */}
      <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-12 text-center">
        <p className="text-lg font-light text-gray-700">Your thumb is generating</p>
        <p className="my-2 text-6xl font-bold text-gray-900">
          {powerMW.toFixed(2)} <span className="text-4xl font-medium">mW</span>
        </p>
        <p className="text-lg font-light text-gray-700">power for the Buzludzha valley</p>
        {powerMW > 0 && (
          <p className="mt-3 text-sm italic text-gray-500">
            The nation of Bulgaria thanks you, comrade.
          </p>
        )}
      </div>

      {/* Wind particles */}
      {windSpeed > 0 &&
        PARTICLES.map((p) => (
          <div
            key={p.id}
            className="wind-particle"
            style={
              {
                top: p.top,
                width: p.width,
                "--particle-duration": `${particleDuration}s`,
                "--particle-delay": `${p.delay * (particleDuration / 4)}s`,
                "--particle-opacity": particleOpacity,
              } as React.CSSProperties
            }
          />
        ))}

      {/* Turbine SVG scene */}
      <svg
        viewBox="0 0 1000 700"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Mountain */}
        <polygon
          points="200,700 500,350 800,700"
          fill="#4a7c59"
        />
        <polygon
          points="50,700 350,420 650,700"
          fill="#3d6b4e"
        />

        {/* Tower */}
        <polygon
          points="488,380 512,380 508,620 492,620"
          fill="#b0b8c0"
        />
        <polygon
          points="488,380 512,380 508,620 492,620"
          fill="url(#towerShade)"
        />
        <defs>
          <linearGradient id="towerShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0.05)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
          </linearGradient>
        </defs>

        {/* Main shaft — tower top to nacelle */}
        <rect x="496" y="204" width="8" height="176" rx="2" fill="#7a838c" />
        <rect x="496" y="204" width="8" height="176" rx="2" fill="url(#towerShade)" />

        {/* Nacelle */}
        <rect
          x="482"
          y="188"
          width="36"
          height="18"
          rx="4"
          fill="#8a9199"
        />
        {/* Nacelle highlight */}
        <rect
          x="482"
          y="188"
          width="36"
          height="9"
          rx="4"
          fill="rgba(255,255,255,0.08)"
        />

        {/* Drive shaft stub — nacelle to hub */}
        <rect x="497" y="193" width="6" height="12" rx="2" fill="#6b7280" />

        {/* Rotor hub */}
        <circle cx="500" cy="200" r="9" fill="#6b7280" />
        <circle cx="500" cy="200" r="6" fill="#7a838c" />

        {/* Blades — rotated as a group */}
        <g ref={svgGroupRef}>
          {[0, 120, 240].map((angle) => (
            <g key={angle} transform={`rotate(${angle} 500 200)`}>
              <path
                d="M500,200 L497,80 Q500,40 503,80 Z"
                fill="#e5e7eb"
                stroke="#d1d5db"
                strokeWidth="0.5"
              />
            </g>
          ))}
        </g>

        {/* Hub cap */}
        <circle cx="500" cy="200" r="5" fill="#9ca3af" />

        {/* Ground line */}
        <rect x="0" y="620" width="1000" height="80" fill="#3d6b4e" />
      </svg>

      {/* UI overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
        <div
          className="mx-auto max-w-md rounded-2xl p-5"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)" }}
        >
          <div className="mb-3 flex items-center justify-between text-white">
            <div className="text-sm font-medium">
              Wind: <span className="text-lg font-bold">{windSpeed.toFixed(1)}</span> m/s
            </div>
            <div className="text-sm font-medium">
              Rotor: <span className="text-lg font-bold">{rpm.toFixed(1)}</span> RPM
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={MAX_WIND}
            step="0.1"
            value={windSpeed}
            onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="mt-2 flex justify-between text-xs text-white/60">
            <span>0 m/s</span>
            <span>Calm → Gale</span>
            <span>25 m/s</span>
          </div>
        </div>
      </div>
    </main>
  );
}
