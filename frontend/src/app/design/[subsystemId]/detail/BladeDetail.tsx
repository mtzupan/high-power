"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWindSpeed } from "@/context/WindSpeedContext";
import type { BladeData } from "@/lib/api";

const PIVOT_X = 440;
const PIVOT_Y = 195;

const AIRFOIL_PATH =
  "M 370,195 C 390,145 468,121 538,133 C 602,145 638,171 650,195 " +
  "C 638,207 598,213 538,209 C 468,205 390,200 370,195 Z";

const UPPER_OFFSETS = [-130, -80, -42] as const;
const LOWER_OFFSETS = [42, 82, 125] as const;
const WIND_OFFSETS = [-100, -50, 0, 50, 100] as const;
const LIFT_XS = [355, 410, 465, 520, 575] as const;

const RHO = 1.225;
const TSR = 8;

const PANEL = { background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)", backdropFilter: "blur(10px)" };
const BUTTON = { background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.35)", backdropFilter: "blur(10px)" };
const OUTPUT = { background: "rgba(0,255,65,0.1)", border: "1px solid rgba(0,255,65,0.3)" };

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  return `M ${x1},${y1} A ${r},${r} 0 0,1 ${x2},${y2}`;
}

function streamlinePath(yOffset: number, aoa: number, upper: boolean): string {
  const y = PIVOT_Y + yOffset;
  const proximity = Math.max(0, 1 - Math.abs(yOffset) / 165);
  const deflect = upper ? proximity * aoa * 4 : proximity * aoa * 1.5;
  const sign = upper ? -1 : 1;
  const y1 = y + sign * deflect * 0.5;
  const y2 = y + sign * deflect;
  return `M 30,${y} C 200,${y1} 680,${y2} 870,${y}`;
}

// Hub center in the left turbine SVG
const HUB_X = 150;
const HUB_Y = 117;

