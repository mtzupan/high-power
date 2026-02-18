"use client";

import Link from "next/link";
import { useState } from "react";
import { useWindSpeed } from "@/context/WindSpeedContext";

const PIVOT_X = 440;
const PIVOT_Y = 195;

const AIRFOIL_PATH =
  "M 370,195 C 390,145 468,121 538,133 C 602,145 638,171 650,195 " +
  "C 638,207 598,213 538,209 C 468,205 390,200 370,195 Z";

const UPPER_OFFSETS = [-130, -80, -42] as const;
const LOWER_OFFSETS = [42, 82, 125] as const;
const WIND_OFFSETS = [-100, -50, 0, 50, 100] as const;
const LIFT_XS = [355, 410, 465, 520, 575] as const;

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

export default function BladeDetail() {
  const [angleOfAttack, setAngleOfAttack] = useState(8);
  const { windSpeed, setWindSpeed } = useWindSpeed();

  const aoaRad = (angleOfAttack * Math.PI) / 180;
  const cl = Math.max(0, Math.min(2 * Math.PI * aoaRad, 1.8));
  const pressureDiff = Math.round(0.5 * 1.225 * windSpeed ** 2 * cl);
  const resultantVelocity = (windSpeed * (1 + 0.4 * cl)).toFixed(1);
  const liftPx = Math.min((cl / 1.8) * 80 * Math.min(windSpeed / 10, 2), 90);
  const windArrowLen = Math.min(windSpeed * 6.5, 160);

  const chordEndX = 320 + 48 * Math.cos(-aoaRad);
  const chordEndY = PIVOT_Y + 48 * Math.sin(-aoaRad);

  return (
    <main
      className="h-dvh w-full overflow-hidden flex flex-col select-none"
      style={{ background: "#000" }}
    >
      {/* Nav */}
      <div className="flex items-center px-4 pt-10 pb-2 shrink-0">
        <Link
          href="/design/blades"
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium"
          style={{ ...BUTTON, color: "#00ff41" }}
        >
          <span aria-hidden="true">‹</span>
          <span>Back to Blades</span>
        </Link>
      </div>

      {/* SVG visualization */}
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

      {/* Bottom control panel */}
      <div className="px-4 pb-8 pt-2 shrink-0">
        <div className="mx-auto max-w-2xl rounded-2xl px-5 py-4" style={PANEL}>
          {/* Output boxes */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 rounded-xl px-4 py-3 text-center" style={OUTPUT}>
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "rgba(0,255,65,0.55)" }}>
                Pressure diff
              </p>
              <p className="text-lg font-bold" style={{ color: "#00ff41" }}>{pressureDiff} Pa</p>
            </div>
            <div className="flex-1 rounded-xl px-4 py-3 text-center" style={OUTPUT}>
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "rgba(0,255,65,0.55)" }}>
                Resultant velocity
              </p>
              <p className="text-lg font-bold" style={{ color: "#00ff41" }}>{resultantVelocity} m/s</p>
            </div>
          </div>

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
          <div>
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
        </div>
      </div>
    </main>
  );
}
