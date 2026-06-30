from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class Message(BaseModel):
    detail: str


class EmpresaBase(BaseModel):
    nombre: str
    slug: str


class EmpresaCreate(EmpresaBase):
    pass


class EmpresaRead(EmpresaBase):
    id: UUID
    creada_en: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoriaBase(BaseModel):
    nombre: str
    orden: int = 0
    activa: bool = True


class CategoriaCreate(CategoriaBase):
    empresa_id: UUID


class CategoriaRead(CategoriaBase):
    id: UUID
    empresa_id: UUID

    model_config = ConfigDict(from_attributes=True)


class ProductoBase(BaseModel):
    nombre: str
    descripcion: str = ""
    precio: Decimal
    imagen_url: str = ""
    disponible: bool = True


class ProductoCreate(ProductoBase):
    empresa_id: UUID
    categoria_id: UUID | None = None


class ProductoRead(ProductoBase):
    id: UUID
    empresa_id: UUID
    categoria_id: UUID | None

    model_config = ConfigDict(from_attributes=True)
