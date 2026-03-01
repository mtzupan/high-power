const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface GearboxData {
  id: number;
  turbine_id: number;
  gear_ratio: number;
  num_stages: number;
  stage_configuration: string;
  efficiency: number;
  lubrication_type: string;
  input_speed_rpm: number;
  output_speed_rpm: number;
  mass_tonnes: number;
}

export interface GeneratorData {
  id: number;
  turbine_id: number;
  gearbox_id: number | null;
  generator_type: string;
  rated_power_kw: number;
  rated_voltage_v: number;
  rated_speed_rpm: number;
  pole_pairs: number;
  efficiency: number;
  power_factor: number;
  cooling_type: string;
  mass_tonnes: number;
}

export interface BladeData {
  id: number;
  turbine_id: number;
  blade_length_m: number;
  material: string;
  manufacturing_method: string;
  mass_kg: number;
  max_chord_m: number;
  root_chord_m: number;
  total_twist_deg: number;
  airfoil_family: string;
  design_tip_speed_ratio: number;
  pre_bend_m: number;
  num_blades: number;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const fetchGearbox = (turbineId: number) =>
  apiFetch<GearboxData>(`/api/turbines/${turbineId}/gearbox`);

export const fetchGenerator = (turbineId: number) =>
  apiFetch<GeneratorData>(`/api/turbines/${turbineId}/generator`);

export const fetchBlade = (turbineId: number) =>
  apiFetch<BladeData>(`/api/turbines/${turbineId}/blade`);
