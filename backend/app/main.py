from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.routers import turbine, parameter


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
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    _seed(engine)
    yield


def _seed(engine):
    from app.models.turbine import Turbine
    from app.models.parameter import TurbineParameter

    with Session(engine) as session:
        # Seed turbines if table is empty
        if not session.exec(select(Turbine)).first():
            for data in SEED_TURBINES:
                session.add(Turbine(**data, current_output_mw=0.0))
            session.commit()

        # Seed parameters if table is empty
        if not session.exec(select(TurbineParameter)).first():
            for data in SEED_PARAMETERS:
                session.add(TurbineParameter(**data))
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


@app.get("/health")
def health_check():
    return {"status": "ok"}