export default function BladeDetail({ blade }: { blade: BladeData }) {
  const [angleOfAttack, setAngleOfAttack] = useState(8);
  const { windSpeed, setWindSpeed } = useWindSpeed();
  const [radialSection, setRadialSection] = useState(5);
  const [bladeLength, setBladeLength] = useState(blade.blade_length_m);
  const [bladeWidth, setBladeWidth] = useState(blade.max_chord_m);

  // ── Turbine animation refs ──
  const bladeAngleRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const svgGroupRef = useRef<SVGGElement>(null);
  const rpmRef = useRef(0);

  // ── Derived: compute RPM and sync to ref so animation loop reads it ──
  const aoaRad = (angleOfAttack * Math.PI) / 180;
  const cl = Math.max(0, Math.min(2 * Math.PI * aoaRad, 1.8));
  const pressureDiff = Math.round(0.5 * RHO * windSpeed ** 2 * cl);
  const resultantVelocity = (windSpeed * (1 + 0.4 * cl)).toFixed(1);
  const liftPx = Math.min((cl / 1.8) * 80 * Math.min(windSpeed / 10, 2), 90);
  const windArrowLen = Math.min(windSpeed * 6.5, 160);
  const chordEndX = 320 + 48 * Math.cos(-aoaRad);
  const chordEndY = PIVOT_Y + 48 * Math.sin(-aoaRad);
  const vTip = (TSR * windSpeed).toFixed(1);

  // Compute RPM in render so display is always in sync; sync to ref for RAF loop
  const omega = bladeLength > 0 ? (TSR * windSpeed) / bladeLength : 0;
  const rpm = (omega * 60) / (2 * Math.PI);
  rpmRef.current = rpm;

  // ── RAF animation ──
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== null) {
      const dt = (time - lastTimeRef.current) / 1000;
      const degreesPerSecond = rpmRef.current * 6;
      bladeAngleRef.current = (bladeAngleRef.current + degreesPerSecond * dt) % 360;
      if (svgGroupRef.current) {
        svgGroupRef.current.setAttribute(
          "transform",
          `rotate(${bladeAngleRef.current} ${HUB_X} ${HUB_Y})`
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

  // ── Integrated blade sections (10-section discrete sum) ──
  const segLen = bladeLength / 10;
  const sections = Array.from({ length: 10 }, (_, i) => {
    const r = (i + 0.5) / 10;
    const chord = bladeWidth * (1 - r ** 2);
    const area = chord * segLen;
    const lift = 0.5 * RHO * windSpeed ** 2 * area * cl;
    const drag = 0.5 * RHO * windSpeed ** 2 * area * (0.05 + 0.1 * cl ** 2);
    return { lift, drag };
  });
  const totalLift = Math.round(sections.reduce((s, x) => s + x.lift, 0));
  const weight = Math.round(8 * bladeLength * bladeWidth);
  const cost = Math.round(weight * 200);

  // ── Blade profile SVG helpers ──
  const maxChordPx = Math.min(bladeWidth * 12, 54);
  const bladeTopY = 20;
  const bladeRootY = 290;
  const bladeSpanPx = bladeRootY - bladeTopY;
  const profilePts = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10; // 0 = root (bottom), 1 = tip (top)
    const y = bladeRootY - t * bladeSpanPx;
    const half = (maxChordPx * (1 - t * t)) / 2;
    return { y, left: 60 - half, right: 60 + half };
  });
  const leftEdge = profilePts.map((p, i) => `${i === 0 ? "M" : "L"}${p.left},${p.y}`).join(" ");
  const rightEdge = [...profilePts].reverse().map((p) => `L${p.right},${p.y}`).join(" ");
  const bladePath = `${leftEdge}${rightEdge} Z`;

  const sectionBands = Array.from({ length: 10 }, (_, i) => {
    const t0 = i / 10;
    const t1 = (i + 1) / 10;
    const y0 = bladeRootY - t0 * bladeSpanPx;
    const y1 = bladeRootY - t1 * bladeSpanPx;
    const half0 = (maxChordPx * (1 - t0 * t0)) / 2;
    const half1 = (maxChordPx * (1 - t1 * t1)) / 2;
    const d = `M${60 - half0},${y0} L${60 + half0},${y0} L${60 + half1},${y1} L${60 - half1},${y1} Z`;
    return { i, d };
  });

  return (
    <main
      className="h-dvh w-full overflow-hidden flex flex-col select-none"
      style={{ background: "#000" }}
    >
      {/* Nav */}
      <div className="flex items-center justify-between px-4 pt-10 pb-2 shrink-0">
        <Link
          href="/design/blades"
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium"
          style={{ ...BUTTON, color: "#00ff41" }}
        >
          <span aria-hidden="true">‹</span>
          <span>Back to Blades</span>
        </Link>
        <div className="flex gap-2">
          <button
            disabled
            className="rounded-2xl px-4 py-2 text-sm font-medium"
            style={{ ...BUTTON, color: "#00ff41" }}
          >
            Pressure
          </button>
          <button
            disabled
            className="rounded-2xl px-4 py-2 text-sm font-medium"
            style={{ ...BUTTON, color: "#00ff41" }}
          >
            FEA
          </button>
        </div>
      </div>

      {/* 3-column grid */}
      <div className="flex-1 min-h-0 grid md:grid-cols-[1fr_2fr_1fr] gap-3 px-3 pb-4">

        {/* ── LEFT — Rotating turbine ── */}
        <div className="flex flex-col gap-2 min-h-0 order-2 md:order-1">
          {/* Turbine SVG */}
          <div className="flex-1 min-h-0 rounded-2xl overflow-hidden" style={PANEL}>
            <svg
              viewBox="0 0 300 250"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Mountains */}
              <polygon points="60,220 150,125 240,220" fill="#001a00" />
              <polygon points="10,220 110,145 200,220" fill="#001000" />

              {/* Tower */}
              <polygon
                points="144,148 156,148 154,215 146,215"
                fill="#001500"
                stroke="rgba(0,255,65,0.4)"
                strokeWidth="1"
              />

              {/* Nacelle */}
              <rect x="139" y="110" width="22" height="11" rx="3" fill="#001a00" stroke="rgba(0,255,65,0.5)" strokeWidth="1" />

              {/* Hub */}
              <circle cx={HUB_X} cy={HUB_Y} r="7" fill="#001800" stroke="#00ff41" strokeWidth="1" />
              <circle cx={HUB_X} cy={HUB_Y} r="4.5" fill="#002500" />

              {/* Rotating blades group — transform set by RAF */}
              <g ref={svgGroupRef}>
                {[0, 120, 240].map((angle) => (
                  <g key={angle} transform={`rotate(${angle} ${HUB_X} ${HUB_Y})`}>
                    <path
                      d={`M${HUB_X},${HUB_Y} L${HUB_X - 3},40 Q${HUB_X},22 ${HUB_X + 3},40 Z`}
                      fill="rgba(0,255,65,0.07)"
                      stroke="#00ff41"
                      strokeWidth="1"
                    />
                  </g>
                ))}
              </g>

              {/* Hub cap */}
              <circle cx={HUB_X} cy={HUB_Y} r="3" fill="#001800" stroke="rgba(0,255,65,0.6)" strokeWidth="1" />

              {/* Ground */}
              <rect x="0" y="215" width="300" height="35" fill="#001000" />
            </svg>
          </div>

          {/* Output boxes */}
          <div className="flex flex-col gap-1.5 shrink-0">
            {[
              { label: "Tip Speed", value: `${vTip} m/s` },
              { label: "RPM", value: rpm.toFixed(1) },
              { label: "Pressure Diff", value: `${pressureDiff} Pa` },
              { label: "Resultant Vel", value: `${resultantVelocity} m/s` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl px-3 py-2 text-center" style={OUTPUT}>
                <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "rgba(0,255,65,0.55)" }}>
                  {label}
                </p>
                <p className="text-base font-bold" style={{ color: "#00ff41" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTER — Airfoil cross-section ── */}
        <div className="flex flex-col min-h-0 order-1 md:order-2">
          {/* Airfoil SVG */}
          <div className="flex-1 min-h-0">
            <svg
              viewBox="0 0 900 420"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <marker
                  id="blade-stream-arrow"
                  viewBox="0 0 6 6"
                  markerWidth="5"
                  markerHeight="5"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(0,255,65,0.6)" />
                </marker>
                <marker
                  id="blade-wind-arrow"
                  viewBox="0 0 6 6"
                  markerWidth="5"
                  markerHeight="5"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="#00ff41" />
                </marker>
                <marker
                  id="blade-lift-arrow"
                  viewBox="0 0 6 6"
                  markerWidth="5"
                  markerHeight="5"
                  refX="3"
                  refY="0"
                  orient="auto"
                >
                  <path d="M0,6 L3,0 L6,6 Z" fill="#00ff41" />
                </marker>
              </defs>

              {/* Upper streamlines — low pressure */}
              {UPPER_OFFSETS.map((dy) => (
                <path
                  key={`u${dy}`}
                  d={streamlinePath(dy, angleOfAttack, true)}
                  fill="none"
                  stroke="rgba(0,255,65,0.45)"
                  strokeWidth="1.5"
                  markerEnd="url(#blade-stream-arrow)"
                />
              ))}

              {/* Lower streamlines — high pressure */}
              {LOWER_OFFSETS.map((dy) => (
                <path
                  key={`l${dy}`}
                  d={streamlinePath(dy, angleOfAttack, false)}
                  fill="none"
                  stroke="rgba(0,255,65,0.25)"
                  strokeWidth="1.2"
                  markerEnd="url(#blade-stream-arrow)"
                />
              ))}

              {/* Wind incoming arrows */}
              {windArrowLen > 4 &&
                WIND_OFFSETS.map((dy) => (
                  <line
                    key={`w${dy}`}
                    x1={50}
                    y1={PIVOT_Y + dy}
                    x2={50 + windArrowLen}
                    y2={PIVOT_Y + dy}
                    stroke="rgba(0,255,65,0.7)"
                    strokeWidth="2"
                    markerEnd="url(#blade-wind-arrow)"
                  />
                ))}

              {/* Lift arrows */}
              {liftPx > 4 &&
                LIFT_XS.map((x) => (
                  <line
                    key={`lft${x}`}
                    x1={x}
                    y1={275}
                    x2={x}
                    y2={275 - liftPx}
                    stroke="#00ff41"
                    strokeWidth="2.5"
                    markerEnd="url(#blade-lift-arrow)"
                  />
                ))}

              {/* Airfoil — rotates with AoA */}
              <g transform={`rotate(${-angleOfAttack}, ${PIVOT_X}, ${PIVOT_Y})`}>
                <line
                  x1={370}
                  y1={195}
                  x2={650}
                  y2={195}
                  stroke="rgba(0,255,65,0.3)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <path
                  d={AIRFOIL_PATH}
                  fill="rgba(0,255,65,0.06)"
                  stroke="#00ff41"
                  strokeWidth="1.5"
                />
                <text
                  x={510}
                  y={183}
                  fill="rgba(0,255,65,0.85)"
                  fontSize="13"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  Curved Blade
                </text>
              </g>

              {/* AoA indicator */}
              <line
                x1={320}
                y1={PIVOT_Y}
                x2={368}
                y2={PIVOT_Y}
                stroke="rgba(0,255,65,0.5)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <line
                x1={320}
                y1={PIVOT_Y}
                x2={chordEndX}
                y2={chordEndY}
                stroke="#00ff41"
                strokeWidth="2"
              />
              {angleOfAttack > 0 && (
                <path
                  d={describeArc(320, PIVOT_Y, 28, -angleOfAttack, 0)}
                  fill="none"
                  stroke="#00ff41"
                  strokeWidth="1.2"
                  opacity="0.8"
                />
              )}
              <text x={285} y={PIVOT_Y + 28} fill="rgba(0,255,65,0.7)" fontSize="11" textAnchor="middle">
                Angle of
              </text>
              <text x={285} y={PIVOT_Y + 41} fill="rgba(0,255,65,0.7)" fontSize="11" textAnchor="middle">
                Attack
              </text>

              {/* Fixed labels */}
              <text x={65} y={PIVOT_Y - 118} fill="rgba(0,255,65,0.7)" fontSize="13" fontWeight="600">
                Wind
              </text>
              <text x={730} y={100} fill="rgba(0,255,65,0.75)" fontSize="13" fontWeight="500" textAnchor="middle">
                Low Pressure
              </text>
              <text x={710} y={340} fill="rgba(0,255,65,0.45)" fontSize="13" fontWeight="500" textAnchor="middle">
                High Pressure
              </text>
              {liftPx > 4 && (
                <text x={465} y={292} fill="#00ff41" fontSize="12" fontWeight="600" textAnchor="middle" opacity="0.85">
                  Lift
                </text>
              )}
            </svg>
          </div>

          {/* Controls */}
          <div className="shrink-0 rounded-2xl px-4 py-3" style={PANEL}>
            {/* AoA slider */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1" style={{ color: "#00ff41" }}>
                <span className="font-medium">Angle of Attack</span>
                <span className="font-bold">{angleOfAttack}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={angleOfAttack}
                onChange={(e) => setAngleOfAttack(parseInt(e.target.value, 10))}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-0.5" style={{ color: "rgba(0,255,65,0.4)" }}>
                <span>0° (no lift)</span>
                <span>20° (near stall)</span>
              </div>
            </div>

            {/* Wind speed slider */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1" style={{ color: "#00ff41" }}>
                <span className="font-medium">Wind Speed</span>
                <span className="font-bold">{windSpeed} m/s</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-0.5" style={{ color: "rgba(0,255,65,0.4)" }}>
                <span>0 m/s</span>
                <span>25 m/s</span>
              </div>
            </div>

            {/* Save button */}
            <button
              className="w-full rounded-xl py-2 text-sm font-medium"
              style={{ ...BUTTON, color: "#00ff41" }}
            >
              Save section shape
            </button>
          </div>
        </div>

        {/* ── RIGHT — Blade profile ── */}
        <div className="flex flex-col gap-2 min-h-0 order-3">
          {/* Blade profile SVG + vertical radial slider */}
          <div className="flex-1 min-h-0 rounded-2xl overflow-hidden flex gap-2 p-2" style={PANEL}>
            {/* Blade profile SVG */}
            <div className="flex-1 min-h-0">
              <svg
                viewBox="0 0 120 310"
                className="h-full w-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Blade fill */}
                <path d={bladePath} fill="rgba(0,255,65,0.06)" />

                {/* Section highlight bands */}
                {sectionBands.map(({ i, d }) => (
                  <path
                    key={i}
                    d={d}
                    fill={i === radialSection ? "rgba(0,255,65,0.25)" : "transparent"}
                    stroke={i === radialSection ? "#00ff41" : "none"}
                    strokeWidth="1"
                  />
                ))}

                {/* Blade outline */}
                <path d={bladePath} fill="none" stroke="#00ff41" strokeWidth="1.5" />

                {/* Root label */}
                <text x="60" y="307" fill="rgba(0,255,65,0.5)" fontSize="9" textAnchor="middle">
                  root
                </text>
                {/* Tip label */}
                <text x="60" y="16" fill="rgba(0,255,65,0.5)" fontSize="9" textAnchor="middle">
                  tip
                </text>
              </svg>
            </div>

            {/* Vertical radial slider */}
            <div className="flex flex-col items-center justify-center gap-2 shrink-0 py-2">
              <span className="text-xs text-center" style={{ color: "rgba(0,255,65,0.55)" }}>
                tip
              </span>
              <input
                type="range"
                min="0"
                max="9"
                step="1"
                value={radialSection}
                onChange={(e) => setRadialSection(parseInt(e.target.value, 10))}
                style={{
                  writingMode: "vertical-lr",
                  direction: "rtl",
                  height: "140px",
                  cursor: "pointer",
                }}
              />
              <span className="text-xs text-center" style={{ color: "rgba(0,255,65,0.55)" }}>
                root
              </span>
              <span className="text-xs font-bold text-center" style={{ color: "#00ff41" }}>
                {radialSection + 1}/10
              </span>
            </div>
          </div>

          {/* Blade size controls */}
          <div className="shrink-0 rounded-2xl px-3 py-2" style={PANEL}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: "rgba(0,255,65,0.7)" }}>
                Blade width: <span style={{ color: "#00ff41", fontWeight: 700 }}>{bladeWidth}m</span>
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setBladeWidth((w) => Math.min(6, +(w + 0.5).toFixed(1)))}
                  className="rounded-lg px-2 py-0.5 text-sm font-bold"
                  style={{ ...BUTTON, color: "#00ff41" }}
                >
                  ↑
                </button>
                <button
                  onClick={() => setBladeWidth((w) => Math.max(1, +(w - 0.5).toFixed(1)))}
                  className="rounded-lg px-2 py-0.5 text-sm font-bold"
                  style={{ ...BUTTON, color: "#00ff41" }}
                >
                  ↓
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "rgba(0,255,65,0.7)" }}>
                Blade length: <span style={{ color: "#00ff41", fontWeight: 700 }}>{bladeLength}m</span>
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setBladeLength((l) => Math.min(80, l + 5))}
                  className="rounded-lg px-2 py-0.5 text-sm font-bold"
                  style={{ ...BUTTON, color: "#00ff41" }}
                >
                  ↑
                </button>
                <button
                  onClick={() => setBladeLength((l) => Math.max(20, l - 5))}
                  className="rounded-lg px-2 py-0.5 text-sm font-bold"
                  style={{ ...BUTTON, color: "#00ff41" }}
                >
                  ↓
                </button>
              </div>
            </div>
          </div>

          {/* Integrated outputs */}
          <div className="flex flex-col gap-1.5 shrink-0">
            {[
              { label: "Lift", value: `${totalLift.toLocaleString()} N` },
              { label: "Weight", value: `${weight.toLocaleString()} kg` },
              { label: "Cost", value: `$${cost.toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl px-3 py-2 text-center" style={OUTPUT}>
                <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "rgba(0,255,65,0.55)" }}>
                  {label}
                </p>
                <p className="text-base font-bold" style={{ color: "#00ff41" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
