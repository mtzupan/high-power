"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import type { GearboxData, GeneratorData } from "@/lib/api";

const PANEL = { background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)", backdropFilter: "blur(10px)" };
const BUTTON = { background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.35)", backdropFilter: "blur(10px)" };

const HUB_X = 150;
const HUB_Y = 120;
const FIXED_RPM = 15;

interface Props {
  gearbox: GearboxData;
  generator: GeneratorData;
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
          style={{ ...BUTTON, color: "#00ff41" }}
        >
          <span aria-hidden="true">‹</span>
          <span>Back</span>
        </Link>
        <span className="text-sm font-semibold" style={{ color: "rgba(0,255,65,0.7)" }}>
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
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "rgba(0,255,65,0.55)" }}>
                {label}
              </p>
              <p className="text-lg font-bold" style={{ color: "#00ff41" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* CENTER — turbine + nacelle cutaway SVG */}
        <div className="flex flex-col min-h-0 order-1 md:order-2">
          <div className="flex-1 min-h-0 rounded-2xl overflow-hidden" style={PANEL}>
            <svg
              viewBox="0 0 300 420"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Mountains */}
              <polygon points="60,320 150,230 240,320" fill="#001a00" />
              <polygon points="10,320 110,250 200,320" fill="#001000" />

              {/* Tower */}
              <polygon
                points="144,248 156,248 154,315 146,315"
                fill="#001500"
                stroke="rgba(0,255,65,0.4)"
                strokeWidth="1"
              />

              {/* Nacelle cutaway box */}
              <rect
                x="120" y="208" width="120" height="44" rx="6"
                fill="#001200"
                stroke="rgba(0,255,65,0.5)"
                strokeWidth="1"
              />

              {/* Low-speed shaft (left side of nacelle) */}
              <rect x="120" y="226" width="22" height="8" rx="2" fill="#002200" stroke="rgba(0,255,65,0.4)" strokeWidth="0.8" />
              <text x="131" y="238" fill="rgba(0,255,65,0.55)" fontSize="5" textAnchor="middle">LSS</text>

              {/* Gearbox box */}
              <rect x="145" y="218" width="30" height="24" rx="3" fill="#001800" stroke="#00ff41" strokeWidth="1" />
              <text x="160" y="229" fill="#00ff41" fontSize="5.5" textAnchor="middle" fontWeight="600">Gear</text>
              <text x="160" y="237" fill="#00ff41" fontSize="5.5" textAnchor="middle" fontWeight="600">box</text>

              {/* High-speed shaft */}
              <rect x="178" y="226" width="18" height="8" rx="2" fill="#002200" stroke="rgba(0,255,65,0.4)" strokeWidth="0.8" />
              <text x="187" y="238" fill="rgba(0,255,65,0.55)" fontSize="5" textAnchor="middle">HSS</text>

              {/* Generator box */}
              <rect x="198" y="216" width="38" height="28" rx="3" fill="#001500" stroke="#00ff41" strokeWidth="1" />
              <text x="217" y="228" fill="#00ff41" fontSize="5.5" textAnchor="middle" fontWeight="600">Gen</text>
              <text x="217" y="237" fill="#00ff41" fontSize="5.5" textAnchor="middle" fontWeight="600">erator</text>

              {/* LSS RPM annotation */}
              <text x="131" y="213" fill="rgba(0,255,65,0.65)" fontSize="5.5" textAnchor="middle">
                {gearbox.input_speed_rpm} RPM
              </text>

              {/* HSS RPM annotation */}
              <text x="187" y="213" fill="rgba(0,255,65,0.65)" fontSize="5.5" textAnchor="middle">
                {gearbox.output_speed_rpm} RPM
              </text>

              {/* Hub */}
              <circle cx={HUB_X} cy={HUB_Y} r="7" fill="#001800" stroke="#00ff41" strokeWidth="1" />
              <circle cx={HUB_X} cy={HUB_Y} r="4.5" fill="#002500" />

              {/* Rotating blades */}
              <g ref={svgGroupRef}>
                {[0, 120, 240].map((angle) => (
                  <g key={angle} transform={`rotate(${angle} ${HUB_X} ${HUB_Y})`}>
                    <path
                      d={`M${HUB_X},${HUB_Y} L${HUB_X - 3},35 Q${HUB_X},18 ${HUB_X + 3},35 Z`}
                      fill="rgba(0,255,65,0.07)"
                      stroke="#00ff41"
                      strokeWidth="1"
                    />
                  </g>
                ))}
              </g>

              {/* Hub cap */}
              <circle cx={HUB_X} cy={HUB_Y} r="3" fill="#001800" stroke="rgba(0,255,65,0.6)" strokeWidth="1" />

              {/* Main shaft connecting hub to nacelle */}
              <rect x="148" y="117" width="6" height="93" rx="2" fill="#001500" stroke="rgba(0,255,65,0.2)" strokeWidth="0.5" />

              {/* Ground */}
              <rect x="0" y="315" width="300" height="35" fill="#001000" />

              {/* Stage config label */}
              <text x="160" y="270" fill="rgba(0,255,65,0.4)" fontSize="5" textAnchor="middle">
                {gearbox.stage_configuration}
              </text>
              <text x="160" y="278" fill="rgba(0,255,65,0.35)" fontSize="4.5" textAnchor="middle">
                {gearbox.num_stages}-stage · {gearbox.lubrication_type.replace("_", " ")}
              </text>
            </svg>
          </div>

          {/* Efficiency bars */}
          <div className="shrink-0 mt-2 rounded-2xl px-4 py-3" style={PANEL}>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(0,255,65,0.7)" }}>
                <span>Gearbox efficiency</span>
                <span style={{ color: "#00ff41", fontWeight: 700 }}>{(gearbox.efficiency * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: "rgba(0,255,65,0.1)" }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${gearbox.efficiency * 100}%`, background: "#00ff41" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(0,255,65,0.7)" }}>
                <span>Generator efficiency</span>
                <span style={{ color: "#00ff41", fontWeight: 700 }}>{(generator.efficiency * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: "rgba(0,255,65,0.1)" }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${generator.efficiency * 100}%`, background: "#00ff41" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — generator specs */}
        <div className="flex flex-col gap-2 justify-center order-3">
          {rightStats.map(({ label, value }) => (
            <div key={label} className="rounded-xl px-4 py-3 text-center" style={PANEL}>
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "rgba(0,255,65,0.55)" }}>
                {label}
              </p>
              <p className="text-base font-bold" style={{ color: "#00ff41" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
