"use client";

import Link from "next/link";
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

const HATS = [
  { id: 0, top: "15%", size: 22, delay: 1.2, emoji: "\u{1F3A9}" },
  { id: 1, top: "40%", size: 18, delay: 3.5, emoji: "\u{1F452}" },
  { id: 2, top: "60%", size: 26, delay: 6.0, emoji: "\u{1F9E2}" },
];

const BUTTON = { background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.35)", backdropFilter: "blur(10px)" };

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
        const degreesPerSecond = rpm * 6;
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
    <main className="relative h-dvh w-full overflow-hidden select-none" style={{ background: "#000" }}>

      {/* Navigation buttons */}
      <div className="absolute top-0 left-0 z-20 flex flex-col gap-2 p-4 pt-12">
        <Link
          href="/design"
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium"
          style={{ ...BUTTON, color: "#00ff41" }}
        >
          <span>Design</span>
          <span style={{ color: "rgba(0,255,65,0.5)" }} aria-hidden="true">›</span>
        </Link>
        <Link
          href="/stories"
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium"
          style={{ ...BUTTON, color: "#00ff41" }}
        >
          <span>About</span>
          <span style={{ color: "rgba(0,255,65,0.5)" }} aria-hidden="true">›</span>
        </Link>
      </div>

      {/* Text overlay */}
      <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-12 text-center">
        <p className="text-lg font-light" style={{ color: "rgba(0,255,65,0.65)" }}>
          Your thumb is generating
        </p>
        <p className="my-2 text-6xl font-bold" style={{ color: "#00ff41", textShadow: "0 0 20px rgba(0,255,65,0.5)" }}>
          {powerMW.toFixed(2)} <span className="text-4xl font-medium">mW</span>
        </p>
        <p className="text-lg font-light" style={{ color: "rgba(0,255,65,0.65)" }}>
          power for the Buzludzha valley
        </p>
        {powerMW > 0 && (
          <p className="mt-3 text-sm italic" style={{ color: "rgba(0,255,65,0.45)" }}>
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

      {/* Flying hats */}
      {windSpeed > 0 &&
        HATS.map((h) => (
          <div
            key={`hat-${h.id}`}
            className="flying-hat"
            style={
              {
                top: h.top,
                "--hat-size": `${h.size}px`,
                "--hat-duration": `${particleDuration * 3}s`,
                "--hat-delay": `${h.delay * (particleDuration / 4)}s`,
                "--hat-opacity": particleOpacity + 0.3,
              } as React.CSSProperties
            }
          >
            {h.emoji}
          </div>
        ))}

      {/* Turbine SVG */}
      <svg
        viewBox="0 0 1000 700"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Mountains */}
        <polygon points="200,700 500,350 800,700" fill="#001a00" />
        <polygon points="50,700 350,420 650,700" fill="#001000" />

        {/* Tower */}
        <polygon
          points="488,380 512,380 508,620 492,620"
          fill="#001500"
          stroke="rgba(0,255,65,0.4)"
          strokeWidth="1"
        />

        {/* Main shaft */}
        <rect x="496" y="204" width="8" height="176" rx="2" fill="#001500" stroke="rgba(0,255,65,0.3)" strokeWidth="0.5" />

        {/* Nacelle */}
        <rect x="482" y="188" width="36" height="18" rx="4" fill="#001a00" stroke="rgba(0,255,65,0.5)" strokeWidth="1" />

        {/* Drive shaft stub */}
        <rect x="497" y="193" width="6" height="12" rx="2" fill="#001000" />

        {/* Rotor hub */}
        <circle cx="500" cy="200" r="9" fill="#001800" stroke="#00ff41" strokeWidth="1" />
        <circle cx="500" cy="200" r="6" fill="#002500" />

        {/* Blades */}
        <g ref={svgGroupRef}>
          {[0, 120, 240].map((angle) => (
            <g key={angle} transform={`rotate(${angle} 500 200)`}>
              <path
                d="M500,200 L497,80 Q500,40 503,80 Z"
                fill="rgba(0,255,65,0.07)"
                stroke="#00ff41"
                strokeWidth="1"
              />
            </g>
          ))}
        </g>

        {/* Hub cap */}
        <circle cx="500" cy="200" r="5" fill="#001800" stroke="rgba(0,255,65,0.6)" strokeWidth="1" />

        {/* Ground */}
        <rect x="0" y="620" width="1000" height="80" fill="#001000" />
      </svg>

      {/* Slider panel */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
        <div
          className="mx-auto max-w-md rounded-2xl p-5"
          style={{ background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)", backdropFilter: "blur(10px)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium" style={{ color: "#00ff41" }}>
              Wind: <span className="text-lg font-bold">{windSpeed.toFixed(1)}</span> m/s
            </div>
            <div className="text-sm font-medium" style={{ color: "#00ff41" }}>
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
          <div className="mt-2 flex justify-between text-xs" style={{ color: "rgba(0,255,65,0.5)" }}>
            <span>0 m/s</span>
            <span>Calm → Gale</span>
            <span>25 m/s</span>
          </div>
        </div>
      </div>
    </main>
  );
}
