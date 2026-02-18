"""add component models: pitchsystem, yawsystem, tower, wakemodel

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-02-18 13:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'pitchsystem',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('turbine_id', sa.Integer(), nullable=False),
        sa.Column('actuator_type', sa.String(), nullable=False, server_default='electric'),
        sa.Column('control_type', sa.String(), nullable=False, server_default='individual'),
        sa.Column('pitch_rate_deg_per_s', sa.Float(), nullable=False, server_default='8.0'),
        sa.Column('fine_pitch_angle_deg', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('feather_angle_deg', sa.Float(), nullable=False, server_default='90.0'),
        sa.ForeignKeyConstraint(['turbine_id'], ['turbine.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('pitchsystem', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_pitchsystem_turbine_id'), ['turbine_id'], unique=False)

    op.create_table(
        'yawsystem',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('turbine_id', sa.Integer(), nullable=False),
        sa.Column('drive_type', sa.String(), nullable=False, server_default='active'),
        sa.Column('num_drives', sa.Integer(), nullable=False, server_default='4'),
        sa.Column('yaw_rate_deg_per_s', sa.Float(), nullable=False, server_default='0.5'),
        sa.Column('activation_threshold_deg', sa.Float(), nullable=False, server_default='5.0'),
        sa.Column('brake_torque_kNm', sa.Float(), nullable=False, server_default='400.0'),
        sa.ForeignKeyConstraint(['turbine_id'], ['turbine.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('yawsystem', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_yawsystem_turbine_id'), ['turbine_id'], unique=False)

    op.create_table(
        'tower',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('turbine_id', sa.Integer(), nullable=False),
        sa.Column('hub_height_m', sa.Float(), nullable=False, server_default='94.0'),
        sa.Column('base_diameter_m', sa.Float(), nullable=False, server_default='4.5'),
        sa.Column('top_diameter_m', sa.Float(), nullable=False, server_default='2.3'),
        sa.Column('wall_thickness_mm', sa.Float(), nullable=False, server_default='30.0'),
        sa.Column('material', sa.String(), nullable=False, server_default='steel'),
        sa.Column('mass_tonnes', sa.Float(), nullable=False, server_default='250.0'),
        sa.Column('first_nat_freq_hz', sa.Float(), nullable=False, server_default='0.28'),
        sa.ForeignKeyConstraint(['turbine_id'], ['turbine.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('tower', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_tower_turbine_id'), ['turbine_id'], unique=False)

    op.create_table(
        'wakemodel',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('turbine_id', sa.Integer(), nullable=False),
        sa.Column('model_type', sa.String(), nullable=False, server_default='jensen'),
        sa.Column('thrust_coefficient', sa.Float(), nullable=False, server_default='0.8'),
        sa.Column('wake_decay_constant', sa.Float(), nullable=False, server_default='0.04'),
        sa.Column('ambient_turbulence_intensity', sa.Float(), nullable=False, server_default='0.06'),
        sa.ForeignKeyConstraint(['turbine_id'], ['turbine.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('wakemodel', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_wakemodel_turbine_id'), ['turbine_id'], unique=False)


def downgrade() -> None:
    with op.batch_alter_table('wakemodel', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_wakemodel_turbine_id'))
    op.drop_table('wakemodel')

    with op.batch_alter_table('tower', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tower_turbine_id'))
    op.drop_table('tower')

    with op.batch_alter_table('yawsystem', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_yawsystem_turbine_id'))
    op.drop_table('yawsystem')

    with op.batch_alter_table('pitchsystem', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_pitchsystem_turbine_id'))
    op.drop_table('pitchsystem')
