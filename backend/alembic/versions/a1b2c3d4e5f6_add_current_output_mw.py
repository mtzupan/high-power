"""add current_output_mw column

Revision ID: a1b2c3d4e5f6
Revises: 22030ecf5f08
Create Date: 2026-02-16 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '22030ecf5f08'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('turbine', schema=None) as batch_op:
        batch_op.add_column(sa.Column('current_output_mw', sa.Float(), nullable=False, server_default='0.0'))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('turbine', schema=None) as batch_op:
        batch_op.drop_column('current_output_mw')
