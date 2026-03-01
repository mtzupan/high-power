"""add gearbox, generator, blade models

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-02-28 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Gearbox must be created before Generator (Generator has FK to gearbox)
    op.create_table(
        'gearbox',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('turbine_id', sa.Integer(), nullable=False),
        sa.Column('gear_ratio', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('num_stages', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('stage_configuration', sa.String(), nullable=False, server_default='planetary-helical-helical'),
        sa.Column('efficiency', sa.Float(), nullable=False, server_default='0.97'),
        sa.Column('lubrication_type', sa.String(), nullable=False, server_default='forced_oil'),
        sa.Column('input_speed_rpm', sa.Float(), nullable=False, server_default='15.0'),
        sa.Column('output_speed_rpm', sa.Float(), nullable=False, server_default='1500.0'),
        sa.Column('mass_tonnes', sa.Float(), nullable=False, server_default='50.0'),
        sa.ForeignKeyConstraint(['turbine_id'], ['turbine.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('gearbox', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_gearbox_turbine_id'), ['turbine_id'], unique=False)

    op.create_table(
        'generator',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('turbine_id', sa.Integer(), nullable=False),
        sa.Column('gearbox_id', sa.Integer(), nullable=True),
        sa.Column('generator_type', sa.String(), nullable=False, server_default='DFIG'),
        sa.Column('rated_power_kw', sa.Float(), nullable=False, server_default='2000.0'),
        sa.Column('rated_voltage_v', sa.Float(), nullable=False, server_default='690.0'),
        sa.Column('rated_speed_rpm', sa.Float(), nullable=False, server_default='1500.0'),
        sa.Column('pole_pairs', sa.Integer(), nullable=False, server_default='2'),
        sa.Column('efficiency', sa.Float(), nullable=False, server_default='0.95'),
        sa.Column('power_factor', sa.Float(), nullable=False, server_default='0.90'),
        sa.Column('cooling_type', sa.String(), nullable=False, server_default='air'),
        sa.Column('mass_tonnes', sa.Float(), nullable=False, server_default='70.0'),
        sa.ForeignKeyConstraint(['turbine_id'], ['turbine.id']),
        sa.ForeignKeyConstraint(['gearbox_id'], ['gearbox.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('generator', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_generator_turbine_id'), ['turbine_id'], unique=False)

    op.create_table(
        'blade',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('turbine_id', sa.Integer(), nullable=False),
        sa.Column('blade_length_m', sa.Float(), nullable=False, server_default='56.0'),
        sa.Column('material', sa.String(), nullable=False, server_default='fiberglass'),
        sa.Column('manufacturing_method', sa.String(), nullable=False, server_default='resin_infusion'),
        sa.Column('mass_kg', sa.Float(), nullable=False, server_default='12000.0'),
        sa.Column('max_chord_m', sa.Float(), nullable=False, server_default='4.2'),
        sa.Column('root_chord_m', sa.Float(), nullable=False, server_default='3.0'),
        sa.Column('total_twist_deg', sa.Float(), nullable=False, server_default='13.0'),
        sa.Column('airfoil_family', sa.String(), nullable=False, server_default='NREL S-series'),
        sa.Column('design_tip_speed_ratio', sa.Float(), nullable=False, server_default='8.0'),
        sa.Column('pre_bend_m', sa.Float(), nullable=False, server_default='3.0'),
        sa.Column('num_blades', sa.Integer(), nullable=False, server_default='3'),
        sa.ForeignKeyConstraint(['turbine_id'], ['turbine.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('blade', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_blade_turbine_id'), ['turbine_id'], unique=False)


def downgrade() -> None:
    with op.batch_alter_table('blade', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_blade_turbine_id'))
    op.drop_table('blade')

    with op.batch_alter_table('generator', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_generator_turbine_id'))
    op.drop_table('generator')

    with op.batch_alter_table('gearbox', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_gearbox_turbine_id'))
    op.drop_table('gearbox')
