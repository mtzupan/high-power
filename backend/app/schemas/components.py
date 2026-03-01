from typing import Optional

from sqlmodel import SQLModel


class GearboxRead(SQLModel):
    id: int
    turbine_id: int
    gear_ratio: float
    num_stages: int
    stage_configuration: str
    efficiency: float
    lubrication_type: str
    input_speed_rpm: float
    output_speed_rpm: float
    mass_tonnes: float


class GeneratorRead(SQLModel):
    id: int
    turbine_id: int
    gearbox_id: Optional[int]
    generator_type: str
    rated_power_kw: float
    rated_voltage_v: float
    rated_speed_rpm: float
    pole_pairs: int
    efficiency: float
    power_factor: float
    cooling_type: str
    mass_tonnes: float


class BladeRead(SQLModel):
    id: int
    turbine_id: int
    blade_length_m: float
    material: str
    manufacturing_method: str
    mass_kg: float
    max_chord_m: float
    root_chord_m: float
    total_twist_deg: float
    airfoil_family: str
    design_tip_speed_ratio: float
    pre_bend_m: float
    num_blades: int


class PitchSystemRead(SQLModel):
    id: int
    turbine_id: int
    actuator_type: str
    control_type: str
    pitch_rate_deg_per_s: float
    fine_pitch_angle_deg: float
    feather_angle_deg: float


class YawSystemRead(SQLModel):
    id: int
    turbine_id: int
    drive_type: str
    num_drives: int
    yaw_rate_deg_per_s: float
    activation_threshold_deg: float
    brake_torque_kNm: float


class TowerRead(SQLModel):
    id: int
    turbine_id: int
    hub_height_m: float
    base_diameter_m: float
    top_diameter_m: float
    wall_thickness_mm: float
    material: str
    mass_tonnes: float
    first_nat_freq_hz: float


class WakeModelRead(SQLModel):
    id: int
    turbine_id: int
    model_type: str
    thrust_coefficient: float
    wake_decay_constant: float
    ambient_turbulence_intensity: float


class YawPowerLossResponse(SQLModel):
    yaw_error_deg: float
    cos2_factor: float
    power_loss_fraction: float


class TowerFrequencyResponse(SQLModel):
    first_nat_freq_hz: float
    one_p_hz: float
    three_p_hz: float
    is_soft_stiff: bool
    margin_to_1p_hz: float
    margin_to_3p_hz: float


class WakeDeficitResponse(SQLModel):
    wind_speed_mps: float
    distance_m: float
    wake_speed_mps: float
    speed_deficit_fraction: float
