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

// T-01 (index 0) = closest/largest; T-05 (index 4) = furthest/smallest
const TURBINES = [
  { hubX: 388, hubY: 198, scale: 1.00 },
  { hubX: 295, hubY: 172, scale: 0.72 },
  { hubX: 220, hubY: 154, scale: 0.53 },
  { hubX: 162, hubY: 142, scale: 0.39 },
  { hubX: 116, hubY: 134, scale: 0.29 },
] as const;

// T-01 fastest (closest), T-05 slowest (furthest)
const RPM_MULTIPLIERS = [1.20, 1.08, 1.00, 0.90, 0.80] as const;

// Foreground mountain path — peaks land exactly on each turbine hub
const FORE_MTN = [
  "M0,230",
  "L 40,215 L 80,225",
  `L ${TURBINES[4].hubX},${TURBINES[4].hubY}`,
  "L 138,175",
  `L ${TURBINES[3].hubX},${TURBINES[3].hubY}`,
  "L 190,185",
  `L ${TURBINES[2].hubX},${TURBINES[2].hubY}`,
  "L 254,195",
  `L ${TURBINES[1].hubX},${TURBINES[1].hubY}`,
  "L 338,218",
  `L ${TURBINES[0].hubX},${TURBINES[0].hubY}`,
  "L 430,235",
  "L430,320 L0,320 Z",
].join(" ");

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

function TurbineCard({ index, powerMW }: { index: number; powerMW: number }) {
  const pct = (powerMW / RATED_POWER_MW) * 100;
  return (
    <div
      className="flex-1 rounded-xl px-1 py-2 text-center"
      style={{ background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)" }}
    >
      <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: "rgba(0,255,65,0.4)" }}>
        T-{String(index + 1).padStart(2, "0")}
      </p>
      <div
        className="mx-auto mb-1 flex items-end overflow-hidden rounded"
        style={{ height: "32px", width: "55%", background: "rgba(0,255,65,0.05)" }}
      >
        <div
          className="w-full transition-all duration-500"
          style={{
            height: `${Math.max(4, pct)}%`,
            background: powerMW > 0 ? "#00ff41" : "rgba(0,255,65,0.1)",
          }}
        />
      </div>
      <p className="text-[9px]" style={{ color: "#00ff41" }}>
        {powerMW.toFixed(1)}<span style={{ color: "rgba(0,255,65,0.35)" }}> MW</span>
      </p>
    </div>
  );
}

