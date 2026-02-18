from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.routers import turbine, parameter, components


SEED_TURBINES = [
    dict(name="T-01", latitude=42.7389, longitude=25.3947, capacity_mw=2.0,
         rotor_diameter_m=112.0, hub_height_m=94.0,
         cut_in_wind_speed_mps=3.0, rated_wind_speed_mps=13.0, cut_out_wind_speed_mps=25.0,
         power_coefficient=0.40, tip_speed_ratio=8.0, air_density_kg_m3=1.18),
    dict(name="T-02", latitude=42.7401, longitude=25.3923, capacity_mw=2.0,
         rotor_diameter_m=112.0, hub_height_m=94.0,
         cut_in_wind_speed_mps=3.0, rated_wind_speed_mps=13.0, cut_out_wind_speed_mps=25.0,
         power_coefficient=0.40, tip_speed_ratio=8.0, air_density_kg_m3=1.18),
    dict(name="T-03", latitude=42.7413, longitude=25.3899, capacity_mw=2.0,
         rotor_diameter_m=112.0, hub_height_m=94.0,
         cut_in_wind_speed_mps=3.0, rated_wind_speed_mps=13.0, cut_out_wind_speed_mps=25.0,
         power_coefficient=0.40, tip_speed_ratio=8.0, air_density_kg_m3=1.18),
    dict(name="T-04", latitude=42.7425, longitude=25.3875, capacity_mw=2.0,
         rotor_diameter_m=112.0, hub_height_m=94.0,
         cut_in_wind_speed_mps=3.0, rated_wind_speed_mps=13.0, cut_out_wind_speed_mps=25.0,
         power_coefficient=0.40, tip_speed_ratio=8.0, air_density_kg_m3=1.18),
    dict(name="T-05", latitude=42.7437, longitude=25.3851, capacity_mw=2.0,
         rotor_diameter_m=112.0, hub_height_m=94.0,
         cut_in_wind_speed_mps=3.0, rated_wind_speed_mps=13.0, cut_out_wind_speed_mps=25.0,
         power_coefficient=0.40, tip_speed_ratio=8.0, air_density_kg_m3=1.18),
]

