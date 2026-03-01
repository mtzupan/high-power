"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import type { GearboxData, GeneratorData } from "@/lib/api";

const PANEL = { background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)", backdropFilter: "blur(10px)" };
const BUTTON = { background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.35)", backdropFilter: "blur(10px)" };

const HUB_X = 150;
const HUB_Y = 118;
const FIXED_RPM = 15;

const G = "#00ff41";
const G4 = "rgba(0,255,65,0.4)";
const G6 = "rgba(0,255,65,0.6)";
const G7 = "rgba(0,255,65,0.7)";

interface Props {
  gearbox: GearboxData;
  generator: GeneratorData;
}

function GearTeeth({ cx, cy, r, count }: { cx: number; cy: number; r: number; count: number }) {
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
            stroke={G}
            strokeWidth="2"
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

  return (
    <main
      className="h-dvh w-full overflow-hidden flex flex-col select-none"
      style={{ background: "#000" }}
    >
      {/* Nav */}
      <div className="flex items-center justify-between px-4 pt-12 pb-2 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium"
          style={{ ...BUTTON, color: G }}
        >
          <span aria-hidden="true">‹</span>
          <span>Back</span>
        </Link>
        <span className="text-sm font-semibold" style={{ color: G7 }}>
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
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "rgba(0,255,65,0.55)" }}>{label}</p>
              <p className="text-lg font-bold" style={{ color: G }}>{value}</p>
            </div>
          ))}
        </div>

        {/* CENTER — nacelle cutaway SVG */}
        <div className="flex flex-col min-h-0 order-1 md:order-2">
          <div className="flex-1 min-h-0 rounded-2xl overflow-hidden" style={PANEL}>
            <svg viewBox="0 0 300 420" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                {/* Scanline / grid overlay */}
                <pattern id="dt-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,255,65,0.04)" strokeWidth="0.5" />
                </pattern>
              </defs>

              {/* Background grid */}
              <rect x="0" y="0" width="300" height="420" fill="#000" />
              <rect x="0" y="0" width="300" height="420" fill="url(#dt-grid)" />

              {/* Ground / horizon */}
              <polygon points="0,340 80,310 160,325 240,305 300,318 300,420 0,420" fill="#001200" />
              <polygon points="0,350 60,330 140,342 220,322 300,335 300,420 0,420" fill="#000e00" />

              {/* Tower */}
              <polygon
                points="144,252 156,252 153,355 147,355"
                fill="#001500"
                stroke={G4}
                strokeWidth="1"
              />

              {/* Tower label */}
              <line x1="155" y1="310" x2="195" y2="325" stroke={G4} strokeWidth="0.7" />
              <text x="197" y="328" fill={G4} fontSize="7" fontWeight="600">Tower</text>

              {/* Nacelle outer housing */}
              <rect x="112" y="205" width="158" height="50" rx="10"
                fill="#001800" stroke={G6} strokeWidth="1.5" />

              {/* Nacelle label */}
              <line x1="210" y1="255" x2="228" y2="278" stroke={G4} strokeWidth="0.7" />
              <text x="230" y="281" fill={G4} fontSize="7" fontWeight="600">Nacelle</text>

              {/* Main shaft (hub → nacelle) */}
              <rect x="147" y="131" width="7" height="74" rx="2"
                fill="#001500" stroke="rgba(0,255,65,0.25)" strokeWidth="0.8" />

              {/* Low-speed shaft */}
              <rect x="110" y="220" width="40" height="18" rx="5"
                fill="#001e3a" stroke="rgba(0,180,255,0.7)" strokeWidth="1.2" />
              <text x="130" y="231" fill="rgba(0,200,255,0.9)" fontSize="5" textAnchor="middle" fontWeight="700">LSS</text>

              {/* LSS label */}
              <line x1="116" y1="220" x2="88" y2="195" stroke={G4} strokeWidth="0.7" />
              <text x="14" y="192" fill={G7} fontSize="6.5" fontWeight="600">Low-speed</text>
              <text x="14" y="201" fill={G7} fontSize="6.5" fontWeight="600">shaft</text>
              <text x="14" y="211" fill={G4} fontSize="5.5">{gearbox.input_speed_rpm} RPM</text>

              {/* Brake — purple tint */}
              <rect x="149" y="207" width="8" height="44" rx="3"
                fill="#1a0030" stroke="rgba(180,80,255,0.8)" strokeWidth="1.2" />

              {/* Brake label */}
              <line x1="153" y1="251" x2="130" y2="270" stroke={G4} strokeWidth="0.7" />
              <text x="90" y="273" fill={G7} fontSize="7" fontWeight="600">Brake</text>

              {/* Gearbox body */}
              <rect x="157" y="206" width="38" height="46" rx="5"
                fill="#1a1000" stroke={G} strokeWidth="1.5" />
              {/* Large gear */}
              <circle cx="172" cy="226" r="11" fill="#001800" stroke={G} strokeWidth="1" />
              <GearTeeth cx={172} cy={226} r={11} count={12} />
              <circle cx="172" cy="226" r="3.5" fill="#002800" stroke={G6} strokeWidth="0.8" />
              {/* Small gear */}
              <circle cx="185" cy="238" r="7" fill="#001800" stroke={G6} strokeWidth="1" />
              <GearTeeth cx={185} cy={238} r={7} count={8} />
              <circle cx="185" cy="238" r="2.5" fill="#002800" stroke={G4} strokeWidth="0.8" />

              {/* Gearbox label */}
              <line x1="176" y1="206" x2="178" y2="183" stroke={G4} strokeWidth="0.7" />
              <text x="178" y="179" fill={G7} fontSize="7" textAnchor="middle" fontWeight="600">Gear Box</text>
              <text x="178" y="170" fill={G4} fontSize="5.5" textAnchor="middle">
                {gearbox.gear_ratio.toFixed(1)}:1 · {gearbox.num_stages}-stage
              </text>

              {/* High-speed shaft */}
              <rect x="195" y="222" width="22" height="14" rx="4"
                fill="#001a00" stroke={G} strokeWidth="1.2" />
              <text x="206" y="231" fill={G} fontSize="4.5" textAnchor="middle" fontWeight="700">HSS</text>

              {/* HSS label */}
              <line x1="206" y1="222" x2="206" y2="195" stroke={G4} strokeWidth="0.7" />
              <text x="206" y="191" fill={G7} fontSize="6" textAnchor="middle" fontWeight="600">High-speed shaft</text>
              <text x="206" y="200" fill={G4} fontSize="5.5" textAnchor="middle">{gearbox.output_speed_rpm} RPM</text>

              {/* Generator body */}
              <rect x="217" y="207" width="50" height="46" rx="6"
                fill="#1a0400" stroke={G} strokeWidth="1.5" />
              {/* Winding coils */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect key={i}
                  x={221 + i * 7} y="212" width="5" height="36" rx="1.5"
                  fill="#002200" stroke={G4} strokeWidth="0.6"
                />
              ))}
              {/* End cap */}
              <rect x="256" y="210" width="8" height="40" rx="3"
                fill="#001200" stroke={G6} strokeWidth="1" />

              {/* Generator label */}
              <line x1="242" y1="207" x2="255" y2="183" stroke={G4} strokeWidth="0.7" />
              <text x="257" y="179" fill={G7} fontSize="7" fontWeight="600">Generator</text>
              <text x="257" y="188" fill={G4} fontSize="5.5">{generator.rated_power_kw.toLocaleString()} kW</text>

              {/* Hub */}
              <circle cx={HUB_X} cy={HUB_Y} r="14" fill="#001800" stroke={G} strokeWidth="2" />
              <circle cx={HUB_X} cy={HUB_Y} r="6" fill="#002500" stroke={G6} strokeWidth="1" />

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
                      fill="rgba(0,255,65,0.07)"
                      stroke={G}
                      strokeWidth="1.2"
                    />
                  </g>
                ))}
              </g>

              {/* Hub cap */}
              <circle cx={HUB_X} cy={HUB_Y} r="5" fill="#001800" stroke={G6} strokeWidth="1.2" />
              <circle cx={HUB_X} cy={HUB_Y} r="2" fill="#002800" />

              {/* Rotor label */}
              <line x1="138" y1="108" x2="88" y2="83" stroke={G4} strokeWidth="0.8" />
              <text x="24" y="81" fill={G7} fontSize="7" fontWeight="600">Rotor</text>

              {/* Pitch label */}
              <line x1="153" y1="52" x2="195" y2="40" stroke={G4} strokeWidth="0.7" />
              <text x="197" y="43" fill={G7} fontSize="7" fontWeight="600">Pitch</text>

              {/* Stage config annotation */}
              <text x="191" y="298" fill="rgba(0,255,65,0.35)" fontSize="6" textAnchor="middle">
                {gearbox.stage_configuration} · {gearbox.lubrication_type.replace("_", " ")}
              </text>
            </svg>
          </div>

          {/* Efficiency bars */}
          <div className="shrink-0 mt-2 rounded-2xl px-4 py-3" style={PANEL}>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1" style={{ color: G7 }}>
                <span>Gearbox efficiency</span>
                <span style={{ color: G, fontWeight: 700 }}>{(gearbox.efficiency * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: "rgba(0,255,65,0.1)" }}>
                <div className="h-1.5 rounded-full" style={{ width: `${gearbox.efficiency * 100}%`, background: G }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: G7 }}>
                <span>Generator efficiency</span>
                <span style={{ color: G, fontWeight: 700 }}>{(generator.efficiency * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: "rgba(0,255,65,0.1)" }}>
                <div className="h-1.5 rounded-full" style={{ width: `${generator.efficiency * 100}%`, background: G }} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — generator specs */}
        <div className="flex flex-col gap-2 justify-center order-3">
          {rightStats.map(({ label, value }) => (
            <div key={label} className="rounded-xl px-4 py-3 text-center" style={PANEL}>
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "rgba(0,255,65,0.55)" }}>{label}</p>
              <p className="text-base font-bold" style={{ color: G }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
