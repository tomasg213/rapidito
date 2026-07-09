from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user, get_supabase
from schemas import (
    ActualizarEstadoRequest,
    CrearPedidoRequest,
    PedidoOut,
)

router = APIRouter(prefix="/v1/pedidos", tags=["pedidos"])


@router.get("", response_model=list[PedidoOut])
def listar_pedidos():
    supabase = get_supabase()
    resultado = supabase.table("pedidos").select("*").execute()
    return resultado.data


@router.get("/{pedido_id}", response_model=PedidoOut)
def obtener_pedido(pedido_id: UUID):
    supabase = get_supabase()
    resultado = (
        supabase.table("pedidos")
        .select("*")
        .eq("id", str(pedido_id))
        .single()
        .execute()
    )
    if not resultado.data:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return resultado.data


@router.post("", response_model=PedidoOut, status_code=201)
def crear_pedido(
    body: CrearPedidoRequest,
    usuario: dict = Depends(get_current_user),
):
    supabase = get_supabase()

    monto_total = sum(p.cantidad * p.precio_unitario for p in body.productos)

    pedido_payload = {
        "cliente_id": usuario["id"],
        "comercio_id": str(body.comercio_id),
        "monto_total": str(monto_total),
        "direccion_texto": body.direccion_texto,
        "referencia": body.referencia,
    }

    pedido = supabase.table("pedidos").insert(pedido_payload).execute()
    pedido_id = pedido.data[0]["id"]

    lineas = [
        {
            "pedido_id": pedido_id,
            "producto_id": str(p.producto_id),
            "cantidad": p.cantidad,
            "precio_unitario": str(p.precio_unitario),
            "subtotal": str(p.cantidad * p.precio_unitario),
        }
        for p in body.productos
    ]

    supabase.table("pedido_productos").insert(lineas).execute()

    return pedido.data[0]


@router.patch("/{pedido_id}/estado", response_model=PedidoOut)
def actualizar_estado(
    pedido_id: UUID,
    body: ActualizarEstadoRequest,
):
    supabase = get_supabase()
    resultado = (
        supabase.table("pedidos")
        .update({"estado": body.estado})
        .eq("id", str(pedido_id))
        .execute()
    )

    if not resultado.data:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    return resultado.data[0]
