from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user, get_supabase
from schemas import (
    ActualizarEstadoRequest,
    CrearPedidoRequest,
    PedidoDetalleOut,
    PedidoOut,
    PedidoProductoOut,
)

router = APIRouter(prefix="/v1/pedidos", tags=["pedidos"])


@router.get("", response_model=list[PedidoOut])
def listar_pedidos():
    supabase = get_supabase()
    resultado = supabase.table("pedidos").select("*").execute()
    pedidos = resultado.data

    if pedidos:
        ids = [p["id"] for p in pedidos]
        items_res = (
            supabase.table("pedido_productos")
            .select("pedido_id")
            .in_("pedido_id", ids)
            .execute()
        )
        from collections import Counter
        count_map = Counter(c["pedido_id"] for c in items_res.data)
        for p in pedidos:
            p["total_items"] = count_map.get(p["id"], 0)

    return pedidos


@router.get("/{pedido_id}", response_model=PedidoDetalleOut)
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

    items = (
        supabase.table("pedido_productos")
        .select("id, producto_id, cantidad, precio_unitario, subtotal, productos!inner(nombre)")
        .eq("pedido_id", str(pedido_id))
        .execute()
    )

    pedido = resultado.data
    items_list = [
        {
            "id": i["id"],
            "producto_id": i["producto_id"],
            "nombre": i["productos"]["nombre"],
            "cantidad": i["cantidad"],
            "precio_unitario": i["precio_unitario"],
            "subtotal": i["subtotal"],
        }
        for i in items.data
    ]
    pedido["items"] = items_list
    pedido["total_items"] = len(items_list)
    return pedido


@router.post("", response_model=PedidoDetalleOut, status_code=201)
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

    # Fetch product names for the response
    items_res = (
        supabase.table("pedido_productos")
        .select("id, producto_id, cantidad, precio_unitario, subtotal, productos!inner(nombre)")
        .eq("pedido_id", pedido_id)
        .execute()
    )

    pedido_out = pedido.data[0]
    items_list = [
        {
            "id": i["id"],
            "producto_id": i["producto_id"],
            "nombre": i["productos"]["nombre"],
            "cantidad": i["cantidad"],
            "precio_unitario": i["precio_unitario"],
            "subtotal": i["subtotal"],
        }
        for i in items_res.data
    ]
    pedido_out["items"] = items_list
    pedido_out["total_items"] = len(items_list)
    return pedido_out


@router.patch("/{pedido_id}/estado", response_model=PedidoDetalleOut)
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

    items = (
        supabase.table("pedido_productos")
        .select("id, producto_id, cantidad, precio_unitario, subtotal, productos!inner(nombre)")
        .eq("pedido_id", str(pedido_id))
        .execute()
    )

    pedido = resultado.data[0]
    items_list = [
        {
            "id": i["id"],
            "producto_id": i["producto_id"],
            "nombre": i["productos"]["nombre"],
            "cantidad": i["cantidad"],
            "precio_unitario": i["precio_unitario"],
            "subtotal": i["subtotal"],
        }
        for i in items.data
    ]
    pedido["items"] = items_list
    pedido["total_items"] = len(items_list)
    return pedido
