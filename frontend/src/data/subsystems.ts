export interface Subsystem {
  id: string;
  label: string;
  interactive: boolean;
}

const SUBSYSTEMS: Record<string, Subsystem> = {
  blades: { id: "blades", label: "Blades", interactive: true },
  drivetrain: { id: "drivetrain", label: "Drivetrain", interactive: true },
};

export function getSubsystem(id: string): Subsystem | undefined {
  return SUBSYSTEMS[id];
}

export function calcWeight(n: number): string {
  // Base weight ~20t for 3 blades; scales roughly linearly
  const tons = 20 + (n - 3) * 2.5;
  return `${tons.toFixed(1)} t`;
}

export function calcCost(n: number): string {
  // Base cost ~1200k for 3 blades; each blade adds ~60k
  const k = 1200 + (n - 3) * 60;
  return `${k}k`;
}

export function calcAvgOutput(n: number): string {
  // Peaks at 3 blades — deviation reduces efficiency
  const scale = 1 - Math.abs(n - 3) * 0.06;
  const mw = 2.0 * scale;
  return `${mw.toFixed(2)} MW`;
}

export function calcEfficiency(n: number): string {
  // 100% at 3 blades; drops 6% per blade away from 3
  const pct = Math.round((1 - Math.abs(n - 3) * 0.06) * 100);
  return `${pct}%`;
}

const CUT_IN_WIND = 4;
const RATED_WIND = 13;
const RATED_POWER_MW = 2.0;

export function generatePowerCurve(
  n: number
): { wind: number; power: number }[] {
  const scale = 1 - Math.abs(n - 3) * 0.06;
  return Array.from({ length: 26 }, (_, i) => {
    const wind = i;
    let power = 0;
    if (wind >= CUT_IN_WIND && wind < RATED_WIND) {
      const fraction = (wind - CUT_IN_WIND) / (RATED_WIND - CUT_IN_WIND);
      power = RATED_POWER_MW * scale * fraction * fraction * fraction;
    } else if (wind >= RATED_WIND) {
      power = RATED_POWER_MW * scale;
    }
    return { wind, power: parseFloat(power.toFixed(3)) };
  });
}
