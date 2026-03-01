from typing import Optional
from sqlmodel import Field, SQLModel


class Blade(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    turbine_id: int = Field(foreign_key="turbine.id", index=True)
    blade_length_m: float = Field(default=56.0)            # half of rotor diameter
    material: str = Field(default="fiberglass")            # "fiberglass" | "carbon_fiber" | "hybrid"
    manufacturing_method: str = Field(default="resin_infusion")  # "hand_layup" | "resin_infusion" | "prepreg"
    mass_kg: float = Field(default=12000.0)                # single blade mass
    max_chord_m: float = Field(default=4.2)                # widest point of airfoil cross-section
    root_chord_m: float = Field(default=3.0)               # chord at blade root
    total_twist_deg: float = Field(default=13.0)           # geometric twist root-to-tip
    airfoil_family: str = Field(default="NREL S-series")   # "NACA" | "NREL S-series" | "FFA-W3" | "DU"
    design_tip_speed_ratio: float = Field(default=8.0)     # optimal lambda
    pre_bend_m: float = Field(default=3.0)                 # out-of-plane pre-bend at tip (tower clearance)
    num_blades: int = Field(default=3)                     # always 3 for HAWT; stored for reference
