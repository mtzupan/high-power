from sqlmodel import SQLModel


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
