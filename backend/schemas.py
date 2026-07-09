from decimal import Decimal
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, field_validator


# ---------------------------------------------------------------------------
# Pedidos
# ---------------------------------------------------------------------------

ESTADOS_VALIDOS: set[str] = {
    "pendiente",
    "en_preparacion",
    "en_camino",
    "entregado",
    "cancelado",
}


class ActualizarEstadoRequest(BaseModel):
    estado: str

    @field_validator("estado")
    @classmethod
    def estado_debe_ser_valido(cls, v: str) -> str:
        if v not in ESTADOS_VALIDOS:
            raise ValueError(
                f"Estado inválido. Debe ser uno de: {', '.join(sorted(ESTADOS_VALIDOS))}"
            )
        return v


class PedidoOut(BaseModel):
    id: UUID
    cliente_id: UUID
    comercio_id: UUID
    repartidor_id: UUID | None
    monto_total: Decimal
    direccion_texto: str
    referencia: str | None
    estado: str
    created_at: datetime
    total_items: int = 0


class PedidoProductoOut(BaseModel):
    id: UUID
    producto_id: UUID
    nombre: str | None = None
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal


class PedidoDetalleOut(PedidoOut):
    items: list[PedidoProductoOut]


class PedidoProductoIn(BaseModel):
    producto_id: UUID
    cantidad: int
    precio_unitario: Decimal


class CrearPedidoRequest(BaseModel):
    comercio_id: UUID
    direccion_texto: str
    referencia: str | None = None
    productos: list[PedidoProductoIn]


# ---------------------------------------------------------------------------
# Comercios
# ---------------------------------------------------------------------------

class ComercioOut(BaseModel):
    id: UUID
    propietario_id: UUID
    nombre: str
    descripcion: str | None
    categoria: str | None
    activo: bool
    created_at: datetime


class CrearComercioRequest(BaseModel):
    nombre: str
    descripcion: str | None = None
    categoria: str | None = None


class ActualizarComercioRequest(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    categoria: str | None = None
    activo: bool | None = None


# ---------------------------------------------------------------------------
# Productos
# ---------------------------------------------------------------------------

class ProductoOut(BaseModel):
    id: UUID
    comercio_id: UUID
    nombre: str
    descripcion: str | None
    precio: Decimal
    disponible: bool
    created_at: datetime


class CrearProductoRequest(BaseModel):
    nombre: str
    descripcion: str | None = None
    precio: Decimal
    disponible: bool = True


class ActualizarProductoRequest(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    precio: Decimal | None = None
    disponible: bool | None = None


# ---------------------------------------------------------------------------
# Usuario / Auth
# ---------------------------------------------------------------------------

class UsuarioOut(BaseModel):
    id: UUID
    nombre: str
    telefono: str | None = None
    direccion: str | None = None
    rol: str
    created_at: datetime


class ActualizarUsuarioRequest(BaseModel):
    nombre: str | None = None
    telefono: str | None = None
    direccion: str | None = None


# ---------------------------------------------------------------------------
# Direcciones
# ---------------------------------------------------------------------------

class DireccionOut(BaseModel):
    id: UUID
    usuario_id: UUID
    nombre: str
    direccion: str
    created_at: datetime


class CrearDireccionRequest(BaseModel):
    nombre: str
    direccion: str


class ActualizarDireccionRequest(BaseModel):
    nombre: str | None = None
    direccion: str | None = None
