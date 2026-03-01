"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import type { GearboxData, GeneratorData } from "@/lib/api";

const HUB_X = 150;
const HUB_Y = 118;
const FIXED_RPM = 15;

interface Props {
  gearbox: GearboxData;
  generator: GeneratorData;
}

// Gear teeth drawn as short radial lines around a circle
function GearTeeth({ cx, cy, r, count, stroke }: { cx: number; cy: number; r: number; count: number; stroke: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * 2 * Math.PI;
        return (
          <line
            key={i}
            x1={cx + r * Math.cos(a)}
            y1={cy + r * Math.sin(a)}
            x2={cx + (r + 4) * Math.cos(a)}
            y2={cy + (r + 4) * Math.sin(a)}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

export default function DrivetrainOverview({ gearbox, generator }: Props) {
  const bladeAngleRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const svgGroupRef = useRef<SVGGElement>(null);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== null) {
      const dt = (time - lastTimeRef.current) / 1000;
      bladeAngleRef.current = (bladeAngleRef.current + FIXED_RPM * 6 * dt) % 360;
      if (svgGroupRef.current) {
        svgGroupRef.current.setAttribute("transform", `rotate(${bladeAngleRef.current} ${HUB_X} ${HUB_Y})`);
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

  const combinedEff = ((gearbox.efficiency * generator.efficiency) * 100).toFixed(1);
  const totalMass = (gearbox.mass_tonnes + generator.mass_tonnes).toFixed(1);
  const drivetrainType = generator.gearbox_id != null ? "Geared" : "Direct-Drive";

  const leftStats = [
    { label: "Gear Ratio", value: `${gearbox.gear_ratio.toFixed(1)} ×` },
    { label: "Drivetrain Type", value: drivetrainType },
    { label: "Combined Efficiency", value: `${combinedEff}%` },
    { label: "Total Mass", value: `${totalMass} t` },
  ];

  const rightStats = [
    { label: "Generator Type", value: generator.generator_type },
    { label: "Rated Power", value: `${generator.rated_power_kw.toLocaleString()} kW` },
    { label: "Rated Voltage", value: `${generator.rated_voltage_v} V` },
    { label: "Rated Speed", value: `${generator.rated_speed_rpm} RPM` },
    { label: "Cooling", value: generator.cooling_type },
    { label: "Power Factor", value: generator.power_factor.toFixed(2) },
  ];

  const PANEL = {
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(255,255,255,0.9)",
    backdropFilter: "blur(12px)",
  };

  return (
    <main
      className="h-dvh w-full overflow-hidden flex flex-col select-none"
      style={{ background: "linear-gradient(175deg, #6BB8D4 0%, #9DD4E8 35%, #C8E9F5 70%, #DEF0F8 100%)" }}
    >
      {/* Nav */}
      <div className="flex items-center justify-between px-4 pt-12 pb-2 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium"
          style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.9)", color: "#1a3a5c" }}
        >
          <span aria-hidden="true">‹</span>
          <span>Back</span>
        </Link>
        <span className="text-sm font-semibold" style={{ color: "#1a3a5c" }}>
          Drivetrain
        </span>
        <div style={{ width: 80 }} />
      </div>

      {/* 3-column grid */}
      <div className="flex-1 min-h-0 grid md:grid-cols-[1fr_2fr_1fr] gap-3 px-3 pb-4">

        {/* LEFT — key stats */}
        <div className="flex flex-col gap-2 justify-center order-2 md:order-1">
          {leftStats.map(({ label, value }) => (
            <div key={label} className="rounded-xl px-4 py-3 text-center" style={PANEL}>
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "#4477aa" }}>{label}</p>
              <p className="text-lg font-bold" style={{ color: "#1a3a5c" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* CENTER — nacelle cutaway SVG */}
        <div className="flex flex-col min-h-0 order-1 md:order-2">
          <div className="flex-1 min-h-0 rounded-2xl overflow-hidden" style={{ background: "transparent" }}>
            <svg viewBox="0 0 300 420" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="dt-nacelleShell" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eaeaea" />
                  <stop offset="100%" stopColor="#b8b8b8" />
                </linearGradient>
                <linearGradient id="dt-towerGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#b8b8b8" />
                  <stop offset="45%" stopColor="#f0f0f0" />
                  <stop offset="100%" stopColor="#a8a8a8" />
                </linearGradient>
                <linearGradient id="dt-genGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#CC4422" />
                  <stop offset="100%" stopColor="#AA2200" />
                </linearGradient>
                <linearGradient id="dt-groundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7DB352" />
                  <stop offset="100%" stopColor="#558833" />
                </linearGradient>
                <radialGradient id="dt-hubGrad" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#f0f0f0" />
                  <stop offset="100%" stopColor="#c0c0c0" />
                </radialGradient>
              </defs>

              {/* Ground */}
              <ellipse cx="100" cy="375" rx="130" ry="32" fill="#6BA042" />
              <ellipse cx="240" cy="380" rx="100" ry="28" fill="#5A8F35" />
              <rect x="0" y="365" width="300" height="55" fill="url(#dt-groundGrad)" />

              {/* Tower */}
              <polygon
                points="144,252 156,252 152,365 148,365"
                fill="url(#dt-towerGrad)"
                stroke="#aaa"
                strokeWidth="0.5"
              />

              {/* Tower label */}
              <line x1="155" y1="318" x2="195" y2="330" stroke="#1a3a5c" strokeWidth="0.7" />
              <text x="197" y="333" fill="#1a3a5c" fontSize="7.5" fontWeight="600">Tower</text>

              {/* Nacelle outer housing */}
              <rect x="112" y="205" width="158" height="50" rx="10"
                fill="url(#dt-nacelleShell)" stroke="#999" strokeWidth="1.5" />

              {/* Nacelle label */}
              <line x1="210" y1="255" x2="228" y2="278" stroke="#1a3a5c" strokeWidth="0.7" />
              <text x="230" y="281" fill="#1a3a5c" fontSize="7.5" fontWeight="600">Nacelle</text>

              {/* Main shaft (hub → nacelle) */}
              <rect x="147" y="131" width="7" height="74" rx="2"
                fill="#c8c8c8" stroke="#aaa" strokeWidth="0.8" />

              {/* Low-speed shaft — steel blue */}
              <rect x="110" y="220" width="40" height="18" rx="5"
                fill="#5B9BD5" stroke="#2E75B6" strokeWidth="1.2" />
              <text x="130" y="231" fill="white" fontSize="5" textAnchor="middle" fontWeight="700">LSS</text>

              {/* LSS label */}
              <line x1="116" y1="220" x2="88" y2="195" stroke="#1a3a5c" strokeWidth="0.7" />
              <text x="14" y="192" fill="#1a3a5c" fontSize="6.5" fontWeight="600">Low-speed</text>
              <text x="14" y="201" fill="#1a3a5c" fontSize="6.5" fontWeight="600">shaft</text>
              <text x="14" y="211" fill="#4477aa" fontSize="5.5">{gearbox.input_speed_rpm} RPM</text>

              {/* Brake — purple disc */}
              <rect x="149" y="207" width="8" height="44" rx="3"
                fill="#8855CC" stroke="#6633AA" strokeWidth="1.2" />

              {/* Brake label */}
              <line x1="153" y1="251" x2="130" y2="270" stroke="#1a3a5c" strokeWidth="0.7" />
              <text x="90" y="273" fill="#1a3a5c" fontSize="7.5" fontWeight="600">Brake</text>

              {/* Gearbox — orange with gear */}
              <rect x="157" y="206" width="38" height="46" rx="5"
                fill="#FF8C00" stroke="#CC6600" strokeWidth="1.5" />
              {/* Large gear */}
              <circle cx="172" cy="226" r="11" fill="#FFA500" stroke="#CC6600" strokeWidth="1" />
              <GearTeeth cx={172} cy={226} r={11} count={12} stroke="#CC6600" />
              <circle cx="172" cy="226" r="3.5" fill="#FF8C00" stroke="#CC6600" strokeWidth="0.8" />
              {/* Small gear */}
              <circle cx="185" cy="238" r="7" fill="#FFBE4F" stroke="#CC6600" strokeWidth="1" />
              <GearTeeth cx={185} cy={238} r={7} count={8} stroke="#CC6600" />
              <circle cx="185" cy="238" r="2.5" fill="#FFA500" stroke="#CC6600" strokeWidth="0.8" />

              {/* Gearbox label */}
              <line x1="176" y1="206" x2="178" y2="183" stroke="#1a3a5c" strokeWidth="0.7" />
              <text x="178" y="179" fill="#1a3a5c" fontSize="7.5" textAnchor="middle" fontWeight="600">Gear Box</text>
              <text x="178" y="170" fill="#4477aa" fontSize="5.5" textAnchor="middle">
                {gearbox.gear_ratio.toFixed(1)}:1 · {gearbox.num_stages}-stage
              </text>

              {/* High-speed shaft — green */}
              <rect x="195" y="222" width="22" height="14" rx="4"
                fill="#7BC87A" stroke="#4A8849" strokeWidth="1.2" />
              <text x="206" y="231" fill="#1a4a1a" fontSize="4.5" textAnchor="middle" fontWeight="700">HSS</text>

              {/* HSS label */}
              <line x1="206" y1="222" x2="206" y2="195" stroke="#1a3a5c" strokeWidth="0.7" />
              <text x="206" y="191" fill="#1a3a5c" fontSize="6.5" textAnchor="middle" fontWeight="600">High-speed shaft</text>
              <text x="206" y="200" fill="#4477aa" fontSize="5.5" textAnchor="middle">{gearbox.output_speed_rpm} RPM</text>

              {/* Generator — red */}
              <rect x="217" y="207" width="50" height="46" rx="6"
                fill="url(#dt-genGrad)" stroke="#882200" strokeWidth="1.5" />
              {/* Winding coils */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect key={i}
                  x={221 + i * 7} y="212" width="5" height="36" rx="1.5"
                  fill="#EE6644" opacity="0.85"
                />
              ))}
              {/* End cap */}
              <rect x="256" y="210" width="8" height="40" rx="3"
                fill="#994422" stroke="#771100" strokeWidth="1" />

              {/* Generator label */}
              <line x1="242" y1="207" x2="255" y2="183" stroke="#1a3a5c" strokeWidth="0.7" />
              <text x="257" y="179" fill="#1a3a5c" fontSize="7.5" fontWeight="600">Generator</text>
              <text x="257" y="188" fill="#4477aa" fontSize="5.5">{generator.rated_power_kw.toLocaleString()} kW</text>

              {/* Hub */}
              <circle cx={HUB_X} cy={HUB_Y} r="14" fill="url(#dt-hubGrad)" stroke="#bbb" strokeWidth="2" />

              {/* Rotating blades */}
              <g ref={svgGroupRef}>
                {[0, 120, 240].map((angle) => (
                  <g key={angle} transform={`rotate(${angle} ${HUB_X} ${HUB_Y})`}>
                    <path
                      d={`
                        M${HUB_X - 3},${HUB_Y - 12}
                        C${HUB_X - 8},${HUB_Y - 40} ${HUB_X - 6},50 ${HUB_X - 1},28
                        Q${HUB_X},22 ${HUB_X + 1},28
                        C${HUB_X + 6},50 ${HUB_X + 8},${HUB_Y - 40} ${HUB_X + 3},${HUB_Y - 12}
                        Z
                      `}
                      fill="#f2f2f2"
                      stroke="#d0d0d0"
                      strokeWidth="1.2"
                    />
                  </g>
                ))}
              </g>

              {/* Hub cap (drawn over blades) */}
              <circle cx={HUB_X} cy={HUB_Y} r="6" fill="#d8d8d8" stroke="#bbb" strokeWidth="1.2" />
              <circle cx={HUB_X} cy={HUB_Y} r="2.5" fill="#c0c0c0" />

              {/* Rotor label */}
              <line x1="138" y1="108" x2="88" y2="83" stroke="#CC0000" strokeWidth="0.9" />
              <text x="24" y="81" fill="#1a3a5c" fontSize="7.5" fontWeight="600">Rotor</text>

              {/* Pitch label */}
              <line x1="153" y1="52" x2="195" y2="40" stroke="#1a3a5c" strokeWidth="0.7" />
              <text x="197" y="43" fill="#1a3a5c" fontSize="7.5" fontWeight="600">Pitch</text>

              {/* Stage config annotation under nacelle */}
              <text x="191" y="300" fill="#1a3a5c" fontSize="6" textAnchor="middle" opacity="0.65">
                {gearbox.stage_configuration} · {gearbox.lubrication_type.replace("_", " ")}
              </text>
            </svg>
          </div>

          {/* Efficiency bars */}
          <div className="shrink-0 mt-2 rounded-2xl px-4 py-3" style={PANEL}>
            <div className="mb-2.5">
              <div className="flex justify-between text-xs mb-1" style={{ color: "#4477aa" }}>
                <span>Gearbox efficiency</span>
                <span style={{ color: "#CC6600", fontWeight: 700 }}>{(gearbox.efficiency * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: "rgba(0,0,0,0.08)" }}>
                <div className="h-2 rounded-full" style={{ width: `${gearbox.efficiency * 100}%`, background: "#FF8C00" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: "#4477aa" }}>
                <span>Generator efficiency</span>
                <span style={{ color: "#AA2200", fontWeight: 700 }}>{(generator.efficiency * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: "rgba(0,0,0,0.08)" }}>
                <div className="h-2 rounded-full" style={{ width: `${generator.efficiency * 100}%`, background: "#CC4422" }} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — generator specs */}
        <div className="flex flex-col gap-2 justify-center order-3">
          {rightStats.map(({ label, value }) => (
            <div key={label} className="rounded-xl px-4 py-3 text-center" style={PANEL}>
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "#4477aa" }}>{label}</p>
              <p className="text-base font-bold" style={{ color: "#1a3a5c" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