SEED_PARAMETERS = [
    # Geometry
    dict(field="rotor_diameter_m", symbol="D", example="112.0 m",
         purpose="Diameter of the rotor; used to calculate swept area A = π(D/2)²",
         category="geometry", sort_order=1),
    dict(field="hub_height_m", symbol="H", example="94.0 m",
         purpose="Height of the hub above ground; affects wind speed via the wind shear profile",
         category="geometry", sort_order=2),
    # Operational limits
    dict(field="cut_in_wind_speed_mps", symbol="v_ci", example="3.0 m/s",
         purpose="Minimum wind speed at which the turbine begins generating power",
         category="operational", sort_order=3),
    dict(field="rated_wind_speed_mps", symbol="v_r", example="13.0 m/s",
         purpose="Wind speed at which the turbine reaches its rated (maximum) power output",
         category="operational", sort_order=4),
    dict(field="cut_out_wind_speed_mps", symbol="v_co", example="25.0 m/s",
         purpose="Wind speed at which the turbine shuts down to prevent structural damage",
         category="operational", sort_order=5),
    dict(field="capacity_mw", symbol="P_r", example="2.0 MW",
         purpose="Nameplate rated power; actual output is always capped at this value",
         category="operational", sort_order=6),
    # Aerodynamic
    dict(field="power_coefficient", symbol="Cp", example="0.40",
         purpose="Fraction of wind energy the rotor captures; the Betz limit sets the theoretical maximum at 0.593",
         category="aerodynamic", sort_order=7),
    dict(field="tip_speed_ratio", symbol="λ", example="8.0",
         purpose="Ratio of blade tip speed to wind speed; determines rotor RPM via λ = ωR/v",
         category="aerodynamic", sort_order=8),
    # Environmental
    dict(field="air_density_kg_m3", symbol="ρ", example="1.18 kg/m³",
         purpose="Mass of air per cubic metre; decreases with altitude. Sea level is 1.225; Buzludzha (~1 350 m) is ~1.18",
         category="environmental", sort_order=9),
    # Equations
    dict(field="P_wind", symbol="½ρAv³", example="½ × 1.18 × 9 852 m² × 10³ = 579 kW",
         purpose="Theoretical power available in the wind passing through swept area A — the ceiling before applying Cp",
         category="equation", sort_order=10),
    dict(field="P_actual", symbol="½ρAv³·Cp", example="579 kW × 0.40 = 232 kW at 10 m/s",
         purpose="Actual electrical output: wind power multiplied by the power coefficient, capped at rated capacity",
         category="equation", sort_order=11),
    dict(field="rotor_rpm", symbol="λv·60/(2πR)", example="8 × 10 × 60 / (2π × 56) ≈ 13.6 RPM",
         purpose="Revolutions per minute of the rotor; derived from tip speed ratio, wind speed, and blade radius",
         category="equation", sort_order=12),
    dict(field="betz_limit", symbol="Cp_max = 16/27", example="0.593",
         purpose="Maximum fraction of wind kinetic energy that any turbine can theoretically extract, proven by Albert Betz in 1919",
         category="equation", sort_order=13),
    dict(field="capacity_factor", symbol="CF", example="30 %",
         purpose="Actual annual energy output divided by what the turbine would produce running at full rated power for 8 760 hours",
         category="equation", sort_order=14),
    # Pitch
    dict(field="pitch_angle", symbol="β", example="0°–90°",
         purpose="Blade pitch angle; rotated toward feather to shed load at high wind speeds",
         category="pitch", sort_order=15),
    dict(field="feather_angle", symbol="β_feather", example="90°",
         purpose="Fully feathered angle that stops aerodynamic lift during emergency shutdown",
         category="pitch", sort_order=16),
    dict(field="pitch_rate", symbol="dβ/dt", example="8 °/s",
         purpose="Maximum speed at which the blade pitch can change; limits control response",
         category="pitch", sort_order=17),
    # Yaw
    dict(field="yaw_error", symbol="θ_yaw", example="5°",
         purpose="Angle between rotor axis and wind direction; small errors significantly reduce power",
         category="yaw", sort_order=18),
    dict(field="yaw_power_loss", symbol="cos²(θ)", example="cos²(10°) ≈ 0.970",
         purpose="Power retained under yaw misalignment — proportional to cosine squared of the error angle",
         category="yaw", sort_order=19),
    # Tower
    dict(field="tower_1p", symbol="Ω/2π", example="≈0.22 Hz at 10 m/s",
         purpose="Once-per-revolution (1P) excitation frequency; tower natural freq must avoid this",
         category="tower", sort_order=20),
    dict(field="tower_soft_stiff", symbol="f_n", example="0.28 Hz",
         purpose="Soft-stiff design places natural frequency between 1P and 3P to avoid resonance",
         category="tower", sort_order=21),
    # Wake
    dict(field="wake_deficit_jensen", symbol="V_wake/V∞", example="≈0.85 at 500 m",
         purpose="Fractional wind speed in the wake; Jensen top-hat model predicts downstream loss",
         category="wake", sort_order=22),
    dict(field="thrust_coefficient", symbol="Ct", example="0.8",
         purpose="Ratio of thrust force to dynamic pressure; governs how much momentum is extracted",
         category="wake", sort_order=23),
    dict(field="wake_decay", symbol="k", example="0.04 (onshore)",
         purpose="Wake expansion rate constant; higher values mean faster wake recovery",
         category="wake", sort_order=24),
    dict(field="turbulence_intensity", symbol="I", example="0.06",
         purpose="Standard deviation of wind speed divided by mean; drives fatigue loading and wake recovery",
         category="wake", sort_order=25),
    # Aerodynamic
    dict(field="rotor_solidity", symbol="σ", example="0.03–0.05",
         purpose="Ratio of total blade area to rotor disk area; affects Cp and structural loads",
         category="aerodynamic", sort_order=26),
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    _seed(engine)
    yield


def _seed(engine):
    from app.models.turbine import Turbine
    from app.models.parameter import TurbineParameter
    from app.models.pitch_system import PitchSystem
    from app.models.yaw_system import YawSystem
    from app.models.tower import Tower
    from app.models.wake_model import WakeModel

    with Session(engine) as session:
        # Seed turbines if table is empty
        if not session.exec(select(Turbine)).first():
            for data in SEED_TURBINES:
                session.add(Turbine(**data, current_output_mw=0.0))
            session.commit()

        # Seed any missing parameters (keyed by field name)
        existing_fields = {p.field for p in session.exec(select(TurbineParameter)).all()}
        new_params = [d for d in SEED_PARAMETERS if d["field"] not in existing_fields]
        if new_params:
            for data in new_params:
                session.add(TurbineParameter(**data))
            session.commit()

        # Seed component models if tables are empty
        if not session.exec(select(PitchSystem)).first():
            for t in session.exec(select(Turbine)).all():
                session.add(PitchSystem(turbine_id=t.id))
            session.commit()

        if not session.exec(select(YawSystem)).first():
            for t in session.exec(select(Turbine)).all():
                session.add(YawSystem(turbine_id=t.id))
            session.commit()

        if not session.exec(select(Tower)).first():
            for t in session.exec(select(Turbine)).all():
                session.add(Tower(turbine_id=t.id))
            session.commit()

        if not session.exec(select(WakeModel)).first():
            for t in session.exec(select(Turbine)).all():
                session.add(WakeModel(turbine_id=t.id))
            session.commit()


app = FastAPI(title="High Power API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(turbine.router)
app.include_router(parameter.router)
app.include_router(components.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