export default function Home() {
  const [windSpeed, setWindSpeed] = useState(0);
  const bladeAnglesRef = useRef([0, 24, 48, 72, 96]);
  const bladeGroupRefs = useRef<Array<SVGGElement | null>>(Array(5).fill(null));
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  const rpm = windToRpm(windSpeed);
  const powerMW = windToPowerMW(windSpeed);
  const fleetPowerMW = RPM_MULTIPLIERS.reduce((sum, m) => sum + powerMW * m, 0);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== null) {
      const dt = (time - lastTimeRef.current) / 1000;
      const dps = rpm * 6;
      bladeAnglesRef.current = bladeAnglesRef.current.map(
        (a, i) => (a + dps * dt * RPM_MULTIPLIERS[i]) % 360
      );
      bladeAnglesRef.current.forEach((angle, i) => {
        bladeGroupRefs.current[i]?.setAttribute(
          "transform",
          `rotate(${angle} ${TURBINES[i].hubX} ${TURBINES[i].hubY})`
        );
      });
    }
    lastTimeRef.current = time;
    rafRef.current = requestAnimationFrame(animate);
  }, [rpm]);

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
        body: JSON.stringify({ current_output_mw: fleetPowerMW }),
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(timeout);
  }, [fleetPowerMW]);

  const particleDuration = windSpeed > 0 ? Math.max(0.8, 5 - windSpeed * 0.16) : 0;
  const particleOpacity = Math.min(0.7, windSpeed * 0.04);

  return (
    <main className="relative h-dvh flex flex-col overflow-hidden select-none" style={{ background: "#000" }}>

      {/* Wind particles */}
      {windSpeed > 0 && PARTICLES.map((p) => (
        <div
          key={p.id}
          className="wind-particle"
          style={{
            top: p.top,
            width: p.width,
            "--particle-duration": `${particleDuration}s`,
            "--particle-delay": `${p.delay * (particleDuration / 4)}s`,
            "--particle-opacity": particleOpacity,
          } as React.CSSProperties}
        />
      ))}

      {/* Flying hats */}
      {windSpeed > 0 && HATS.map((h) => (
        <div
          key={`hat-${h.id}`}
          className="flying-hat"
          style={{
            top: h.top,
            "--hat-size": `${h.size}px`,
            "--hat-duration": `${particleDuration * 3}s`,
            "--hat-delay": `${h.delay * (particleDuration / 4)}s`,
            "--hat-opacity": particleOpacity + 0.3,
          } as React.CSSProperties}
        >
          {h.emoji}
        </div>
      ))}

      {/* Header: hint text left, nav buttons right */}
      <div className="relative z-20 flex items-start justify-between px-4 pt-10 pb-1 shrink-0">
        <p className="text-xs font-light max-w-[88px] leading-snug mt-1" style={{ color: "rgba(0,255,65,0.5)" }}>
          Use your thumb to change the wind speed
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/design/blades"
            className="flex flex-col rounded-2xl px-4 py-2 text-left"
            style={{ ...BUTTON, color: "#00ff41", minWidth: "148px" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Blades</span>
              <span style={{ color: "rgba(0,255,65,0.5)" }} aria-hidden="true">›</span>
            </div>
            <span className="text-xs font-light" style={{ color: "rgba(0,255,65,0.5)" }}>number, shape</span>
          </Link>
          <Link
            href="/design/drivetrain"
            className="flex flex-col rounded-2xl px-4 py-2 text-left"
            style={{ ...BUTTON, color: "#00ff41", minWidth: "148px" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Drivetrain</span>
              <span style={{ color: "rgba(0,255,65,0.5)" }} aria-hidden="true">›</span>
            </div>
            <span className="text-xs font-light" style={{ color: "rgba(0,255,65,0.5)" }}>gears, generator</span>
          </Link>
          <Link
            href="/stories"
            className="flex flex-col rounded-2xl px-4 py-2 text-left"
            style={{ ...BUTTON, color: "#00ff41", minWidth: "148px" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">About</span>
              <span style={{ color: "rgba(0,255,65,0.5)" }} aria-hidden="true">›</span>
            </div>
            <span className="text-xs font-light" style={{ color: "rgba(0,255,65,0.5)" }}>this tool&apos;s purpose</span>
          </Link>
        </div>
      </div>

      {/* Fleet SVG scene */}
      <div className="relative z-10 flex-1 min-h-0">
        <svg
          viewBox="0 0 430 320"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Far mountain silhouette */}
          <path
            d="M0,185 L50,170 L80,180 L110,158 L140,172 L170,150 L200,163 L230,140 L260,155 L290,130 L320,148 L350,122 L380,140 L410,115 L430,130 L430,215 L0,215 Z"
            fill="#000a00"
          />
          {/* Mid mountain range */}
          <path
            d="M0,200 L40,186 L75,194 L108,176 L140,188 L172,169 L204,182 L236,162 L268,175 L300,156 L332,169 L364,149 L396,162 L430,144 L430,238 L0,238 Z"
            fill="#001000"
          />
          {/* Foreground mountains — peaks at each turbine hub */}
          <path d={FORE_MTN} fill="#001500" stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          {/* Ground */}
          <rect x="0" y="300" width="430" height="20" fill="#001000" />

          {/* Turbines — rendered far→near so T-01 is on top */}
          {[...TURBINES].reverse().map((cfg, revIdx) => {
            const i = TURBINES.length - 1 - revIdx;
            const { hubX, hubY, scale } = cfg;
            const towerH = 120 * scale;
            const nacelleW = 30 * scale;
            const nacelleH = 12 * scale;
            const hubR = 6.5 * scale;
            const bladeLen = 92 * scale;
            const tTW = 4.5 * scale;
            const tBW = 7 * scale;
            const baseY = hubY + towerH;
            const sw = Math.max(0.4, scale * 0.9);
            return (
              <g key={i}>
                {/* Tower */}
                <polygon
                  points={`${hubX - tTW},${hubY} ${hubX + tTW},${hubY} ${hubX + tBW},${baseY} ${hubX - tBW},${baseY}`}
                  fill="#001500"
                  stroke="rgba(0,255,65,0.4)"
                  strokeWidth={sw}
                />
                {/* Nacelle */}
                <rect
                  x={hubX - nacelleW / 2} y={hubY - nacelleH}
                  width={nacelleW} height={nacelleH}
                  rx={3 * scale}
                  fill="#001a00"
                  stroke="rgba(0,255,65,0.5)"
                  strokeWidth={sw}
                />
                {/* Hub ring */}
                <circle cx={hubX} cy={hubY} r={hubR} fill="#001800" stroke="#00ff41" strokeWidth={sw} />
                <circle cx={hubX} cy={hubY} r={hubR * 0.6} fill="#002500" />
                {/* Blade group — animated via ref */}
                <g ref={(el: SVGGElement | null) => { bladeGroupRefs.current[i] = el; }}>
                  {[0, 120, 240].map((a) => {
                    const rad = (a * Math.PI) / 180;
                    const tipX = hubX + Math.cos(rad) * bladeLen;
                    const tipY = hubY + Math.sin(rad) * bladeLen;
                    const perpRad = rad + Math.PI / 2;
                    const w = 2.8 * scale;
                    return (
                      <path
                        key={a}
                        d={[
                          `M ${hubX + Math.cos(perpRad) * w * 0.6},${hubY + Math.sin(perpRad) * w * 0.6}`,
                          `Q ${tipX + Math.cos(perpRad) * w * 0.3},${tipY + Math.sin(perpRad) * w * 0.3}`,
                          `  ${tipX},${tipY}`,
                          `Q ${tipX - Math.cos(perpRad) * w * 0.3},${tipY - Math.sin(perpRad) * w * 0.3}`,
                          `  ${hubX - Math.cos(perpRad) * w * 0.6},${hubY - Math.sin(perpRad) * w * 0.6}`,
                          "Z",
                        ].join(" ")}
                        fill="rgba(0,255,65,0.07)"
                        stroke="#00ff41"
                        strokeWidth={Math.max(0.3, 0.5 * scale)}
                      />
                    );
                  })}
                </g>
                {/* Hub cap */}
                <circle cx={hubX} cy={hubY} r={hubR * 0.52} fill="#001800" stroke="rgba(0,255,65,0.6)" strokeWidth={sw} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Turbine cards — T-05 (far/left) → T-01 (close/right) */}
      <div className="relative z-20 flex gap-1.5 px-3 pb-2 shrink-0">
        {Array.from({ length: 5 }, (_, i) => {
          const idx = 4 - i;
          return <TurbineCard key={idx} index={idx} powerMW={powerMW * RPM_MULTIPLIERS[idx]} />;
        })}
      </div>

      {/* Fleet power output */}
      <div className="relative z-20 flex flex-col items-center pb-1 shrink-0">
        <p className="text-4xl font-bold" style={{ color: "#00ff41", textShadow: "0 0 20px rgba(0,255,65,0.5)" }}>
          {fleetPowerMW.toFixed(2)} <span className="text-2xl font-medium">MW</span>
        </p>
        {fleetPowerMW > 0 ? (
          <p className="text-xs italic" style={{ color: "rgba(0,255,65,0.45)" }}>
            The nation of Bulgaria thanks you, comrade.
          </p>
        ) : (
          <p className="text-xs" style={{ color: "rgba(0,255,65,0.3)" }}>No power output</p>
        )}
      </div>

      {/* Slider panel */}
      <div className="relative z-20 px-4 pb-6 shrink-0">
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
