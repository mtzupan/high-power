"""add physics fields to turbine and create turbineparameter table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-18 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add physics columns to turbine table
    with op.batch_alter_table('turbine', schema=None) as batch_op:
        batch_op.add_column(sa.Column('rotor_diameter_m', sa.Float(), nullable=False, server_default='112.0'))
        batch_op.add_column(sa.Column('hub_height_m', sa.Float(), nullable=False, server_default='94.0'))
        batch_op.add_column(sa.Column('cut_in_wind_speed_mps', sa.Float(), nullable=False, server_default='3.0'))
        batch_op.add_column(sa.Column('rated_wind_speed_mps', sa.Float(), nullable=False, server_default='13.0'))
        batch_op.add_column(sa.Column('cut_out_wind_speed_mps', sa.Float(), nullable=False, server_default='25.0'))
        batch_op.add_column(sa.Column('power_coefficient', sa.Float(), nullable=False, server_default='0.4'))
        batch_op.add_column(sa.Column('tip_speed_ratio', sa.Float(), nullable=False, server_default='8.0'))
        batch_op.add_column(sa.Column('air_density_kg_m3', sa.Float(), nullable=False, server_default='1.225'))

    # Create turbineparameter table
    op.create_table(
        'turbineparameter',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('field', sa.String(), nullable=False),
        sa.Column('symbol', sa.String(), nullable=True),
        sa.Column('example', sa.String(), nullable=False),
        sa.Column('purpose', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('turbineparameter', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_turbineparameter_field'), ['field'], unique=False)


def downgrade() -> None:
    with op.batch_alter_table('turbineparameter', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_turbineparameter_field'))
    op.drop_table('turbineparameter')

    with op.batch_alter_table('turbine', schema=None) as batch_op:
        batch_op.drop_column('air_density_kg_m3')
        batch_op.drop_column('tip_speed_ratio')
        batch_op.drop_column('power_coefficient')
        batch_op.drop_column('cut_out_wind_speed_mps')
        batch_op.drop_column('rated_wind_speed_mps')
        batch_op.drop_column('cut_in_wind_speed_mps')
        batch_op.drop_column('hub_height_m')
        batch_op.drop_column('rotor_diameter_m')
