"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { Subsystem } from "@/data/subsystems";
import {
  calcAvgOutput,
  calcCost,
  calcEfficiency,
  calcWeight,
  generatePowerCurve,
} from "@/data/subsystems";

const FIXED_RPM = 8;
const PANEL = { background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)", backdropFilter: "blur(10px)" };
const BUTTON = { background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.35)", backdropFilter: "blur(10px)" };

export default function SubsystemOverview({ subsystem }: { subsystem: Subsystem }) {
  const [numBlades, setNumBlades] = useState(3);
  const bladeAngleRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const svgGroupRef = useRef<SVGGElement>(null);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== null) {
      const dt = (time - lastTimeRef.current) / 1000;
      const degreesPerSecond = FIXED_RPM * 6;
      bladeAngleRef.current = (bladeAngleRef.current + degreesPerSecond * dt) % 360;
      if (svgGroupRef.current) {
        svgGroupRef.current.setAttribute(
          "transform",
          `rotate(${bladeAngleRef.current} 500 200)`
        );
      }
    }
    lastTimeRef.current = time;
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [animate]);

  const bladeAngles = Array.from(
    { length: numBlades },
    (_, i) => i * (360 / numBlades)
  );

  const powerCurve = generatePowerCurve(numBlades);

  return (
    <main
      className="h-dvh w-full overflow-hidden flex flex-col select-none"
      style={{ background: "#000" }}
    >
      {/* Top nav */}
      <div className="flex items-center justify-between px-4 pt-12 pb-2 shrink-0">
        <Link
          href="/design"
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium"
          style={{ ...BUTTON, color: "#00ff41" }}
        >
          <span aria-hidden="true">‹</span>
          <span>Back to Fleet</span>
        </Link>
        <Link
          href={`/design/${subsystem.id}/detail`}
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium"
          style={{ ...BUTTON, color: "#00ff41" }}
        >
          <span>Blade Design</span>
          <span style={{ color: "rgba(0,255,65,0.5)" }} aria-hidden="true">›</span>
        </Link>
      </div>

      {/* Main grid */}
      <div className="flex-1 min-h-0 grid md:grid-cols-[1fr_2fr_1fr] gap-3 px-3 py-2">
        {/* Left: data labels */}
        <div className="flex flex-col gap-2 justify-center">
          {[
            { label: "Weight", value: calcWeight(numBlades) },
            { label: "Cost", value: calcCost(numBlades) },
            { label: "Avg Output", value: calcAvgOutput(numBlades) },
            { label: "Efficiency", value: calcEfficiency(numBlades) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl px-4 py-3 text-center" style={PANEL}>
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "rgba(0,255,65,0.55)" }}>{label}</p>
              <p className="text-lg font-bold" style={{ color: "#00ff41" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Center: turbine SVG */}
        <div className="flex items-center justify-center min-h-0">
          <svg
            viewBox="0 0 1000 700"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
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

            {/* Variable blades */}
            <g ref={svgGroupRef}>
              {bladeAngles.map((angle) => (
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
        </div>

        {/* Right: power curve chart */}
        <div className="flex flex-col min-h-0">
          <div className="rounded-xl p-3 flex flex-col flex-1 min-h-0 min-h-48" style={PANEL}>
            <p className="text-xs text-center mb-2 shrink-0" style={{ color: "rgba(0,255,65,0.55)" }}>
              Power Curve (MW)
            </p>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={powerCurve} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.12)" />
                  <XAxis
                    dataKey="wind"
                    domain={[0, 25]}
                    tick={{ fill: "rgba(0,255,65,0.5)", fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 2]}
                    tick={{ fill: "rgba(0,255,65,0.5)", fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="power"
                    stroke="#00ff41"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center mt-1 shrink-0" style={{ color: "rgba(0,255,65,0.35)" }}>
              Wind speed (m/s)
            </p>
          </div>
        </div>
      </div>

      {/* Bottom slider */}
      <div className="px-6 pb-8 pt-2 shrink-0">
        <div className="mx-auto max-w-md rounded-2xl p-5" style={PANEL}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium" style={{ color: "#00ff41" }}>
              Blades: <span className="text-lg font-bold">{numBlades}</span>
            </div>
            <div className="text-sm font-medium" style={{ color: "rgba(0,255,65,0.55)" }}>
              {numBlades === 3 ? "Optimal aerodynamic balance" : numBlades < 3 ? "Higher RPM, lower torque" : "More torque, more drag"}
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={numBlades}
            onChange={(e) => setNumBlades(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="mt-2 flex justify-between text-xs" style={{ color: "rgba(0,255,65,0.4)" }}>
            <span>1 blade</span>
            <span>3 = optimal</span>
            <span>6 blades</span>
          </div>
        </div>
      </div>
    </main>
  );
}
