import uuid as _uuid

from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    creada_en: Column = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class TenantMixin:
    """Mixin que añade empresa_id a modelos que pertenecen a un tenant."""

    empresa_id: Column = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
        comment="Identificador del inquilino (multi-tenant)",
    )
